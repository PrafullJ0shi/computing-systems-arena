import type { Boss, Flashcard, MockSpec, Question, QuestionType, Source, WeekContent, WorldDef } from '../types'
import { hashString } from './rng'

export interface RawFile {
  name: string
  data: unknown
  origin: 'sample' | 'private'
}

export interface SkippedFile {
  name: string
  reason: string
}

interface WeekBucket {
  questions: Question[]
  origin: 'sample' | 'private'
  title?: string
  learningGoals: string[]
  summary: string[]
  commonTraps: string[]
}

export interface Ingested {
  weeks: Map<number, WeekBucket>
  bosses: Boss[]
  bossesOrigin: 'sample' | 'private' | null
  flashcards: Flashcard[]
  flashOrigin: 'sample' | 'private' | null
  mock: MockSpec | null
  mockQuestions: Question[]
  mockOrigin: 'sample' | 'private' | null
  droppedQuestions: number
  skipped: SkippedFile[]
  filesRead: number
}

const SOURCES: readonly Source[] = ['quiz', 'extra', 'mock']
const TYPES: readonly QuestionType[] = ['mcq', 'multi', 'short', 'scenario', 'code']

const DEFAULT_MOCK: MockSpec = {
  id: 'mock',
  title: 'End-term mock',
  durationMinutes: 45,
  questionCount: 40,
  questionIds: [],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function asStringList(value: unknown): string[] {
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  if (!Array.isArray(value)) return []
  return value.map(asString).filter((item): item is string => Boolean(item && item.trim()))
}

function clampDifficulty(value: unknown): 1 | 2 | 3 {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return 2
  if (number <= 1) return 1
  if (number >= 3) return 3
  return 2
}

function weekFromName(name: string): number | null {
  const match = /week[-_\s]?0*(\d{1,2})/i.exec(name.replaceAll('\\', '/'))
  if (!match) return null
  const week = Number(match[1])
  if (week < 1 || week > 13) return null
  return week
}

function fileKind(name: string): 'week' | 'mock' | 'boss' | 'flash' | null {
  const base = name.replaceAll('\\', '/').split('/').pop()?.toLowerCase() ?? ''
  if (weekFromName(base) || weekFromName(name)) return 'week'
  if (base.includes('mock')) return 'mock'
  if (base.includes('boss')) return 'boss'
  if (base.includes('flash')) return 'flash'
  return null
}

function letterIndex(token: string, optionCount: number): number | null {
  const trimmed = token.trim()
  if (/^[A-Za-z]$/.test(trimmed)) {
    const index = trimmed.toUpperCase().charCodeAt(0) - 65
    return index >= 0 && index < optionCount ? index : null
  }
  return null
}

export function parseAnswerIndexes(answer: unknown, options: string[], ids: string[] = []): number[] {
  const tokens: unknown[] = Array.isArray(answer) ? answer : answer === undefined || answer === null ? [] : [answer]
  const indexes: number[] = []
  for (const token of tokens) {
    if (typeof token === 'number' && Number.isInteger(token) && token >= 0 && token < options.length) {
      indexes.push(token)
      continue
    }
    const text = asString(token)
    if (!text) continue
    const pieces = text.split(/[,|]/).map((piece) => piece.trim()).filter(Boolean)
    const parts = pieces.length > 1 ? pieces : [text.trim()]
    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        const index = Number(part)
        if (index >= 0 && index < options.length) indexes.push(index)
        continue
      }
      const idIndex = ids.findIndex((id) => id.toLowerCase() === part.toLowerCase())
      if (idIndex >= 0) {
        indexes.push(idIndex)
        continue
      }
      const letter = letterIndex(part, options.length)
      if (letter !== null) {
        indexes.push(letter)
        continue
      }
      const optionIndex = options.findIndex((option) => option.trim().toLowerCase() === part.toLowerCase())
      if (optionIndex >= 0) indexes.push(optionIndex)
    }
  }
  return [...new Set(indexes)]
}

function readOptions(raw: unknown): { texts: string[]; ids: string[] } {
  if (!Array.isArray(raw)) return { texts: [], ids: [] }
  const texts: string[] = []
  const ids: string[] = []
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      texts.push(item)
      ids.push('')
      continue
    }
    if (!isRecord(item)) continue
    const text = asString(item.text) ?? asString(item.label) ?? ''
    if (!text.trim()) continue
    texts.push(text.trim())
    ids.push((asString(item.id) ?? '').trim())
  }
  return { texts, ids }
}

