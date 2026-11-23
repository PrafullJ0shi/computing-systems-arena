import { describe, expect, it } from 'vitest'
import { applyStreak } from '@/lib/streak'
import { reviewSm2 } from '@/lib/sm2'

describe('streak', () => {
  it('starts, holds, continues, and resets', () => {
    const start = applyStreak({ streak: 0, longestStreak: 0, lastActiveDate: null }, '2026-11-01')
    expect(start).toMatchObject({ streak: 1, bonus: 10, increased: true })
    const same = applyStreak(start, '2026-11-01')
    expect(same.bonus).toBe(0)
    expect(same.streak).toBe(1)
    const next = applyStreak(start, '2026-11-02')
    expect(next).toMatchObject({ streak: 2, bonus: 12, longestStreak: 2 })
    const gap = applyStreak(next, '2026-11-05')
    expect(gap).toMatchObject({ streak: 1, longestStreak: 2, bonus: 10 })
  })
})

describe('sm-2', () => {
  it('walks the classic intervals and floors ease', () => {
    const first = reviewSm2(undefined, 5, '2026-11-01')
    expect(first).toMatchObject({ repetitions: 1, interval: 1, due: '2026-11-02' })
    expect(first.ease).toBeCloseTo(2.6)
    const second = reviewSm2(first, 5, '2026-11-02')
    expect(second).toMatchObject({ repetitions: 2, interval: 6, due: '2026-11-08' })
    const third = reviewSm2(second, 5, '2026-11-08')
    expect(third.repetitions).toBe(3)
    expect(third.interval).toBe(17)
    const failed = reviewSm2(third, 0, '2026-12-01')
    expect(failed).toMatchObject({ repetitions: 0, interval: 1, lapses: 1, due: '2026-12-02' })
    let card = reviewSm2(undefined, 0, '2026-11-01')
    for (let count = 0; count < 8; count += 1) card = reviewSm2(card, 0, '2026-11-01')
    expect(card.ease).toBeCloseTo(1.3)
  })
})
