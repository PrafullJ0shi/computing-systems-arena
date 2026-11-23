export type Base = 2 | 10 | 16

export function parseBase(input: string, base: Base): number | null {
  let text = input.trim().toLowerCase().replace(/[\s_]/g, '')
  if (!text) return null
  if (base === 2 && text.startsWith('0b')) text = text.slice(2)
  if (base === 16 && text.startsWith('0x')) text = text.slice(2)
  if (!text) return null
  if (base === 2 && !/^[01]+$/.test(text)) return null
  if (base === 10 && !/^\d+$/.test(text)) return null
  if (base === 16 && !/^[0-9a-f]+$/.test(text)) return null
  const value = Number.parseInt(text, base)
  if (!Number.isInteger(value) || value < 0 || value > 0xffff) return null
  return value
}

export function formatBase(value: number, base: Base): string {
  if (base === 10) return String(value)
  if (base === 16) return value.toString(16).toUpperCase()
  return value.toString(2)
}

export function valuesMatch(input: string, expected: number, base: Base): boolean {
  return parseBase(input, base) === expected
}
