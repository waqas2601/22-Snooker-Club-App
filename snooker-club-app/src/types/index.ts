// ================================================================
// ALL TYPESCRIPT TYPES FOR THE SNOOKER CLUB APP
// One file — import from here everywhere
// ================================================================

// ── Auth & User ─────────────────────────────────────────────────
export interface ClubUser {
  club_name: string;
  owner_name: string;
  email: string;
  location: string;
  tables: number;
}

// ── Game Types ──────────────────────────────────────────────────
export type GameUnit = "per hour" | "per frame" | "per game";

export interface GameType {
  id: string;
  name: string;
  description: string;
  rate: number;
  unit: GameUnit;
  enabled: boolean;
  color: string;
  icon: string;
  isDefault: boolean;
}

// ── Tables & Sessions ───────────────────────────────────────────
export interface SessionPlayer {
  name: string;
  isRegistered: boolean;
}

export interface ActiveSession {
  players: SessionPlayer[];
  gameType: string;
  gameUnit: GameUnit;
  gameRate: number;
  startTime: number; // timestamp ms
}

export interface Table {
  id: number;
  name: string;
  status: "available" | "occupied";
  session: ActiveSession | null;
}

// ── Payment ─────────────────────────────────────────────────────
export type PaymentMethod =
  | "Cash"
  | "EasyPaisa"
  | "JazzCash"
  | "OnCredit"
  | "DebtPayment";

export type SplitMode = "loser" | "equal" | "teams" | "custom";

export interface PlayerSplit {
  name: string;
  amount: number;
}

export interface CompletedSession {
  id: string;
  tableNo: number;
  tableName: string;
  players: SessionPlayer[];
  gameType: string;
  duration: string;
  totalAmount: number;
  endTime: number; // timestamp ms
  paymentMethod: PaymentMethod;
  splitMode?: SplitMode;
  playerSplits?: PlayerSplit[];
  settledMethod?: "Cash" | "EasyPaisa" | "JazzCash";
  creditPlayerName?: string;
}

// ── Players (Members) ───────────────────────────────────────────
export type MembershipType = "Regular" | "Premium" | "VIP";

export interface Player {
  id: string;
  name: string;
  phone: string;
  membershipType: MembershipType;
  totalVisits: number;
  totalPaid: number;
  joinDate: number; // timestamp ms
  lastVisit: number; // timestamp ms
}

// ── Debts ───────────────────────────────────────────────────────
// Record<playerName, amountOwed>
export type DebtsRecord = Record<string, number>;

// ── Profile ─────────────────────────────────────────────────────
export interface WorkingDay {
  day: string;
  enabled: boolean;
}

export interface ClubProfile {
  club_name: string;
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  established: string;
  open_time: string;
  close_time: string;
  working_days: WorkingDay[];
  receipt_name: string;
  receipt_phone: string;
  receipt_message: string;
}

// ── Today Stats ─────────────────────────────────────────────────
export interface TodayStats {
  revenue: number;
  sessions: number;
  date: string; // "YYYY-MM-DD"
}

// ── Theme ───────────────────────────────────────────────────────
export type Theme = "dark" | "light";

// ── Navigation ──────────────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
