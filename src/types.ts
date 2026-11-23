export type QuestionType = 'mcq' | 'multi' | 'short' | 'scenario' | 'code'
export type Source = 'quiz' | 'extra' | 'mock'
export type ThemeName = 'dark' | 'light'
export type BankOrigin = 'sample' | 'mixed' | 'imported'

export interface Question {
  id: string
  week: number
  source: Source
  type: QuestionType
  prompt: string
  code?: string
  options: string[]
  answerIndexes: number[]
  answerText: string
  explanation: string
  tags: string[]
  difficulty: 1 | 2 | 3
  traps: string[]
  unkeyed: boolean
  needsReview: boolean
}

export interface Boss {
  id: string
  week: number
  weeks: number[]
  title: string
  prompt: string
  rubric: string[]
  sampleStub: string
}

export interface Flashcard {
  id: string
  week: number
  front: string
  back: string
  tags: string[]
}

export interface MockSpec {
  id: string
  title: string
  durationMinutes: number
  questionCount: number
  questionIds: string[]
}

export interface WeekContent {
  week: number
  title: string
  blurb: string
  learningGoals: string[]
  summary: string[]
  commonTraps: string[]
  questions: Question[]
}

export interface Bank {
  weeks: WeekContent[]
  questions: Question[]
  bosses: Boss[]
  flashcards: Flashcard[]
  mock: MockSpec
  mockQuestions: Question[]
  origin: BankOrigin
  replacedWeeks: number[]
}

export interface AnswerRecord {
  correct: boolean
  attempts: number
  correctCount: number
  lastAt: string
}

export interface GameRecord {
  best: number
  plays: number
  passed: boolean
}

export interface BossRecord {
  checks: boolean[]
  completed: boolean
  xpAwarded: boolean
}

export interface CardRecord {
  ease: number
  interval: number
  repetitions: number
  due: string
  lapses: number
}

export interface MockAnswer {
  id: string
  selected: number[]
  correct: boolean
}

export interface MockResult {
  id: string
  at: string
  correct: number
  total: number
  byWeek: Record<string, { correct: number; total: number }>
  questions: MockAnswer[]
}

export interface Progress {
  version: 1
  xp: number
  streak: number
  longestStreak: number
  lastActiveDate: string | null
  displayName: string
  theme: ThemeName
  answered: Record<string, AnswerRecord>
  mistakes: string[]
  badges: string[]
  games: Record<string, GameRecord>
  bosses: Record<string, BossRecord>
  flashcards: Record<string, CardRecord>
  mocks: MockResult[]
  cardXpDate: string | null
  cardXpToday: number
}

export interface WorldDef {
  week: number
  title: string
  short: string
  blurb: string
  gameTitle: string
  badge: string
  accent: string
}
