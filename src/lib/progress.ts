import { badgeId } from '@/config/worlds'
import { applyStreak } from '@/lib/streak'
import { reviewSm2 } from '@/lib/sm2'
import {
  CARD_XP_DAILY_CAP,
  didRankUp,
  xpForAnswer,
  xpForBoss,
  xpForCard,
  xpForGame,
  xpForMock,
} from '@/lib/xp'
import type { BossRecord, CardRecord, GameRecord, Progress, Question } from '@/types'

export const PROGRESS_KEY = 'csa.progress.v1'

export function emptyProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    displayName: '',
    theme: 'dark',
    answered: {},
    mistakes: [],
    badges: [],
    games: {},
    bosses: {},
    flashcards: {},
    mocks: [],
    cardXpDate: null,
    cardXpToday: 0,
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function sanitizeProgress(raw: unknown): Progress | null {
  const record = asRecord(raw)
  if (!record || record.version !== 1) return null
  if (typeof record.xp !== 'number' || !Number.isFinite(record.xp)) return null
  const base = emptyProgress()
  const theme = record.theme === 'light' ? 'light' : 'dark'
  return {
    ...base,
    xp: Math.max(0, Math.floor(record.xp)),
    streak: typeof record.streak === 'number' && record.streak > 0 ? Math.floor(record.streak) : 0,
    longestStreak:
      typeof record.longestStreak === 'number' && record.longestStreak > 0 ? Math.floor(record.longestStreak) : 0,
    lastActiveDate: typeof record.lastActiveDate === 'string' ? record.lastActiveDate : null,
    displayName: typeof record.displayName === 'string' ? record.displayName.slice(0, 40) : '',
    theme,
    answered: asRecord(record.answered) ? (record.answered as Progress['answered']) : {},
    mistakes: Array.isArray(record.mistakes) ? record.mistakes.filter((id) => typeof id === 'string') : [],
    badges: Array.isArray(record.badges) ? record.badges.filter((id) => typeof id === 'string') : [],
    games: asRecord(record.games) ? (record.games as Progress['games']) : {},
    bosses: asRecord(record.bosses) ? (record.bosses as Progress['bosses']) : {},
    flashcards: asRecord(record.flashcards) ? (record.flashcards as Progress['flashcards']) : {},
    mocks: Array.isArray(record.mocks) ? (record.mocks as Progress['mocks']).slice(0, 20) : [],
    cardXpDate: typeof record.cardXpDate === 'string' ? record.cardXpDate : null,
    cardXpToday: typeof record.cardXpToday === 'number' ? Math.max(0, Math.floor(record.cardXpToday)) : 0,
  }
}

export interface StudyResult {
  progress: Progress
  xpGained: number
  rankUp: string | null
}

function withStudy(progress: Progress, xpGained: number, today: string): StudyResult {
  const streak = applyStreak(progress, today)
  const totalXp = progress.xp + xpGained + streak.bonus
  return {
    progress: {
      ...progress,
      xp: totalXp,
      streak: streak.streak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
    },
    xpGained: xpGained + streak.bonus,
    rankUp: didRankUp(progress.xp, totalXp),
  }
}

export function noteAnswer(progress: Progress, question: Question, correct: boolean, nowIso: string): Progress {
  const previous = progress.answered[question.id]
  const mistakes = correct
    ? progress.mistakes.filter((id) => id !== question.id)
    : [question.id, ...progress.mistakes.filter((id) => id !== question.id)].slice(0, 200)
  return {
    ...progress,
    answered: {
      ...progress.answered,
      [question.id]: {
        correct,
        attempts: (previous?.attempts ?? 0) + 1,
        correctCount: (previous?.correctCount ?? 0) + (correct ? 1 : 0),
        lastAt: nowIso,
      },
    },
    mistakes,
  }
}

export function applyAnswer(progress: Progress, question: Question, correct: boolean, today: string, nowIso: string): StudyResult {
  const previous = progress.answered[question.id]
  const xp = xpForAnswer(previous, question, correct)
  const mistakes = correct
    ? progress.mistakes.filter((id) => id !== question.id)
    : [question.id, ...progress.mistakes.filter((id) => id !== question.id)].slice(0, 200)
  const next: Progress = {
    ...progress,
    answered: {
      ...progress.answered,
      [question.id]: {
        correct,
        attempts: (previous?.attempts ?? 0) + 1,
        correctCount: (previous?.correctCount ?? 0) + (correct ? 1 : 0),
        lastAt: nowIso,
      },
    },
    mistakes,
  }
  return withStudy(next, xp, today)
}

export function applyGame(
  progress: Progress,
  week: number,
  score: number,
  passed: boolean,
  today: string,
): StudyResult {
  const key = String(week)
  const previous: GameRecord = progress.games[key] ?? { best: 0, plays: 0, passed: false }
  const xp = xpForGame(previous.passed, previous.best, score, passed)
  const badge = badgeId(week)
  const badges = passed && !progress.badges.includes(badge) ? [...progress.badges, badge] : progress.badges
  const next: Progress = {
    ...progress,
    badges,
    games: {
      ...progress.games,
      [key]: {
        best: Math.max(previous.best, score),
        plays: previous.plays + 1,
        passed: previous.passed || passed,
      },
    },
  }
  return withStudy(next, xp, today)
}

export function applyBoss(progress: Progress, bossId: string, checks: boolean[], today: string): StudyResult {
  const previous: BossRecord = progress.bosses[bossId] ?? { checks: [], completed: false, xpAwarded: false }
  const completed = checks.length > 0 && checks.every(Boolean)
  const xp = xpForBoss(previous.xpAwarded, completed)
  const next: Progress = {
    ...progress,
    bosses: {
      ...progress.bosses,
      [bossId]: { checks, completed: previous.completed || completed, xpAwarded: previous.xpAwarded || completed },
    },
  }
  return withStudy(next, xp, today)
}

export function applyCard(progress: Progress, cardId: string, grade: number, today: string): StudyResult {
  const previous: CardRecord | undefined = progress.flashcards[cardId]
  const reviewed = reviewSm2(previous, grade, today)
  const rawXp = xpForCard(grade)
  const already = progress.cardXpDate === today ? progress.cardXpToday : 0
  const xp = Math.max(0, Math.min(rawXp, CARD_XP_DAILY_CAP - already))
  const next: Progress = {
    ...progress,
    flashcards: { ...progress.flashcards, [cardId]: reviewed },
    cardXpDate: today,
    cardXpToday: already + xp,
  }
  return withStudy(next, xp, today)
}

export function applyMock(progress: Progress, result: Progress['mocks'][number], today: string): StudyResult {
  const xp = xpForMock(result.correct)
  const next: Progress = { ...progress, mocks: [result, ...progress.mocks].slice(0, 20) }
  return withStudy(next, xp, today)
}
