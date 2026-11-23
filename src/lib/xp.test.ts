import { describe, expect, it } from 'vitest'
import { RANKS, rankForXp } from '@/config/ranks'
import { applyAnswer, applyGame, emptyProgress } from '@/lib/progress'
import { xpForAnswer, xpForBoss, xpForGame, xpForMock } from '@/lib/xp'
import type { Question } from '@/types'

const q = (type: Question['type'], difficulty: 1 | 2 | 3): Question => ({
  id: `${type}-${difficulty}`,
  week: 1,
  source: 'extra',
  type,
  prompt: 'p',
  options: type === 'short' ? [] : ['a', 'b'],
  answerIndexes: type === 'short' ? [] : [0],
  answerText: '',
  explanation: '',
  tags: [],
  difficulty,
  traps: [],
  unkeyed: false,
  needsReview: false,
})

describe('ranks', () => {
  it('names every rank and pins the ends', () => {
    expect(RANKS).toHaveLength(10)
    expect(RANKS[0]).toMatchObject({ name: 'Boot Loader', minXp: 0 })
    expect(RANKS[9]).toMatchObject({ name: 'Systems Sage', minXp: 9500 })
    expect(RANKS.map((rank) => rank.minXp)).toEqual([0, 500, 1100, 1800, 2700, 3800, 5000, 6400, 7900, 9500])
  })

  it('places boundary XP on the higher rank and stays at sage', () => {
    expect(rankForXp(0).name).toBe('Boot Loader')
    expect(rankForXp(499).name).toBe('Boot Loader')
    expect(rankForXp(500).name).toBe('Bit Flipper')
    expect(rankForXp(9499).name).toBe('Kernel Knight')
    expect(rankForXp(9500).name).toBe('Systems Sage')
    expect(rankForXp(20000).name).toBe('Systems Sage')
    expect(rankForXp(9500).nextName).toBeNull()
    expect(rankForXp(-5).name).toBe('Boot Loader')
  })
})

describe('xp awards', () => {
  it('pays more for a first multi-select and a token amount later', () => {
    expect(xpForAnswer(undefined, q('mcq', 1), true)).toBe(15)
    expect(xpForAnswer(undefined, q('mcq', 2), true)).toBe(25)
    expect(xpForAnswer(undefined, q('mcq', 3), true)).toBe(35)
    expect(xpForAnswer(undefined, q('multi', 2), true)).toBe(35)
    expect(xpForAnswer(undefined, q('short', 2), true)).toBe(17)
    expect(xpForAnswer({ correct: true, attempts: 1, correctCount: 1, lastAt: '' }, q('mcq', 3), true)).toBe(2)
    expect(xpForAnswer(undefined, q('mcq', 3), false)).toBe(0)
  })

  it('awards game, boss, and mock XP once where it matters', () => {
    expect(xpForGame(false, 0, 80, true)).toBe(40)
    expect(xpForGame(true, 80, 80, true)).toBe(0)
    expect(xpForGame(true, 80, 90, true)).toBe(15)
    expect(xpForGame(false, 0, 10, false)).toBe(0)
    expect(xpForBoss(false, true)).toBe(80)
    expect(xpForBoss(true, true)).toBe(0)
    expect(xpForMock(10)).toBe(40)
    expect(xpForMock(0)).toBe(0)
  })

  it('queues a miss and clears it when the same question is later correct', () => {
    const first = applyAnswer(emptyProgress(), q('mcq', 1), false, '2026-11-01', '2026-11-01T00:00:00.000Z')
    expect(first.progress.mistakes).toEqual(['mcq-1'])
    expect(first.progress.xp).toBe(10)
    const second = applyAnswer(first.progress, q('mcq', 1), true, '2026-11-01', '2026-11-01T00:01:00.000Z')
    expect(second.progress.mistakes).toEqual([])
    expect(second.progress.xp).toBe(10 + 15)
  })

  it('grants the mini-game badge and first-clear XP once', () => {
    const cleared = applyGame(emptyProgress(), 2, 80, true, '2026-11-02')
    expect(cleared.progress.badges).toContain('badge-w02')
    expect(cleared.xpGained).toBe(40 + 10)
    const again = applyGame(cleared.progress, 2, 80, true, '2026-11-02')
    expect(again.xpGained).toBe(0)
    expect(again.progress.badges).toEqual(cleared.progress.badges)
  })
})
