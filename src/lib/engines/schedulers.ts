export type Algo = 'FCFS' | 'SJF' | 'RR' | 'PRIORITY'

export interface Job {
  id: string
  arrival: number
  burst: number
  priority: number
}

export interface Slice {
  id: string
  start: number
  end: number
}

interface IndexedJob extends Job {
  index: number
}

function prepare(jobs: readonly Job[]): IndexedJob[] {
  return jobs.map((job, index) => ({ ...job, index }))
}

function byArrival(a: IndexedJob, b: IndexedJob): number {
  return a.arrival - b.arrival || a.index - b.index
}

/**
 * Non-preemptive FCFS, SJF, and priority, plus round robin.
 * Ties break toward the earlier arrival, then the earlier listing.
 * Round robin enqueues arrivals that land during a quantum before the
 * preempted job returns to the tail. Lower priority number runs first.
 */
export function schedule(jobs: readonly Job[], algo: Algo, quantum = 2): Slice[] {
  const prepared = prepare(jobs)
  if (algo === 'RR') return roundRobin(prepared, Math.max(1, quantum))
  return nonPreemptive(prepared, algo)
}

function nonPreemptive(jobs: IndexedJob[], algo: Algo): Slice[] {
  const remaining = new Map(jobs.map((job) => [job.id, job.burst]))
  const slices: Slice[] = []
  let time = 0
  let guard = 0
  while ([...remaining.values()].some((burst) => burst > 0) && guard < 10000) {
    guard += 1
    const ready = jobs.filter((job) => job.arrival <= time && (remaining.get(job.id) ?? 0) > 0)
    if (ready.length === 0) {
      const next = jobs
        .filter((job) => (remaining.get(job.id) ?? 0) > 0 && job.arrival > time)
        .sort(byArrival)[0]
      if (!next) break
      time = next.arrival
      continue
    }
    ready.sort((a, b) => {
      if (algo === 'SJF' && a.burst !== b.burst) return a.burst - b.burst
      if (algo === 'PRIORITY' && a.priority !== b.priority) return a.priority - b.priority
      return byArrival(a, b)
    })
    const chosen = ready[0]
    const burst = remaining.get(chosen.id) ?? 0
    slices.push({ id: chosen.id, start: time, end: time + burst })
    time += burst
    remaining.set(chosen.id, 0)
  }
  return slices
}

function roundRobin(jobs: IndexedJob[], quantum: number): Slice[] {
  const ordered = [...jobs].sort(byArrival)
  const remaining = new Map(ordered.map((job) => [job.id, job.burst]))
  const queue: string[] = []
  const queued = new Set<string>()
  const slices: Slice[] = []
  let time = 0

  const enqueueUpTo = (instant: number, except?: string) => {
    for (const job of ordered) {
      if (job.id === except) continue
      if (job.arrival <= instant && (remaining.get(job.id) ?? 0) > 0 && !queued.has(job.id)) {
        queue.push(job.id)
        queued.add(job.id)
      }
    }
  }

  let guard = 0
  while ([...remaining.values()].some((burst) => burst > 0) && guard < 10000) {
    guard += 1
    enqueueUpTo(time)
    if (queue.length === 0) {
      const next = ordered.find((job) => (remaining.get(job.id) ?? 0) > 0 && job.arrival > time)
      if (!next) break
      time = next.arrival
      continue
    }
    const id = queue.shift()
    if (!id) break
    queued.delete(id)
    const run = Math.min(quantum, remaining.get(id) ?? 0)
    if (run <= 0) continue
    slices.push({ id, start: time, end: time + run })
    time += run
    remaining.set(id, (remaining.get(id) ?? 0) - run)
    const requeue = (remaining.get(id) ?? 0) > 0
    enqueueUpTo(time, id)
    if (requeue) {
      queue.push(id)
      queued.add(id)
    }
  }
  return slices
}

export function decisionPoints(slices: readonly Slice[]): { time: number; id: string; end: number }[] {
  const points: { time: number; id: string; end: number }[] = []
  for (const slice of slices) {
    const previous = points[points.length - 1]
    if (previous && previous.id === slice.id && previous.end === slice.start) {
      previous.end = slice.end
      continue
    }
    points.push({ time: slice.start, id: slice.id, end: slice.end })
  }
  return points
}
