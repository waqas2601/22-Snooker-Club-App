// ================================================================
// STORAGE: payments (completed sessions + today stats)
// Phase 1 → localStorage
// Phase 2 → replace with: /api/sessions
// ================================================================

import type { CompletedSession, TodayStats } from "@/types";

const recentKey = (email: string) => `club_recent_${email}`;
const todayKey = (email: string) => `club_today_${email}`;

const MAX_SESSIONS = 100;

export function getSessions(email: string): CompletedSession[] {
  // PHASE 1 ↓
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(recentKey(email));
  return raw ? (JSON.parse(raw) as CompletedSession[]) : [];
  // PHASE 2 → return fetch('/api/sessions').then(r => r.json())
}

export function saveSession(email: string, session: CompletedSession): void {
  // PHASE 1 ↓
  const all = getSessions(email);
  const updated = [session, ...all].slice(0, MAX_SESSIONS);
  localStorage.setItem(recentKey(email), JSON.stringify(updated));
  // PHASE 2 → fetch('/api/sessions', { method: 'POST', body: JSON.stringify(session) })
}

export function getTodayStats(email: string): TodayStats {
  // PHASE 1 ↓
  if (typeof window === "undefined")
    return { revenue: 0, sessions: 0, date: "" };
  const raw = localStorage.getItem(todayKey(email));
  if (!raw) return { revenue: 0, sessions: 0, date: "" };
  return JSON.parse(raw) as TodayStats;
  // PHASE 2 → return fetch('/api/sessions/today').then(r => r.json())
}

export function saveTodayStats(email: string, stats: TodayStats): void {
  // PHASE 1 ↓
  localStorage.setItem(todayKey(email), JSON.stringify(stats));
  // PHASE 2 → handled automatically server-side
}