export function normalizeQuestion(raw: unknown, fallbackWeek: number, index: number): Question | null {
  if (!isRecord(raw)) return null
  const prompt = asString(raw.prompt) ?? asString(raw.question) ?? asString(raw.text) ?? ''
  if (!prompt.trim()) return null
  const { texts: options, ids } = readOptions(raw.options)
  let type: QuestionType = TYPES.includes(raw.type as QuestionType) ? (raw.type as QuestionType) : 'mcq'
  const answerField = raw.correctAnswers ?? raw.answer ?? raw.answers ?? raw.correct
  const answerIndexes = parseAnswerIndexes(answerField, options, ids)
  if (type === 'mcq' && answerIndexes.length > 1) type = 'multi'
  if (!TYPES.includes(type)) type = 'mcq'
  const weekNumber = Number(raw.week)
  const week = Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 13 ? weekNumber : fallbackWeek
  const source: Source = SOURCES.includes(raw.source as Source) ? (raw.source as Source) : 'extra'
  const suppliedId = asString(raw.id)?.trim()
  const id = suppliedId || `w${String(week).padStart(2, '0')}-${hashString(prompt)}-${index}`
  const model = asStringList(answerField).join('\n') || asString(raw.modelAnswer) || ''
  const choice = type === 'mcq' || type === 'multi' || ((type === 'code' || type === 'scenario') && options.length > 0)
  const unkeyed = choice && answerIndexes.length === 0
  const code = asString(raw.code)?.trim()
  return {
    id,
    week,
    source,
    type,
    prompt: prompt.trim(),
    code: code || undefined,
    options,
    answerIndexes,
    answerText: options.length > 0 && answerIndexes.length > 0 ? '' : model.trim(),
    explanation: (asString(raw.explanation) ?? asString(raw.explain) ?? '').trim(),
    tags: asStringList(raw.topicTags ?? raw.tags).map((tag) => tag.toLowerCase()),
    difficulty: clampDifficulty(raw.difficulty),
    traps: asStringList(raw.trapTags ?? raw.traps ?? raw.trap),
    unkeyed,
    needsReview: raw.needsReview === true,
  }
}

function questionsFromWeekData(data: unknown, fallbackWeek: number): { questions: Question[]; dropped: number } {
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.questions)
      ? data.questions
      : null
  if (!list) return { questions: [], dropped: 0 }
  const questions: Question[] = []
  let dropped = 0
  list.forEach((item, index) => {
    const question = normalizeQuestion(item, fallbackWeek, index)
    if (!question) {
      dropped += 1
      return
    }
    questions.push(question)
  })
  return { questions, dropped }
}

function weekNumberFromData(data: unknown, name: string): number | null {
  if (isRecord(data)) {
    const week = Number(data.week)
    if (Number.isInteger(week) && week >= 1 && week <= 13) return week
  }
  return weekFromName(name)
}

export function normalizeBoss(raw: unknown, index: number): Boss | null {
  if (!isRecord(raw)) return null
  const prompt = asString(raw.prompt) ?? asString(raw.question) ?? ''
  if (!prompt.trim()) return null
  const rubric = asStringList(raw.rubric ?? raw.steps ?? raw.checklist)
  if (rubric.length === 0) return null
  const week = Number(raw.week)
  const id = asString(raw.id)?.trim() || `boss-${hashString(prompt)}-${index}`
  const weekList = Array.isArray(raw.weeks)
    ? raw.weeks.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 13)
    : []
  const primary = Number.isInteger(week) && week >= 1 && week <= 13 ? week : weekList[0] ?? 1
  const weeks = weekList.length > 0 ? weekList : [primary]
  return {
    id,
    week: primary,
    weeks,
    title: (asString(raw.title) ?? `Boss ${index + 1}`).trim(),
    prompt: prompt.trim(),
    rubric,
    sampleStub: (asString(raw.sampleStub) ?? asString(raw.sample) ?? asString(raw.stub) ?? asString(raw.outline) ?? '').trim(),
  }
}

export function normalizeCard(raw: unknown, index: number): Flashcard | null {
  if (!isRecord(raw)) return null
  const front = asString(raw.front) ?? asString(raw.prompt) ?? asString(raw.question) ?? ''
  const back = asString(raw.back) ?? asString(raw.answer) ?? asString(raw.explanation) ?? ''
  if (!front.trim() || !back.trim()) return null
  const id = asString(raw.id)?.trim() || `card-${hashString(front)}-${index}`
  let week = 1
  if (raw.week === null) week = 0
  else {
    const parsed = Number(raw.week)
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 13) week = parsed
  }
  const kind = asString(raw.kind)
  return {
    id,
    week,
    front: front.trim(),
    back: back.trim(),
    tags: [kind, ...asStringList(raw.tags)].filter((tag): tag is string => Boolean(tag)).map((tag) => tag.toLowerCase()),
  }
}

