import { strFromU8, unzipSync } from 'fflate'
import { ingestFiles, type RawFile, type SkippedFile } from '@/lib/loader'
import type { Bank, Boss, Flashcard, MockSpec, Question } from '@/types'

export interface ImportReport {
  filesRead: number
  filesSkipped: SkippedFile[]
  weeks: number[]
  questions: number
  droppedQuestions: number
  bosses: number
  flashcards: number
  mock: boolean
}

export interface ImportPayload {
  version: 1
  importedAt: string
  weeks: Record<string, Question[]>
  bosses: Boss[] | null
  flashcards: Flashcard[] | null
  mock: MockSpec | null
  mockQuestions: Question[]
  report: ImportReport
}

export function importFromTexts(
  files: { name: string; text: string }[],
  importedAt = new Date().toISOString(),
): { payload: ImportPayload; report: ImportReport } {
  const raw: RawFile[] = []
  const skipped: SkippedFile[] = []
  for (const file of files) {
    try {
      raw.push({ name: file.name, data: JSON.parse(file.text) as unknown, origin: 'private' })
    } catch {
      skipped.push({ name: file.name, reason: 'invalid JSON' })
    }
  }
  const ingested = ingestFiles(raw)
  const weeks: Record<string, Question[]> = {}
  for (const [week, value] of ingested.weeks) weeks[String(week)] = value.questions
  const questions = Object.values(weeks).reduce((sum, list) => sum + list.length, 0)
  const report: ImportReport = {
    filesRead: files.length,
    filesSkipped: [...skipped, ...ingested.skipped],
    weeks: [...ingested.weeks.keys()].sort((a, b) => a - b),
    questions,
    droppedQuestions: ingested.droppedQuestions,
    bosses: ingested.bossesOrigin ? ingested.bosses.length : 0,
    flashcards: ingested.flashOrigin ? ingested.flashcards.length : 0,
    mock: Boolean(ingested.mock),
  }
  return {
    report,
    payload: {
      version: 1,
      importedAt,
      weeks,
      bosses: ingested.bossesOrigin ? ingested.bosses : null,
      flashcards: ingested.flashOrigin ? ingested.flashcards : null,
      mock: ingested.mock,
      mockQuestions: ingested.mockQuestions,
      report,
    },
  }
}

export function importFromZip(data: Uint8Array, importedAt?: string): { payload: ImportPayload; report: ImportReport } {
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(data)
  } catch {
    const report: ImportReport = {
      filesRead: 1,
      filesSkipped: [{ name: 'archive.zip', reason: 'could not unzip' }],
      weeks: [],
      questions: 0,
      droppedQuestions: 0,
      bosses: 0,
      flashcards: 0,
      mock: false,
    }
    return {
      report,
      payload: {
        version: 1,
        importedAt: importedAt ?? new Date().toISOString(),
        weeks: {},
        bosses: null,
        flashcards: null,
        mock: null,
        mockQuestions: [],
        report,
      },
    }
  }
  const files: { name: string; text: string }[] = []
  for (const [name, bytes] of Object.entries(entries)) {
    if (name.endsWith('/') || name.includes('__MACOSX') || !name.toLowerCase().endsWith('.json')) continue
    files.push({ name, text: strFromU8(bytes) })
  }
  return importFromTexts(files, importedAt)
}

export function payloadIsEmpty(payload: ImportPayload): boolean {
  return (
    Object.keys(payload.weeks).length === 0 &&
    payload.bosses === null &&
    payload.flashcards === null &&
    payload.mock === null
  )
}

export function applyPayload(base: Bank, payload: ImportPayload | null): Bank {
  if (!payload || payloadIsEmpty(payload)) return base
  const replaced = Object.keys(payload.weeks)
    .map(Number)
    .filter((week) => week >= 1 && week <= 13)
    .sort((a, b) => a - b)
  const weeks = base.weeks.map((week) => {
    const replacement = payload.weeks[String(week.week)]
    return replacement ? { ...week, questions: replacement } : week
  })
  const full = replaced.length >= base.weeks.length
  return {
    weeks,
    questions: weeks.flatMap((week) => week.questions),
    bosses: payload.bosses ?? base.bosses,
    flashcards: payload.flashcards ?? base.flashcards,
    mock: payload.mock ?? base.mock,
    mockQuestions: payload.mock ? payload.mockQuestions : base.mockQuestions,
    origin: full ? 'imported' : 'mixed',
    replacedWeeks: replaced,
  }
}
