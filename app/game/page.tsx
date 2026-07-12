import type { Metadata } from "next";
import { GameClient } from "../../components/game/game-client";

export const metadata: Metadata = {
  title: "Draft Room · Champions (WC 26)",
  description: "Spin through World Cup history, draft an all-time XI and chase the perfect 8–0.",
};

export default function GamePage() {
  return <GameClient />;
}
