import { PASSING_MASTERY } from '@/config/worlds'
import { countsForMastery } from '@/lib/scoring'
import { tagAccuracy } from '@/lib/select'
import type { AnswerRecord, Question } from '@/types'

export interface Mastery {
  correct: number
  attempted: number
  total: number
  ratio: number
  bossUnlocked: boolean
}

export function worldMastery(questions: Question[], answered: Record<string, AnswerRecord>): Mastery {
  const pool = questions.filter(countsForMastery)
  const attempted = pool.filter((question) => (answered[question.id]?.attempts ?? 0) > 0).length
  const correct = pool.filter((question) => (answered[question.id]?.correctCount ?? 0) > 0).length
  const ratio = pool.length > 0 ? correct / pool.length : 0
  return {
    correct,
    attempted,
    total: pool.length,
    ratio,
    bossUnlocked: pool.length > 0 && ratio >= PASSING_MASTERY,
  }
}

export interface WeakTopic {
  tag: string
  correct: number
  attempted: number
  accuracy: number
}

export function weakTopics(questions: Question[], answered: Record<string, AnswerRecord>): WeakTopic[] {
  const totals = new Map<string, { correct: number; attempted: number }>()
  for (const question of questions) {
    const record = answered[question.id]
    if (!record || record.attempts <= 0) continue
    const tags = question.tags.length > 0 ? question.tags : ['untagged']
    for (const tag of tags) {
      const row = totals.get(tag) ?? { correct: 0, attempted: 0 }
      row.attempted += 1
      if (record.correct) row.correct += 1
      totals.set(tag, row)
    }
  }
  return [...totals.entries()]
    .map(([tag, row]) => ({ tag, ...row, accuracy: row.attempted ? row.correct / row.attempted : 0 }))
    .filter((topic) => topic.attempted >= 2 && topic.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted)
}

export function accuracyMap(questions: Question[], answered: Record<string, AnswerRecord>): Map<string, number> {
  return tagAccuracy(questions, answered)
}
