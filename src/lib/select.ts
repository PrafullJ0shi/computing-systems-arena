import type { AnswerRecord, MockSpec, Question } from '@/types'
import { mulberry32, shuffleInPlace } from '@/lib/rng'
import { countsForMastery, interaction } from '@/lib/scoring'

export function pickMockQuestions(questions: Question[], spec: MockSpec, seed: number): Question[] {
  const playable = questions.filter(
    (question) => countsForMastery(question) && interaction(question) !== 'reveal',
  )
  const byId = new Map(playable.map((question) => [question.id, question]))
  const chosen: Question[] = []
  const used = new Set<string>()
  for (const id of spec.questionIds) {
    const question = byId.get(id)
    if (!question || used.has(question.id)) continue
    chosen.push(question)
    used.add(question.id)
    if (chosen.length >= spec.questionCount) return chosen
  }
  const random = mulberry32(seed || 1)
  const groups = new Map<number, Question[]>()
  for (const question of playable) {
    if (used.has(question.id)) continue
    const list = groups.get(question.week) ?? []
    list.push(question)
    groups.set(question.week, list)
  }
  for (const list of groups.values()) shuffleInPlace(list, random)
  const weeks = [...groups.keys()].sort((a, b) => a - b)
  let added = true
  while (chosen.length < spec.questionCount && added) {
    added = false
    for (const week of weeks) {
      const next = groups.get(week)?.shift()
      if (!next) continue
      chosen.push(next)
      added = true
      if (chosen.length >= spec.questionCount) break
    }
  }
  return chosen
}

export function tagAccuracy(questions: Question[], answered: Record<string, AnswerRecord>): Map<string, number> {
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
  const accuracy = new Map<string, number>()
  for (const [tag, row] of totals) accuracy.set(tag, row.attempted ? row.correct / row.attempted : 0)
  return accuracy
}

export function orderSprint(
  questions: Question[],
  answered: Record<string, AnswerRecord>,
  mistakes: string[],
  weeks: number[],
  limit: number,
): Question[] {
  const allowed = new Set(weeks)
  const accuracy = tagAccuracy(questions, answered)
  const missed = new Set(mistakes)
  const pool = questions.filter((question) => allowed.has(question.week) && countsForMastery(question))
  const ranked = pool.map((question) => {
    const known = question.tags.map((tag) => accuracy.get(tag)).filter((value): value is number => value !== undefined)
    const acc = known.length > 0 ? known.reduce((sum, value) => sum + value, 0) / known.length : 0.45
    const weakness = 1 - acc + (missed.has(question.id) ? 0.45 : 0) + (answered[question.id]?.correct ? -0.15 : 0)
    return { question, weakness }
  })
  ranked.sort(
    (a, b) =>
      b.weakness - a.weakness ||
      b.question.difficulty - a.question.difficulty ||
      a.question.id.localeCompare(b.question.id),
  )
  return ranked.slice(0, Math.max(0, limit)).map((item) => item.question)
}
