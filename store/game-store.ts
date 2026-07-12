"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftPick, DraftPlayer, FormationName, HistoricSquad, TournamentResult } from "../lib/types";

type GamePhase = "setup" | "draft" | "entry" | "simulation";

type GameState = {
  formation: FormationName;
  phase: GamePhase;
  picks: DraftPick[];
  currentSquad: HistoricSquad | null;
  usedSquads: string[];
  result: TournamentResult | null;
  setFormation: (formation: FormationName) => void;
  beginDraft: () => void;
  setCurrentSquad: (squad: HistoricSquad | null) => void;
  assignPlayer: (player: DraftPlayer, slotId: string) => void;
  removePick: (slotId: string) => void;
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
      result: null,
      setFormation: (formation) => set({ formation, picks: [], currentSquad: null, usedSquads: [], phase: "setup", result: null }),
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
          phase: picks.length === 11 ? "entry" : "draft",
        });
      },
      removePick: (slotId) => set((state) => ({ picks: state.picks.filter((pick) => pick.slotId !== slotId) })),
      beginSimulation: () => set({ phase: "simulation" }),
      returnToEntry: () => set({ phase: "entry" }),
      setResult: (result) => set({ result }),
      reset: () => set({ formation: "4-3-3", phase: "setup", picks: [], currentSquad: null, usedSquads: [], result: null }),
    }),
    {
      name: "champions-wc26-game",
      partialize: (state) => ({
        formation: state.formation,
        phase: state.phase,
        picks: state.picks,
        currentSquad: state.currentSquad,
        usedSquads: state.usedSquads,
        result: state.result,
      }),
    },
  ),
);
