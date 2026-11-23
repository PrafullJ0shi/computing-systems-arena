import { rankForXp } from '@/config/ranks'
import type { AnswerRecord, QuestionType } from '@/types'

export function xpForAnswer(
  previous: AnswerRecord | undefined,
  question: { type: QuestionType; difficulty: 1 | 2 | 3 },
  correct: boolean,
): number {
  if (!correct) return 0
  const firstTime = !previous || previous.correctCount === 0
  if (!firstTime) return 2
  if (question.type === 'multi') return 15 * question.difficulty + 5
  if (question.type === 'mcq') return 10 * question.difficulty + 5
  return 17
}

export function xpForGame(alreadyPassed: boolean, previousBest: number, score: number, passed: boolean): number {
  if (!passed) return 0
  if (!alreadyPassed) return 40
  if (score > previousBest) return 15
  return 0
}

export function xpForBoss(alreadyAwarded: boolean, completed: boolean): number {
  if (!completed || alreadyAwarded) return 0
  return 80
}

export function xpForCard(grade: number): number {
  if (grade >= 5) return 3
  if (grade >= 4) return 2
  if (grade >= 3) return 1
  return 0
}

export const CARD_XP_DAILY_CAP = 30

export function xpForMock(correct: number): number {
  if (!Number.isFinite(correct) || correct <= 0) return 0
  return Math.floor(correct) * 4
}

/** Once per study day. Grows with the streak and tops out at 24. */
export function streakBonus(streak: number): number {
  const safe = Math.max(1, Math.floor(streak))
  return Math.min(24, 8 + 2 * safe)
}

export function didRankUp(beforeXp: number, afterXp: number): string | null {
  const before = rankForXp(beforeXp)
  const after = rankForXp(afterXp)
  if (after.index > before.index) return after.name
  return null
}
