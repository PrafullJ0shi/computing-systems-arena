import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WORLDS } from '@/config/worlds'
import { assembleBank } from '@/lib/loader'
import { pickMockQuestions } from '@/lib/select'
import type { QuestionType } from '@/types'

const root = join(process.cwd(), 'content/sample')

function read(name: string) {
  return JSON.parse(readFileSync(join(root, name), 'utf8')) as unknown
}

describe('sample bank', () => {
  const files = [
    ...readdirSync(join(root, 'weeks')).map((name) => ({
      name: `weeks/${name}`,
      data: read(`weeks/${name}`),
      origin: 'sample' as const,
    })),
    { name: 'bosses.json', data: read('bosses.json'), origin: 'sample' as const },
    { name: 'flashcards.json', data: read('flashcards.json'), origin: 'sample' as const },
    { name: 'mock-test.json', data: read('mock-test.json'), origin: 'sample' as const },
  ]
  const bank = assembleBank(files, WORLDS)

  it('ships an original playable set for every world', () => {
    expect(bank.skipped).toEqual([])
    expect(bank.questions).toHaveLength(117)
    const types = new Set<QuestionType>()
    const ids = new Set<string>()
    for (const world of WORLDS) {
      const questions = bank.weeks[world.week - 1].questions
      expect(questions.length).toBeGreaterThanOrEqual(8)
      expect(questions.length).toBeLessThanOrEqual(10)
      expect(questions.filter((question) => question.type === 'multi').length).toBeGreaterThanOrEqual(1)
      expect(questions.filter((question) => question.type === 'short').length).toBeGreaterThanOrEqual(1)
      expect(questions.filter((question) => question.traps.length > 0).length).toBeGreaterThanOrEqual(2)
      for (const question of questions) {
        expect(ids.has(question.id)).toBe(false)
        ids.add(question.id)
        expect(question.explanation.length).toBeGreaterThan(40)
        expect(question.unkeyed).toBe(false)
        types.add(question.type)
      }
    }
    expect(types).toEqual(new Set(['mcq', 'multi', 'short', 'scenario', 'code']))
    expect(bank.bosses).toHaveLength(13)
    for (const boss of bank.bosses) expect(boss.rubric).toHaveLength(5)
    for (const world of WORLDS) {
      expect(bank.flashcards.filter((card) => card.week === world.week).length).toBeGreaterThanOrEqual(4)
    }
    const mock = pickMockQuestions(bank.questions, bank.mock, 2026)
    expect(mock).toHaveLength(40)
    expect(new Set(mock.map((question) => question.week)).size).toBe(13)
  })
})
