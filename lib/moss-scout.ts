import "server-only";

import { createHash } from "node:crypto";
import type { DraftPlayer, Position, ScoutSearchHit } from "./types";
import { explainScoutMatch, getScoutPlayer, SCOUT_DOCUMENTS, SCOUT_INDEX_NAME, SCOUT_PLAYERS } from "./scout-data";

type MossClientInstance = import("@moss-dev/moss").MossClient;

type ReadyMossClient = {
  client: MossClientInstance;
  ready: Promise<{ created: boolean; count: number }>;
  touchedAt: number;
};

declare global {
  var championsMossScoutClients: Map<string, ReadyMossClient> | undefined;
}

const mossClients = globalThis.championsMossScoutClients ?? new Map<string, ReadyMossClient>();
globalThis.championsMossScoutClients = mossClients;

function cacheKey(projectId: string, projectKey: string) {
  const fingerprint = createHash("sha256").update(projectKey).digest("hex").slice(0, 16);
  return `${projectId}:${fingerprint}`;
}

async function trimClientCache() {
  if (mossClients.size < 4) return;
  const oldest = [...mossClients.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt)[0];
  if (!oldest) return;
  mossClients.delete(oldest[0]);
  await oldest[1].client.close().catch(() => undefined);
}

async function getReadyClient(projectId: string, projectKey: string) {
  const key = cacheKey(projectId, projectKey);
  const cached = mossClients.get(key);
  if (cached) {
    cached.touchedAt = Date.now();
    return { client: cached.client, ...(await cached.ready) };
  }

  await trimClientCache();
  const { MossClient } = await import("@moss-dev/moss");
  const client = new MossClient(projectId, projectKey);
  const ready = (async () => {
    const indexes = await client.listIndexes();
    const existing = indexes.find((index) => index.name === SCOUT_INDEX_NAME);
    let created = false;

    if (!existing) {
      await client.createIndex(SCOUT_INDEX_NAME, SCOUT_DOCUMENTS, { modelId: "moss-minilm" });
      created = true;
    } else if (existing.docCount !== SCOUT_PLAYERS.length) {
      throw new Error(`The Moss index ${SCOUT_INDEX_NAME} has ${existing.docCount} documents instead of ${SCOUT_PLAYERS.length}.`);
    }

    await client.loadIndex(SCOUT_INDEX_NAME);
    return { created, count: SCOUT_PLAYERS.length };
  })();

  const entry: ReadyMossClient = { client, ready, touchedAt: Date.now() };
  mossClients.set(key, entry);

  try {
    return { client, ...(await ready) };
  } catch (error) {
    mossClients.delete(key);
    await client.close().catch(() => undefined);
    throw error;
  }
}

export async function connectMossScout(projectId: string, projectKey: string) {
  const startedAt = Date.now();
  const { created, count } = await getReadyClient(projectId, projectKey);
  return {
    created,
    count,
    indexName: SCOUT_INDEX_NAME,
    loadTimeMs: Date.now() - startedAt,
  };
}

export async function searchMossScout(input: {
  projectId: string;
  projectKey: string;
  query: string;
  position?: Position;
  topK?: number;
}) {
  const { client } = await getReadyClient(input.projectId, input.projectKey);
  const topK = Math.min(Math.max(input.topK ?? 18, 1), 30);
  const startedAt = Date.now();
  const result = await client.query(SCOUT_INDEX_NAME, input.query, {
    topK,
    alpha: 0.78,
    ...(input.position
      ? { filter: { field: "position", condition: { $eq: input.position } } }
      : {}),
  });

  const hits = result.docs.flatMap<ScoutSearchHit>((document) => {
    let player: DraftPlayer | null = null;
    if (document.payload) {
      try {
        player = JSON.parse(document.payload) as DraftPlayer;
      } catch {
        player = null;
      }
    }
    player ??= getScoutPlayer(document.id);
    if (!player) return [];
    return [{ player, score: document.score, explanation: explainScoutMatch(player) }];
  });

  return {
    hits,
    timeTakenMs: result.timeTakenInMs ?? Date.now() - startedAt,
    indexName: SCOUT_INDEX_NAME,
  };
}

export function friendlyMossError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  if (normalized.includes("401") || normalized.includes("403") || normalized.includes("unauthor") || normalized.includes("project key") || normalized.includes("authentication")) {
    return { status: 401, message: "Moss rejected those credentials. Check the project ID and project key, then try again." };
  }
  if (normalized.includes("limit") || normalized.includes("quota") || normalized.includes("maximum") || normalized.includes("indexes")) {
    return { status: 429, message: "This Moss project has reached an index or usage limit. Remove an unused index or check the project plan." };
  }
  if (normalized.includes("fetch") || normalized.includes("network") || normalized.includes("connect")) {
    return { status: 502, message: "The app could not reach Moss. Check your connection and try again." };
  }
  return { status: 500, message: "Moss could not prepare the player archive. Try again, or use Archive Browse while the connection is unavailable." };
}