export function normalizeMock(raw: unknown): MockSpec | null {
  if (!isRecord(raw)) return null
  const embedded = Array.isArray(raw.questions) ? raw.questions : null
  const ids = embedded
    ? embedded
        .map((item) => (isRecord(item) ? asString(item.id) : null))
        .filter((id): id is string => Boolean(id))
    : asStringList(raw.questionIds ?? raw.ids)
  const count = embedded ? embedded.length : Number(raw.questionCount ?? raw.count)
  const minutes = Number(raw.durationMinutes ?? raw.timeMinutes ?? raw.minutes ?? raw.duration)
  return {
    id: (asString(raw.id) ?? 'mock').trim(),
    title: (asString(raw.title) ?? DEFAULT_MOCK.title).trim(),
    durationMinutes: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : DEFAULT_MOCK.durationMinutes,
    questionCount: Number.isFinite(count) && count > 0 ? Math.round(count) : ids.length || DEFAULT_MOCK.questionCount,
    questionIds: ids,
  }
}

function sharedRubric(data: unknown): string[] {
  if (!isRecord(data) || !isRecord(data.rubric) || !Array.isArray(data.rubric.steps)) return []
  return data.rubric.steps
    .map((step) => {
      if (typeof step === 'string') return step
      if (!isRecord(step)) return ''
      const name = asString(step.name) ?? ''
      const check = asString(step.check) ?? asString(step.text) ?? ''
      return [name, check].filter(Boolean).join(': ')
    })
    .filter(Boolean)
}

function bossesFrom(data: unknown): Boss[] {
  if (isRecord(data) && Array.isArray(data.top25)) {
    const rubric = sharedRubric(data)
    return data.top25
      .map((item, index) => {
        if (!isRecord(item)) return null
        const weeks = Array.isArray(item.weeks)
          ? item.weeks.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 13)
          : []
        return normalizeBoss(
          {
            id: `boss-${asString(item.rank) ?? index + 1}`,
            week: weeks[0] ?? 1,
            weeks,
            title: `Boss ${asString(item.rank) ?? index + 1}`,
            prompt: item.question,
            rubric,
            outline: item.outline,
          },
          index,
        )
      })
      .filter((item): item is Boss => item !== null)
  }
  const list = Array.isArray(data) ? data : isRecord(data) && Array.isArray(data.bosses) ? data.bosses : null
  if (!list) return []
  return list.map((item, index) => normalizeBoss(item, index)).filter((item): item is Boss => item !== null)
}

function cardsFrom(data: unknown): Flashcard[] {
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.cards)
      ? data.cards
      : isRecord(data) && Array.isArray(data.flashcards)
        ? data.flashcards
        : null
  if (!list) return []
  return list.map((item, index) => normalizeCard(item, index)).filter((item): item is Flashcard => item !== null)
}

function looksLikeWeek(data: unknown): boolean {
  return Array.isArray(data) || (isRecord(data) && Array.isArray(data.questions))
}

function looksLikeBoss(data: unknown): boolean {
  return Array.isArray(data)
    ? data.some((item) => isRecord(item) && (item.rubric || item.checklist))
    : isRecord(data) && (Array.isArray(data.bosses) || Array.isArray(data.top25))
}

function looksLikeCards(data: unknown): boolean {
  return Array.isArray(data)
    ? data.some((item) => isRecord(item) && (item.front || item.back))
    : isRecord(data) && (Array.isArray(data.cards) || Array.isArray(data.flashcards))
}

