import { daysBetween } from '@/lib/dates'
import { streakBonus } from '@/lib/xp'

export interface StreakState {
  streak: number
  longestStreak: number
  lastActiveDate: string | null
}

export function applyStreak(
  previous: StreakState,
  today: string,
): StreakState & { increased: boolean; bonus: number } {
  if (previous.lastActiveDate === today) {
    return { ...previous, increased: false, bonus: 0 }
  }
  const gap = previous.lastActiveDate ? daysBetween(previous.lastActiveDate, today) : null
  const streak = gap === 1 ? previous.streak + 1 : 1
  return {
    streak,
    longestStreak: Math.max(previous.longestStreak, streak),
    lastActiveDate: today,
    increased: true,
    bonus: streakBonus(streak),
  }
}
