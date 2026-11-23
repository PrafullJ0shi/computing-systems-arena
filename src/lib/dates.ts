export function todayLocal(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseIsoDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return Date.UTC(year, month - 1, day)
}

/** Whole days from `from` to `to`. Positive when `to` is later. */
export function daysBetween(from: string, to: string): number | null {
  const start = parseIsoDate(from)
  const end = parseIsoDate(to)
  if (start === null || end === null) return null
  return Math.round((end - start) / 86_400_000)
}

export function addDays(iso: string, days: number): string {
  const start = parseIsoDate(iso)
  if (start === null) return iso
  const next = new Date(start + days * 86_400_000)
  const year = next.getUTCFullYear()
  const month = String(next.getUTCMonth() + 1).padStart(2, '0')
  const day = String(next.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
