import { describe, expect, it } from 'vitest'
import { grade, interaction, sameSet } from '@/lib/scoring'
import type { Question } from '@/types'

function question(partial: Partial<Question>): Question {
  return {
    id: 'q',
    week: 1,
    source: 'extra',
    type: 'mcq',
    prompt: 'Pick one',
    options: ['a', 'b', 'c', 'd'],
    answerIndexes: [1],
    answerText: '',
    explanation: 'because',
    tags: ['t'],
    difficulty: 2,
    traps: [],
    unkeyed: false,
    needsReview: false,
    ...partial,
  }
}

describe('scoring', () => {
  it('grades a single-choice question', () => {
    const item = question({})
    expect(interaction(item)).toBe('single')
    expect(grade(item, { indexes: [1] })).toBe(true)
    expect(grade(item, { indexes: [0] })).toBe(false)
    expect(grade(item, { indexes: [1, 2] })).toBe(false)
  })

  it('grades multi-select independent of order', () => {
    const item = question({ type: 'multi', answerIndexes: [0, 2] })
    expect(interaction(item)).toBe('multi')
    expect(grade(item, { indexes: [2, 0] })).toBe(true)
    expect(grade(item, { indexes: [0] })).toBe(false)
    expect(grade(item, { indexes: [0, 2, 3] })).toBe(false)
    expect(sameSet([2, 0], [0, 2])).toBe(true)
  })

  it('self-grades open questions and ignores a broken key', () => {
    const open = question({ type: 'short', options: [], answerIndexes: [], answerText: 'model' })
    expect(interaction(open)).toBe('reveal')
    expect(grade(open, { selfCorrect: true })).toBe(true)
    expect(grade(open, { selfCorrect: false })).toBe(false)
    const broken = question({ unkeyed: true, answerIndexes: [] })
    expect(grade(broken, { indexes: [0] })).toBe(false)
  })
})
