// ================================================================
// STORAGE: tables
// Phase 1 → localStorage
// Phase 2 → replace with: /api/tables
// ================================================================

import type { Table, ClubUser } from "@/types";

const key = (email: string) => `club_tables_${email}`;

export function getTables(email: string, user: ClubUser): Table[] {
  // PHASE 1 ↓
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key(email));
  if (raw) return JSON.parse(raw) as Table[];
  // Default: create tables based on club's table count
  return Array.from({ length: user.tables }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
    status: "available" as const,
    session: null,
  }));
  // PHASE 2 → return fetch('/api/tables').then(r => r.json())
}

export function saveTables(email: string, tables: Table[]): void {
  // PHASE 1 ↓
  localStorage.setItem(key(email), JSON.stringify(tables));
  // PHASE 2 → fetch('/api/tables', { method: 'PUT', body: JSON.stringify(tables) })
}
