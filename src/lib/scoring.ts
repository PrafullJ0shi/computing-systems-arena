import type { Question } from '@/types'

export type Interaction = 'single' | 'multi' | 'reveal'

export function interaction(question: Question): Interaction {
  const choice = question.options.length > 0 && question.answerIndexes.length > 0 && !question.unkeyed
  if (question.type === 'multi' && choice) return 'multi'
  if (
    (question.type === 'code' || question.type === 'scenario') &&
    choice &&
    question.answerIndexes.length > 1
  ) {
    return 'multi'
  }
  if (
    (question.type === 'mcq' || question.type === 'code' || question.type === 'scenario') &&
    choice
  ) {
    return 'single'
  }
  return 'reveal'
}

export function isPlayable(question: Question): boolean {
  if (!question.prompt.trim()) return false
  const mode = interaction(question)
  if (mode === 'reveal') return true
  return question.answerIndexes.length > 0
}

/** Questions that count toward mastery and mock papers. */
export function countsForMastery(question: Question): boolean {
  return isPlayable(question) && !question.unkeyed
}

export function sameSet(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false
  const a = [...left].sort((x, y) => x - y)
  const b = [...right].sort((x, y) => x - y)
  return a.every((value, index) => value === b[index])
}

export function grade(
  question: Question,
  input: { indexes?: number[]; selfCorrect?: boolean },
): boolean {
  const mode = interaction(question)
  const indexes = input.indexes ?? []
  if (mode === 'single') {
    return indexes.length === 1 && indexes[0] === question.answerIndexes[0]
  }
  if (mode === 'multi') {
    return question.answerIndexes.length > 0 && sameSet(indexes, question.answerIndexes)
  }
  return input.selfCorrect === true
}
