import { describe, expect, it } from 'vitest'
import { WORLDS } from '@/config/worlds'
import { importFromTexts, importFromZip, payloadIsEmpty, applyPayload } from '@/lib/bankImport'
import { assembleBank, normalizeQuestion } from '@/lib/loader'
import { zipSync, strToU8 } from 'fflate'
import type { WorldDef } from '@/types'

const worlds: WorldDef[] = [
  { week: 1, title: 'One', short: 'One', blurb: 'b', gameTitle: 'g', badge: 'B', accent: '#fff' },
  { week: 2, title: 'Two', short: 'Two', blurb: 'b', gameTitle: 'g', badge: 'B', accent: '#fff' },
]

describe('loader', () => {
  it('fills missing fields and drops a question with no prompt', () => {
    const question = normalizeQuestion({ prompt: 'Which?', options: ['Only'], answer: 'A', traps: 'watch the letter' }, 4, 0)
    expect(question).toMatchObject({
      week: 4,
      source: 'extra',
      type: 'mcq',
      difficulty: 2,
      answerIndexes: [0],
      traps: ['watch the letter'],
      tags: [],
      unkeyed: false,
    })
    expect(question?.id).toBeTruthy()
    expect(normalizeQuestion({ id: 'x' }, 1, 0)).toBeNull()
    const hard = normalizeQuestion({ prompt: 'p', difficulty: 9, source: 'nope', tags: 'Bus' }, 1, 1)
    expect(hard).toMatchObject({ difficulty: 3, source: 'extra', tags: ['bus'] })
  })

  it('accepts letters, option text, and promotes a multi-key mcq', () => {
    const letter = normalizeQuestion({ prompt: 'p', options: ['a', 'b', 'c'], answer: 'C', type: 'mcq' }, 1, 0)
    expect(letter?.answerIndexes).toEqual([2])
    const text = normalizeQuestion({ prompt: 'p', options: ['Alpha', 'Beta'], answer: 'beta' }, 1, 0)
    expect(text?.answerIndexes).toEqual([1])
    const multi = normalizeQuestion({ prompt: 'p', type: 'mcq', options: ['a', 'b', 'c'], answer: [0, 2] }, 1, 0)
    expect(multi).toMatchObject({ type: 'multi', answerIndexes: [0, 2] })
    const broken = normalizeQuestion({ prompt: 'p', type: 'mcq', options: ['a'], answer: 'nope' }, 1, 0)
    expect(broken?.unkeyed).toBe(true)
  })

  it('lets a private week replace that week and keeps the other sample week', () => {
    const bank = assembleBank(
      [
        {
          name: 'weeks/week-01.json',
          origin: 'sample',
          data: { week: 1, questions: [{ id: 's1', prompt: 'sample', options: ['a'], answer: 0 }] },
        },
        {
          name: 'weeks/week-02.json',
          origin: 'sample',
          data: { week: 2, questions: [{ id: 's2', prompt: 'keep', options: ['a'], answer: 0 }] },
        },
        {
          name: 'data/weeks/week-01.json',
          origin: 'private',
          data: { questions: [{ id: 'p1', prompt: 'private', options: ['a', 'b'], answer: 'B' }] },
        },
      ],
      worlds,
    )
    expect(bank.weeks[0].questions.map((question) => question.id)).toEqual(['p1'])
    expect(bank.weeks[1].questions.map((question) => question.id)).toEqual(['s2'])
    expect(bank.weeks[0].title).toBe('One')
    expect(bank.origin).toBe('mixed')
    expect(bank.replacedWeeks).toEqual([1])
  })

  it('tolerates boss, card, and mock aliases and skips junk', () => {
    const bank = assembleBank(
      [
        { name: 'notes.json', origin: 'sample', data: { hello: 'nope' } },
        { name: 'bosses.json', origin: 'sample', data: [{ prompt: 'Explain', steps: ['one'], sample: 'stub' }] },
        { name: 'flashcards.json', origin: 'sample', data: { flashcards: [{ prompt: 'front', answer: 'back', week: 2 }] } },
        { name: 'mock-test.json', origin: 'sample', data: { minutes: 30 } },
      ],
      worlds,
    )
    expect(bank.skipped.map((file) => file.name)).toEqual(['notes.json'])
    expect(bank.bosses[0]).toMatchObject({ prompt: 'Explain', rubric: ['one'], sampleStub: 'stub' })
    expect(bank.flashcards[0]).toMatchObject({ front: 'front', back: 'back', week: 2 })
    expect(bank.mock.durationMinutes).toBe(30)
    expect(bank.mock.questionCount).toBe(40)
  })

  it('imports a zip and reports counts without dropping the untouched week', () => {
    const zipped = zipSync({
      'data/weeks/week-02.json': strToU8(
        JSON.stringify({ week: 2, questions: [{ id: 'z', prompt: 'from zip', options: ['a'], answer: 0 }] }),
      ),
      'README.md': strToU8('# ignore'),
      'data/bosses.json': strToU8(JSON.stringify([{ id: 'b', week: 2, prompt: 'boss', rubric: ['a', 'b', 'c', 'd', 'e'] }])),
    })
    const imported = importFromZip(zipped, '2026-11-23T00:00:00.000Z')
    expect(imported.report.questions).toBe(1)
    expect(imported.report.bosses).toBe(1)
    expect(imported.report.weeks).toEqual([2])
    const base = assembleBank(
      [{ name: 'week-01.json', origin: 'sample', data: { week: 1, questions: [{ id: 's', prompt: 'stay', options: ['a'], answer: 0 }] } }],
      worlds,
    )
    const merged = applyPayload(base, imported.payload)
    expect(merged.weeks[0].questions[0].id).toBe('s')
    expect(merged.weeks[1].questions[0].id).toBe('z')
    expect(merged.bosses).toHaveLength(1)
    expect(payloadIsEmpty(importFromTexts([{ name: 'nope.json', text: '{' }]).payload)).toBe(true)
  })
})

describe('world config', () => {
  it('lists the thirteen course titles in order', () => {
    expect(WORLDS).toHaveLength(13)
    expect(WORLDS[0].title).toContain('Getting Started')
    expect(WORLDS[12].title).toContain('Mobile and Embedded')
  })
})
