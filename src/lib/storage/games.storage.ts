// ================================================================
// STORAGE: games
// Phase 1 → localStorage
// Phase 2 → replace with: /api/games
// ================================================================

import type { GameType } from "@/types";

const key = (email: string) => `club_games_${email}`;

export const DEFAULT_GAMES: GameType[] = [
  {
    id: "per-hour",
    name: "Per Hour",
    description: "Charged by time. Timer runs until session ends.",
    rate: 200,
    unit: "per hour",
    enabled: true,
    color: "blue",
    icon: "clock",
    isDefault: true,
  },
  {
    id: "full-frame",
    name: "Full Frame",
    description: "Complete game from start to finish. Fixed price.",
    rate: 100,
    unit: "per frame",
    enabled: true,
    color: "emerald",
    icon: "fullframe",
    isDefault: true,
  },
  {
    id: "6-balls",
    name: "6 Balls",
    description: "Game played with 6 balls. Popular quick game.",
    rate: 60,
    unit: "per game",
    enabled: true,
    color: "purple",
    icon: "6ball",
    isDefault: true,
  },
  {
    id: "3-balls",
    name: "3 Balls",
    description: "Quick game with only 3 balls. Fast and popular.",
    rate: 40,
    unit: "per game",
    enabled: true,
    color: "orange",
    icon: "3ball",
    isDefault: true,
  },
  {
    id: "1-ball",
    name: "1 Ball",
    description: "Single ball game. Simplest and cheapest option.",
    rate: 20,
    unit: "per game",
    enabled: false,
    color: "red",
    icon: "1ball",
    isDefault: true,
  },
];

export function getGames(email: string): GameType[] {
  // PHASE 1 ↓
  if (typeof window === "undefined") return DEFAULT_GAMES;
  const raw = localStorage.getItem(key(email));
  return raw ? (JSON.parse(raw) as GameType[]) : DEFAULT_GAMES;
  // PHASE 2 → return fetch('/api/games').then(r => r.json())
}

export function saveGames(email: string, games: GameType[]): void {
  // PHASE 1 ↓
  localStorage.setItem(key(email), JSON.stringify(games));
  // PHASE 2 → fetch('/api/games', { method: 'PUT', body: JSON.stringify(games) })
}