export function ingestFiles(files: RawFile[]): Ingested {
  const result: Ingested = {
    weeks: new Map(),
    bosses: [],
    bossesOrigin: null,
    flashcards: [],
    flashOrigin: null,
    mock: null,
    mockQuestions: [],
    mockOrigin: null,
    droppedQuestions: 0,
    skipped: [],
    filesRead: 0,
  }
  const ordered = [...files].sort((a, b) => {
    if (a.origin !== b.origin) return a.origin === 'sample' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  for (const file of ordered) {
    result.filesRead += 1
    if (file.data === null || file.data === undefined) {
      result.skipped.push({ name: file.name, reason: 'empty file' })
      continue
    }
    const kind = fileKind(file.name)
    const asWeek = kind === 'week' || (kind === null && looksLikeWeek(file.data) && !looksLikeBoss(file.data) && !looksLikeCards(file.data))
    if (asWeek) {
      const week = weekNumberFromData(file.data, file.name)
      if (!week) {
        result.skipped.push({ name: file.name, reason: 'week file is missing a week number from 1 to 13' })
        continue
      }
      const parsed = questionsFromWeekData(file.data, week)
      result.droppedQuestions += parsed.dropped
      const existing = result.weeks.get(week)
      const replace = file.origin === 'private' && existing?.origin !== 'private'
      const questions = (replace || !existing ? [] : existing.questions).concat(
        parsed.questions.map((question) => ({ ...question, week: question.week || week })),
      )
      const deduped = new Map<string, Question>()
      for (const question of questions) deduped.set(question.id, { ...question, week })
      const record = isRecord(file.data) ? file.data : null
      const title = record ? asString(record.title)?.trim() : undefined
      result.weeks.set(week, {
        questions: [...deduped.values()],
        origin: file.origin === 'private' ? 'private' : existing?.origin ?? 'sample',
        title: title || existing?.title,
        learningGoals: record ? asStringList(record.learningGoals) : existing?.learningGoals ?? [],
        summary: record ? asStringList(record.summary) : existing?.summary ?? [],
        commonTraps: record ? asStringList(record.commonTraps) : existing?.commonTraps ?? [],
      })
      continue
    }
    if (kind === 'boss' || (kind === null && looksLikeBoss(file.data))) {
      const bosses = bossesFrom(file.data)
      if (bosses.length === 0 && kind !== 'boss') {
        result.skipped.push({ name: file.name, reason: 'not a week, mock, boss, or flashcard file' })
        continue
      }
      if (file.origin === 'private' || result.bossesOrigin !== 'private') {
        if (file.origin === 'private' && result.bossesOrigin !== 'private') result.bosses = []
        const merged = new Map(result.bosses.map((boss) => [boss.id, boss]))
        for (const boss of bosses) merged.set(boss.id, boss)
        result.bosses = [...merged.values()]
        result.bossesOrigin = file.origin === 'private' ? 'private' : result.bossesOrigin ?? 'sample'
      }
      continue
    }
    if (kind === 'flash' || (kind === null && looksLikeCards(file.data))) {
      const cards = cardsFrom(file.data)
      if (cards.length === 0 && kind !== 'flash') {
        result.skipped.push({ name: file.name, reason: 'not a week, mock, boss, or flashcard file' })
        continue
      }
      if (file.origin === 'private' && result.flashOrigin !== 'private') result.flashcards = []
      const merged = new Map(result.flashcards.map((card) => [card.id, card]))
      for (const card of cards) merged.set(card.id, card)
      result.flashcards = [...merged.values()]
      result.flashOrigin = file.origin === 'private' ? 'private' : result.flashOrigin ?? 'sample'
      continue
    }
    if (kind === 'mock') {
      const mock = normalizeMock(file.data)
      if (!mock) {
        result.skipped.push({ name: file.name, reason: 'mock file was not an object' })
        continue
      }
      if (file.origin === 'private' || result.mockOrigin !== 'private') {
        result.mock = mock
        result.mockOrigin = file.origin
        const embedded = isRecord(file.data) && Array.isArray(file.data.questions) ? file.data.questions : []
        result.mockQuestions = embedded
          .map((item, index) => normalizeQuestion(item, 1, index))
          .filter((item): item is Question => item !== null)
      }
      continue
    }
    result.skipped.push({ name: file.name, reason: 'not a week, mock, boss, or flashcard file' })
  }
  return result
}

export function assembleBank(files: RawFile[], worlds: readonly WorldDef[]) {
  const ingested = ingestFiles(files)
  const weeks: WeekContent[] = worlds.map((world) => {
    const stored = ingested.weeks.get(world.week)
    const goals = stored?.learningGoals ?? []
    return {
      week: world.week,
      title: stored?.title || world.title,
      blurb: goals[0] || world.blurb,
      learningGoals: goals,
      summary: stored?.summary ?? [],
      commonTraps: stored?.commonTraps ?? [],
      questions: stored?.questions ?? [],
    }
  })
  const replacedWeeks = [...ingested.weeks.entries()]
    .filter(([, value]) => value.origin === 'private')
    .map(([week]) => week)
    .sort((a, b) => a - b)
  const origin = replacedWeeks.length === 0 ? 'sample' : replacedWeeks.length >= worlds.length ? 'imported' : 'mixed'
  return {
    weeks,
    questions: weeks.flatMap((week) => week.questions),
    bosses: ingested.bosses,
    flashcards: ingested.flashcards,
    mock: ingested.mock ?? DEFAULT_MOCK,
    mockQuestions: ingested.mockQuestions,
    origin,
    replacedWeeks,
    droppedQuestions: ingested.droppedQuestions,
    skipped: ingested.skipped,
  } as const
}

export function emptyMock(): MockSpec {
  return { ...DEFAULT_MOCK, questionIds: [] }
}
