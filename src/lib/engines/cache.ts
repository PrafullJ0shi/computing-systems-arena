export interface CacheLine {
  valid: boolean
  tag: number
  addr: number | null
}

export function emptyCache(lines: number): CacheLine[] {
  return Array.from({ length: lines }, () => ({ valid: false, tag: 0, addr: null }))
}

export function splitAddress(addr: number, lines: number): { index: number; tag: number } {
  const width = Math.max(1, lines)
  return { index: ((addr % width) + width) % width, tag: Math.floor(addr / width) }
}

export function probe(cache: readonly CacheLine[], addr: number): 'hit' | 'miss' {
  const { index, tag } = splitAddress(addr, cache.length)
  const line = cache[index]
  return line && line.valid && line.tag === tag ? 'hit' : 'miss'
}

export function access(cache: readonly CacheLine[], addr: number): { result: 'hit' | 'miss'; cache: CacheLine[] } {
  const result = probe(cache, addr)
  const next = cache.map((line) => ({ ...line }))
  const { index, tag } = splitAddress(addr, next.length)
  next[index] = { valid: true, tag, addr }
  return { result, cache: next }
}
