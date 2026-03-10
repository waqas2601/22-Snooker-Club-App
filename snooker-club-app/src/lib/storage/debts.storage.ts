// ================================================================
// STORAGE: debts
// Phase 1 → localStorage
// Phase 2 → replace with: /api/debts
// ================================================================

import type { DebtsRecord } from "@/types";

const key = (email: string) => `club_debts_${email}`;

export function getDebts(email: string): DebtsRecord {
  // PHASE 1 ↓
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(key(email));
  return raw ? (JSON.parse(raw) as DebtsRecord) : {};
  // PHASE 2 → return fetch('/api/debts').then(r => r.json())
}

export function saveDebts(email: string, debts: DebtsRecord): void {
  // PHASE 1 ↓
  localStorage.setItem(key(email), JSON.stringify(debts));
  // PHASE 2 → fetch('/api/debts', { method: 'PUT', body: JSON.stringify(debts) })
}

export function addDebt(
  email: string,
  playerName: string,
  amount: number,
): void {
  const debts = getDebts(email);
  debts[playerName] = (debts[playerName] || 0) + amount;
  saveDebts(email, debts);
}

export function settleDebt(
  email: string,
  playerName: string,
  amount: number,
): void {
  const debts = getDebts(email);
  const current = debts[playerName] || 0;
  const remaining = Math.max(0, current - amount);
  if (remaining === 0) {
    delete debts[playerName];
  } else {
    debts[playerName] = remaining;
  }
  saveDebts(email, debts);
}
