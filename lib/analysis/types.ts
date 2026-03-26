export type EngineLine = {
  depth: number;
  multiPv: number;
  scoreCp: number | null;
  mate: number | null;
  pv: string[];
  bestMove: string | null;
};

export type EngineSnapshot = {
  fen: string;
  depth: number;
  lines: EngineLine[];
  loading: boolean;
};
