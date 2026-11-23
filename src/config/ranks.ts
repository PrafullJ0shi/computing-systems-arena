export interface Rank {
  index: number
  name: string
  minXp: number
}

/** Ten ranks. Thresholds climb from 0 to Systems Sage at 9,500 XP. */
export const RANKS: readonly Rank[] = [
  { index: 0, name: 'Boot Loader', minXp: 0 },
  { index: 1, name: 'Bit Flipper', minXp: 500 },
  { index: 2, name: 'Gate Keeper', minXp: 1100 },
  { index: 3, name: 'Register Runner', minXp: 1800 },
  { index: 4, name: 'Cache Hunter', minXp: 2700 },
  { index: 5, name: 'Interrupt Handler', minXp: 3800 },
  { index: 6, name: 'Process Juggler', minXp: 5000 },
  { index: 7, name: 'Scheduler', minXp: 6400 },
  { index: 8, name: 'Kernel Knight', minXp: 7900 },
  { index: 9, name: 'Systems Sage', minXp: 9500 },
]

export const SAGE_XP = 9500

export function rankForXp(xp: number): Rank & {
  nextName: string | null
  nextXp: number | null
  into: number
  span: number
} {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0
  let current: Rank = RANKS[0]
  for (const rank of RANKS) {
    if (safe >= rank.minXp) current = rank
  }
  const next = RANKS[current.index + 1] ?? null
  return {
    ...current,
    nextName: next?.name ?? null,
    nextXp: next?.minXp ?? null,
    into: safe - current.minXp,
    span: next ? next.minXp - current.minXp : 0,
  }
}
