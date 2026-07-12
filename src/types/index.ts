export interface CountryData {
  name: string;
  code: string; // ISO 3166-1 alpha-2 (e.g., "af")
  capital?: string;
  continent?: string;
  flag: string;
  iso: boolean;
}

export type GameStatus = "idle" | "playing" | "game-over";
