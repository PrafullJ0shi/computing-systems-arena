export type ReplaceAlgo = 'FIFO' | 'LRU' | 'OPT'

export interface Pager {
  frames: (number | null)[]
  inserted: number[]
  lastUsed: Record<number, number>
  time: number
  faults: number
}

export interface PageStep {
  frame: number
  event: 'hit' | 'fill' | 'replace'
  victim: number | null
}

export function createPager(frameCount: number): Pager {
  return {
    frames: Array.from({ length: frameCount }, () => null),
    inserted: [],
    lastUsed: {},
    time: 0,
    faults: 0,
  }
}

function clone(pager: Pager): Pager {
  return {
    frames: [...pager.frames],
    inserted: [...pager.inserted],
    lastUsed: { ...pager.lastUsed },
    time: pager.time,
    faults: pager.faults,
  }
}

/**
 * OPT ties (two pages never used again, or used equally far) go to the
 * higher frame index. FIFO evicts the oldest loaded page.
 */
export function nextPlacement(pager: Pager, page: number, future: readonly number[], algo: ReplaceAlgo): PageStep {
  const resident = pager.frames.indexOf(page)
  if (resident >= 0) return { frame: resident, event: 'hit', victim: null }
  const empty = pager.frames.indexOf(null)
  if (empty >= 0) return { frame: empty, event: 'fill', victim: null }
  if (algo === 'FIFO') {
    const oldest = pager.inserted[0]
    const frame = pager.frames.indexOf(oldest)
    return { frame: frame < 0 ? 0 : frame, event: 'replace', victim: oldest }
  }
  if (algo === 'LRU') {
    let frame = 0
    let best = Infinity
    pager.frames.forEach((residentPage, index) => {
      const used = residentPage === null ? -1 : (pager.lastUsed[residentPage] ?? -1)
      if (used < best) {
        best = used
        frame = index
      }
    })
    return { frame, event: 'replace', victim: pager.frames[frame] }
  }
  let frame = 0
  let farthest = -1
  pager.frames.forEach((residentPage, index) => {
    if (residentPage === null) return
    const distance = future.indexOf(residentPage)
    const score = distance === -1 ? Number.POSITIVE_INFINITY : distance
    if (score >= farthest) {
      farthest = score
      frame = index
    }
  })
  return { frame, event: 'replace', victim: pager.frames[frame] }
}

export function applyPlacement(pager: Pager, page: number, step: PageStep): Pager {
  const next = clone(pager)
  if (step.event === 'hit') {
    next.lastUsed[page] = next.time
    next.time += 1
    return next
  }
  const previous = next.frames[step.frame]
  if (previous !== null) {
    next.inserted = next.inserted.filter((value) => value !== previous)
    delete next.lastUsed[previous]
  }
  next.frames[step.frame] = page
  next.inserted.push(page)
  next.lastUsed[page] = next.time
  next.time += 1
  next.faults += 1
  return next
}

export function simulate(reference: readonly number[], frames: number, algo: ReplaceAlgo): { faults: number; pager: Pager } {
  let pager = createPager(frames)
  reference.forEach((page, index) => {
    const future = reference.slice(index + 1)
    const step = nextPlacement(pager, page, future, algo)
    pager = applyPlacement(pager, page, step)
  })
  return { faults: pager.faults, pager }
}
