// ================================================================
// STORAGE: auth
// Phase 1 → localStorage
// Phase 2 → replace with: POST /api/auth/login
// ================================================================

import type { ClubUser } from "@/types";

const KEY = "club_user";

export function getStoredUser(): ClubUser | null {
  // PHASE 1 ↓
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ClubUser) : null;
  // PHASE 2 → return fetch('/api/auth/me').then(r => r.json())
}

export function saveUser(user: ClubUser): void {
  // PHASE 1 ↓
  localStorage.setItem(KEY, JSON.stringify(user));
  // PHASE 2 → not needed (JWT cookie handles it)
}

export function clearUser(): void {
  // PHASE 1 ↓
  localStorage.removeItem(KEY);
  // PHASE 2 → fetch('/api/auth/logout', { method: 'POST' })
}
