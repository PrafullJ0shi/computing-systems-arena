export interface BankerState {
  ids: string[]
  available: number[]
  allocation: number[][]
  max: number[][]
}

export function needOf(state: BankerState): number[][] {
  return state.max.map((row, process) => row.map((value, resource) => value - (state.allocation[process]?.[resource] ?? 0)))
}

export function fits(need: readonly number[], work: readonly number[]): boolean {
  return need.every((value, index) => value <= (work[index] ?? 0))
}

export function isSafeSequence(state: BankerState, order: readonly number[]): boolean {
  if (order.length !== state.ids.length) return false
  if (new Set(order).size !== order.length) return false
  const need = needOf(state)
  let work = [...state.available]
  for (const process of order) {
    if (process < 0 || process >= state.ids.length) return false
    if (!fits(need[process], work)) return false
    work = work.map((value, index) => value + (state.allocation[process]?.[index] ?? 0))
  }
  return true
}

/** Processes that could be granted the CPU next without breaking safety. */
export function runnable(state: BankerState, finished: readonly number[], work: readonly number[]): number[] {
  const need = needOf(state)
  const done = new Set(finished)
  const ready: number[] = []
  for (let index = 0; index < state.ids.length; index += 1) {
    if (done.has(index)) continue
    if (fits(need[index], work)) ready.push(index)
  }
  return ready
}

export function release(state: BankerState, process: number, work: readonly number[]): number[] {
  return work.map((value, index) => value + (state.allocation[process]?.[index] ?? 0))
}
