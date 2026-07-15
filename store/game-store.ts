"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftPick, DraftPlayer, FormationName, HistoricSquad, MossReplacement, TournamentResult } from "../lib/types";

type GamePhase = "setup" | "draft" | "scout" | "entry" | "simulation";

type GameState = {
  formation: FormationName;
  phase: GamePhase;
  picks: DraftPick[];
  currentSquad: HistoricSquad | null;
  usedSquads: string[];
  scoutReplacement: MossReplacement | null;
  result: TournamentResult | null;
  setFormation: (formation: FormationName) => void;
  beginDraft: () => void;
  setCurrentSquad: (squad: HistoricSquad | null) => void;
  assignPlayer: (player: DraftPlayer, slotId: string) => void;
  removePick: (slotId: string) => void;
  openScout: () => void;
  skipScout: () => void;
  applyScoutReplacement: (player: DraftPlayer, slotId: string) => void;
  beginSimulation: () => void;
  returnToEntry: () => void;
  setResult: (result: TournamentResult) => void;
  reset: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      formation: "4-3-3",
      phase: "setup",
      picks: [],
      currentSquad: null,
      usedSquads: [],
      scoutReplacement: null,
      result: null,
      setFormation: (formation) => set({ formation, picks: [], currentSquad: null, usedSquads: [], scoutReplacement: null, phase: "setup", result: null }),
      beginDraft: () => set({ phase: "draft" }),
      setCurrentSquad: (currentSquad) => set({ currentSquad }),
      assignPlayer: (player, slotId) => {
        const state = get();
        if (!state.currentSquad || state.picks.some((pick) => pick.slotId === slotId)) return;
        const picks = [...state.picks, { player, slotId, squadId: state.currentSquad.id }];
        set({
          picks,
          usedSquads: [...state.usedSquads, state.currentSquad.id],
          currentSquad: null,
          phase: picks.length === 11 ? "scout" : "draft",
        });
      },
      removePick: (slotId) => set((state) => ({ picks: state.picks.filter((pick) => pick.slotId !== slotId) })),
      openScout: () => set((state) => state.phase === "entry" && !state.scoutReplacement && state.picks.length === 11 ? { phase: "scout" } : state),
      skipScout: () => set((state) => state.phase === "scout" ? { phase: "entry" } : state),
      applyScoutReplacement: (player, slotId) => {
        const state = get();
        if (state.phase !== "scout" || state.scoutReplacement || state.picks.some((pick) => pick.player.id === player.id)) return;
        const outgoing = state.picks.find((pick) => pick.slotId === slotId);
        if (!outgoing || outgoing.player.position !== player.position) return;
        const picks = state.picks.map((pick) => pick.slotId === slotId
          ? { player, slotId, squadId: `moss:${player.id}` }
          : pick);
        set({
          picks,
          phase: "entry",
          scoutReplacement: {
            outgoing: outgoing.player,
            incoming: player,
            slotId,
            completedAt: new Date().toISOString(),
          },
        });
      },
      beginSimulation: () => set({ phase: "simulation" }),
      returnToEntry: () => set({ phase: "entry" }),
      setResult: (result) => set({ result }),
      reset: () => set({ formation: "4-3-3", phase: "setup", picks: [], currentSquad: null, usedSquads: [], scoutReplacement: null, result: null }),
    }),
    {
      name: "champions-wc26-game",
      partialize: (state) => ({
        formation: state.formation,
        phase: state.phase,
        picks: state.picks,
        currentSquad: state.currentSquad,
        usedSquads: state.usedSquads,
        scoutReplacement: state.scoutReplacement,
        result: state.result,
      }),
    },
  ),
);
