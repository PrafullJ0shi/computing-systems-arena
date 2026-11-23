import { addDays } from '@/lib/dates'
import type { CardRecord } from '@/types'

export function freshCard(today: string): CardRecord {
  return { ease: 2.5, interval: 0, repetitions: 0, due: today, lapses: 0 }
}

export function isDue(card: CardRecord | undefined, today: string): boolean {
  if (!card) return true
  return card.due <= today
}

/**
 * SuperMemo SM-2.
 * Grades below 3 reset the card and schedule it for the next day.
 * Ease is updated on every grade and never drops below 1.3.
 */
export function reviewSm2(previous: CardRecord | undefined, grade: number, today: string): CardRecord {
  const card = previous ?? freshCard(today)
  const quality = Math.max(0, Math.min(5, Math.round(grade)))
  let ease = card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ease < 1.3) ease = 1.3
  if (quality < 3) {
    return {
      ease,
      interval: 1,
      repetitions: 0,
      due: addDays(today, 1),
      lapses: card.lapses + 1,
    }
  }
  let interval: number
  if (card.repetitions <= 0) interval = 1
  else if (card.repetitions === 1) interval = 6
  else interval = Math.max(1, Math.round(card.interval * ease))
  return {
    ease,
    interval,
    repetitions: card.repetitions + 1,
    due: addDays(today, interval),
    lapses: card.lapses,
  }
}
