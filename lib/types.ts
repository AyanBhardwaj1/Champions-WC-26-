export type Position = "GK" | "DEF" | "MID" | "FWD";
export type FormationName = "4-3-3" | "4-4-2" | "3-5-2";

export type RatingInputs = {
  appearances: number;
  starts: number;
  estimatedMinutes: number;
  goals: number;
  assists: null;
  teamFinish: string;
  teamSuccessModifier: number;
  statsCoverage: string;
};

export type DraftPlayer = {
  id: string;
  playerId: string;
  name: string;
  nation: string;
  nationCode: string;
  year: number;
  position: Position;
  subPosition: string;
  rating: number;
  inputs: RatingInputs;
};

export type HistoricSquad = {
  id: string;
  nation: string;
  nationCode: string;
  year: number;
  finish: string;
  players: DraftPlayer[];
};

export type FormationSlot = {
  id: string;
  label: string;
  position: Position;
  x: number;
  y: number;
};

export type DraftPick = {
  player: DraftPlayer;
  slotId: string;
  squadId: string;
};

export type FieldTeam = {
  team: string;
  group: string;
  fifaRanking: number;
  fifaPoints: number;
  strengthRating: number;
};

export type MatchStage = "Group stage" | "Round of 32" | "Round of 16" | "Quarterfinal" | "Semifinal" | "Final";

export type SimMatch = {
  id: string;
  stage: MatchStage;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  afterExtraTime: boolean;
  penalties: null | { home: number; away: number };
  winner: string | null;
  customTeamPlayed: boolean;
  customOutcome: "W" | "D" | "L" | null;
  customOpponent: string | null;
};

export type TableRow = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  fairPlay: number;
  qualified?: boolean;
};

export type TournamentResult = {
  id?: string;
  seed: number;
  createdAt: string;
  teamName: string;
  replacedTeam: string;
  group: string;
  formation: FormationName;
  xi: DraftPick[];
  squadRating: number;
  groupTable: TableRow[];
  allGroupTables: Record<string, TableRow[]>;
  path: SimMatch[];
  allMatches: SimMatch[];
  record: { wins: number; draws: number; losses: number };
  goalsFor: number;
  goalsAgainst: number;
  reached: string;
  champion: boolean;
  perfect: boolean;
};
