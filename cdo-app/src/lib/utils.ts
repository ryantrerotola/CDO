import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calculateStreak(entries: { date: Date | string }[]): number {
  if (entries.length === 0) return 0;

  const sorted = entries
    .map((e) => new Date(e.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (new Date(sorted[i]).toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

// ── Period-aware goal progress ──────────────────────────────────────

interface GoalEntry {
  date: string;
  value: number;
}

type GoalFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";

/** Get the start of the current period for a given frequency. */
function periodStart(frequency: GoalFrequency, now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);

  switch (frequency) {
    case "DAILY":
      return d;
    case "WEEKLY": {
      const day = d.getDay(); // 0=Sun
      d.setDate(d.getDate() - day);
      return d;
    }
    case "MONTHLY":
      d.setDate(1);
      return d;
    case "QUARTERLY": {
      const qMonth = Math.floor(d.getMonth() / 3) * 3;
      d.setMonth(qMonth, 1);
      return d;
    }
    case "YEARLY":
      d.setMonth(0, 1);
      return d;
    case "ONCE":
    default:
      return new Date(0); // all time
  }
}

/** Sum entry values within the current period for the goal's frequency. */
export function periodProgress(entries: GoalEntry[], frequency: GoalFrequency): number {
  const start = periodStart(frequency);
  return entries
    .filter((e) => new Date(e.date) >= start)
    .reduce((sum, e) => sum + e.value, 0);
}

/** Label for the current period. */
export function periodLabel(frequency: GoalFrequency): string {
  switch (frequency) {
    case "DAILY": return "today";
    case "WEEKLY": return "this week";
    case "MONTHLY": return "this month";
    case "QUARTERLY": return "this quarter";
    case "YEARLY": return "this year";
    case "ONCE":
    default: return "total";
  }
}

/**
 * Calculate the streak of consecutive periods where the goal's target was met.
 * For a DAILY goal with target=2, counts how many consecutive days (ending today
 * or yesterday) had ≥2 entries.
 */
export function goalStreak(
  entries: GoalEntry[],
  frequency: GoalFrequency,
  targetValue: number
): number {
  if (frequency === "ONCE" || entries.length === 0) return 0;

  // Group entries into period buckets
  const buckets = new Map<string, number>();

  for (const e of entries) {
    const d = new Date(e.date);
    const key = periodKey(d, frequency);
    buckets.set(key, (buckets.get(key) || 0) + e.value);
  }

  // Walk backwards from today, counting consecutive periods that met the target
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(now);

  // Allow starting from today even if not yet complete (check yesterday first to see if streak is active)
  const todayKey = periodKey(cursor, frequency);
  const todayMet = (buckets.get(todayKey) || 0) >= targetValue;

  if (todayMet) {
    streak = 1;
    cursor = prevPeriod(cursor, frequency);
  } else {
    // Check if yesterday's period was met (streak still alive, just hasn't completed today yet)
    cursor = prevPeriod(cursor, frequency);
  }

  // Count consecutive past periods
  for (let i = 0; i < 365; i++) {
    const key = periodKey(cursor, frequency);
    const total = buckets.get(key) || 0;
    if (total >= targetValue) {
      streak++;
      cursor = prevPeriod(cursor, frequency);
    } else {
      break;
    }
  }

  return streak;
}

function periodKey(date: Date, frequency: GoalFrequency): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  switch (frequency) {
    case "DAILY":
      return d.toISOString().slice(0, 10);
    case "WEEKLY": {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      return d.toISOString().slice(0, 10);
    }
    case "MONTHLY":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    case "QUARTERLY":
      return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
    case "YEARLY":
      return `${d.getFullYear()}`;
    default:
      return "all";
  }
}

function prevPeriod(date: Date, frequency: GoalFrequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case "DAILY":
      d.setDate(d.getDate() - 1);
      return d;
    case "WEEKLY":
      d.setDate(d.getDate() - 7);
      return d;
    case "MONTHLY":
      d.setMonth(d.getMonth() - 1);
      return d;
    case "QUARTERLY":
      d.setMonth(d.getMonth() - 3);
      return d;
    case "YEARLY":
      d.setFullYear(d.getFullYear() - 1);
      return d;
    default:
      return d;
  }
}
