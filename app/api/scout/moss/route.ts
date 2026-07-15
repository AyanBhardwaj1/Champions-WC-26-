import { NextResponse } from "next/server";
import { connectMossScout, friendlyMossError, searchMossScout } from "../../../../lib/moss-scout";
import type { Position } from "../../../../lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const positions = new Set<Position>(["GK", "DEF", "MID", "FWD"]);

function readCredentials(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const projectId = "projectId" in value && typeof value.projectId === "string" ? value.projectId.trim() : "";
  const projectKey = "projectKey" in value && typeof value.projectKey === "string" ? value.projectKey.trim() : "";
  if (!projectId || !projectKey || projectId.length > 300 || projectKey.length > 500) return null;
  return { projectId, projectKey };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const credentials = readCredentials(body);
  if (!credentials) {
    return NextResponse.json({ error: "Enter both a Moss project ID and project key." }, { status: 400 });
  }

  const action = typeof body === "object" && body && "action" in body ? body.action : null;
  try {
    if (action === "connect") {
      const connection = await connectMossScout(credentials.projectId, credentials.projectKey);
      return NextResponse.json(connection, { headers: { "cache-control": "no-store" } });
    }

    if (action === "search") {
      const query = typeof body === "object" && body && "query" in body && typeof body.query === "string" ? body.query.trim() : "";
      if (query.length < 2 || query.length > 240) {
        return NextResponse.json({ error: "Use a search between 2 and 240 characters." }, { status: 400 });
      }
      const rawPosition = typeof body === "object" && body && "position" in body ? body.position : undefined;
      const position = typeof rawPosition === "string" && positions.has(rawPosition as Position) ? rawPosition as Position : undefined;
      const results = await searchMossScout({ ...credentials, query, position });
      return NextResponse.json(results, { headers: { "cache-control": "no-store" } });
    }

    return NextResponse.json({ error: "Unknown Moss Scout action." }, { status: 400 });
  } catch (error) {
    const friendly = friendlyMossError(error);
    return NextResponse.json({ error: friendly.message }, { status: friendly.status });
  }
}
