import { describe, expect, it } from 'vitest'
import { runProgram } from '@/lib/engines/asm'
import { isSafeSequence, runnable } from '@/lib/engines/banker'
import { access, probe } from '@/lib/engines/cache'
import { emptyCache } from '@/lib/engines/cache'
import { parseBase, valuesMatch } from '@/lib/engines/convert'
import { bestFitStart, contiguousStarts, validFreePicks } from '@/lib/engines/files'
import { chainMatches, evalGate, truthTable } from '@/lib/engines/gates'
import { nextInterrupt } from '@/lib/engines/interrupts'
import { simulate } from '@/lib/engines/pager'
import { nextProcessState } from '@/lib/engines/process'
import { schedule } from '@/lib/engines/schedulers'
import { orderSprint, pickMockQuestions } from '@/lib/select'
import type { Question } from '@/types'

const jobs = [
  { id: 'A', arrival: 0, burst: 5, priority: 2 },
  { id: 'B', arrival: 1, burst: 4, priority: 1 },
  { id: 'C', arrival: 2, burst: 2, priority: 3 },
]

describe('engines', () => {
  it('converts binary and hex by value, not by formatting', () => {
    expect(parseBase('0b1010', 2)).toBe(10)
    expect(parseBase(' 10 10 ', 2)).toBe(10)
    expect(parseBase('0xFF', 16)).toBe(255)
    expect(parseBase('2', 2)).toBeNull()
    expect(valuesMatch('0x10', 16, 16)).toBe(true)
  })

  it('evaluates gates and a two-gate chain', () => {
    expect(evalGate('NAND', 1, 1)).toBe(0)
    expect(evalGate('XOR', 1, 0)).toBe(1)
    expect(evalGate('NOT', 0)).toBe(1)
    expect(chainMatches('OR', 'OR', truthTable('OR'))).toBe(true)
    expect(chainMatches('AND', 'OR', truthTable('AND'))).toBe(false)
  })

  it('traces a direct-mapped cache', () => {
    let cache = emptyCache(4)
    const seen: string[] = []
    for (const addr of [0, 4, 0, 1, 1]) {
      const step = access(cache, addr)
      seen.push(step.result)
      cache = step.cache
    }
    expect(seen).toEqual(['miss', 'miss', 'miss', 'miss', 'hit'])
    expect(probe(cache, 1)).toBe('hit')
    expect(probe(cache, 0)).toBe('hit')
    expect(probe(cache, 4)).toBe('miss')
  })

  it('schedules FCFS, SJF, priority, and round robin', () => {
    expect(schedule(jobs, 'FCFS').map((slice) => slice.id)).toEqual(['A', 'B', 'C'])
    expect(schedule(
      [
        { id: 'A', arrival: 0, burst: 6, priority: 1 },
        { id: 'B', arrival: 0, burst: 2, priority: 1 },
        { id: 'C', arrival: 0, burst: 3, priority: 1 },
      ],
      'SJF',
    ).map((slice) => slice.id)).toEqual(['B', 'C', 'A'])
    expect(schedule(
      [
        { id: 'A', arrival: 0, burst: 3, priority: 2 },
        { id: 'B', arrival: 0, burst: 3, priority: 1 },
        { id: 'C', arrival: 0, burst: 3, priority: 3 },
      ],
      'PRIORITY',
    ).map((slice) => slice.id)).toEqual(['B', 'A', 'C'])
    expect(schedule(jobs, 'RR', 2).map((slice) => `${slice.id}:${slice.start}-${slice.end}`)).toEqual([
      'A:0-2',
      'B:2-4',
      'C:4-6',
      'A:6-8',
      'B:8-10',
      'A:10-11',
    ])
  })

  it('checks a safe sequence and refuses an early unsafe pick', () => {
    const state = {
      ids: ['P0', 'P1', 'P2', 'P3', 'P4'],
      available: [3, 3, 2],
      allocation: [
        [0, 1, 0],
        [2, 0, 0],
        [3, 0, 2],
        [2, 1, 1],
        [0, 0, 2],
      ],
      max: [
        [7, 5, 3],
        [3, 2, 2],
        [9, 0, 2],
        [2, 2, 2],
        [4, 3, 3],
      ],
    }
    expect(isSafeSequence(state, [1, 3, 0, 2, 4])).toBe(true)
    expect(runnable(state, [], state.available)).toEqual([1, 3])
    expect(isSafeSequence(state, [0, 1, 2, 3, 4])).toBe(false)
  })

  it('counts FIFO, LRU, and OPT faults on a known string', () => {
    const reference = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
    expect(simulate(reference, 3, 'FIFO').faults).toBe(9)
    expect(simulate(reference, 3, 'LRU').faults).toBe(10)
    expect(simulate(reference, 3, 'OPT').faults).toBe(7)
  })

  it('runs a tiny assembly program', () => {
    const machine = runProgram(`
      MOV R0, 4
      MOV R1, 4
      CMP R0, R1
      JZ SAME
      MOV R2, 1
      JMP END
      SAME:
      MOV R2, 9
      END:
      HLT
    `)
    expect(machine.error).toBeUndefined()
    expect(machine.reg[2]).toBe(9)
    const added = runProgram('MOV R0, 2\nMOV R1, 3\nADD R0, R1\nHLT')
    expect(added.reg[0]).toBe(5)
  })

  it('picks best-fit and validates free blocks', () => {
    const disk = [true, false, false, true, false, false, false, true]
    expect(bestFitStart(disk, 2)).toBe(1)
    expect(bestFitStart(disk, 3)).toBe(4)
    expect(contiguousStarts(disk, 2)).toEqual([1, 4, 5])
    expect(validFreePicks(disk, [1, 4, 5])).toBe(true)
    expect(validFreePicks(disk, [1, 1, 4])).toBe(false)
    expect(validFreePicks(disk, [0])).toBe(false)
  })

  it('serves the highest-priority unmasked interrupt and moves process state', () => {
    expect(
      nextInterrupt([
        { id: 'timer', name: 'Timer', priority: 3, masked: false },
        { id: 'disk', name: 'Disk', priority: 1, masked: false },
        { id: 'key', name: 'Keyboard', priority: 2, masked: true },
      ]),
    ).toBe('disk')
    expect(nextInterrupt([{ id: 'key', name: 'Keyboard', priority: 1, masked: true }])).toBeNull()
    expect(nextProcessState('running', 'timeout')).toBe('ready')
    expect(nextProcessState('running', 'wait')).toBe('waiting')
    expect(nextProcessState('waiting', 'iocomplete')).toBe('ready')
    expect(nextProcessState('new', 'exit')).toBeNull()
  })
})

