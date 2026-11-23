export interface FreeRun {
  start: number
  length: number
}

export function freeRuns(occupied: readonly boolean[]): FreeRun[] {
  const runs: FreeRun[] = []
  let index = 0
  while (index < occupied.length) {
    if (occupied[index]) {
      index += 1
      continue
    }
    const start = index
    while (index < occupied.length && !occupied[index]) index += 1
    runs.push({ start, length: index - start })
  }
  return runs
}

export function contiguousStarts(occupied: readonly boolean[], size: number): number[] {
  return freeRuns(occupied)
    .filter((run) => run.length >= size)
    .flatMap((run) => Array.from({ length: run.length - size + 1 }, (_, offset) => run.start + offset))
}

/** Smallest free run that can hold `size`. Ties break toward the lower address. */
export function bestFitStart(occupied: readonly boolean[], size: number): number | null {
  const fits = freeRuns(occupied)
    .filter((run) => run.length >= size)
    .sort((a, b) => a.length - b.length || a.start - b.start)
  return fits[0]?.start ?? null
}

export function validFreePicks(occupied: readonly boolean[], picks: readonly number[]): boolean {
  if (new Set(picks).size !== picks.length) return false
  return picks.every((pick) => pick >= 0 && pick < occupied.length && !occupied[pick])
}
