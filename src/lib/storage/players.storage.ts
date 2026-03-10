// ================================================================
// STORAGE: players
// Phase 1 → localStorage
// Phase 2 → replace with: /api/players
// ================================================================

import type { Player } from "@/types";

const key = (email: string) => `club_players_${email}`;

export function getPlayers(email: string): Player[] {
  // PHASE 1 ↓
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key(email));
  return raw ? (JSON.parse(raw) as Player[]) : [];
  // PHASE 2 → return fetch('/api/players').then(r => r.json())
}

export function savePlayers(email: string, players: Player[]): void {
  // PHASE 1 ↓
  localStorage.setItem(key(email), JSON.stringify(players));
  // PHASE 2 → fetch('/api/players', { method: 'PUT', body: JSON.stringify(players) })
}