describe('selection', () => {
  function make(id: string, week: number, tags: string[]): Question {
    return {
      id,
      week,
      source: 'extra',
      type: 'mcq',
      prompt: id,
      options: ['a', 'b'],
      answerIndexes: [0],
      answerText: '',
      explanation: '',
      tags,
      difficulty: 2,
      traps: [],
      unkeyed: false,
      needsReview: false,
    }
  }

  it('spreads a mock across weeks', () => {
    const questions = [1, 2, 3].flatMap((week) => [1, 2, 3, 4].map((n) => make(`w${week}-${n}`, week, ['t'])))
    const picked = pickMockQuestions(questions, { id: 'm', title: 'm', durationMinutes: 10, questionCount: 6, questionIds: [] }, 7)
    expect(picked).toHaveLength(6)
    const counts = new Map<number, number>()
    for (const question of picked) counts.set(question.week, (counts.get(question.week) ?? 0) + 1)
    expect([...counts.values()].every((count) => count === 2)).toBe(true)
  })

  it('orders a sprint with the missed weak topic first', () => {
    const questions = [make('miss', 1, ['cache']), make('strong', 1, ['alu']), make('fresh', 2, ['bus'])]
    const ordered = orderSprint(
      questions,
      {
        miss: { correct: false, attempts: 2, correctCount: 0, lastAt: '' },
        strong: { correct: true, attempts: 2, correctCount: 2, lastAt: '' },
      },
      ['miss'],
      [1, 2],
      3,
    )
    expect(ordered.map((question) => question.id)[0]).toBe('miss')
    expect(ordered.map((question) => question.id).at(-1)).toBe('strong')
  })
})
