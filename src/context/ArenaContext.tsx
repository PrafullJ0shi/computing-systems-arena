import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import bundledBank from 'virtual:sample-bank'
import { rankForXp } from '@/config/ranks'
import { applyPayload, payloadIsEmpty, type ImportPayload } from '@/lib/bankImport'
import { todayLocal } from '@/lib/dates'
import { BANK_KEY, idbDel, idbGet, idbSet } from '@/lib/idb'
import {
  PROGRESS_KEY,
  applyAnswer,
  applyBoss,
  applyCard,
  applyGame,
  applyMock,
  emptyProgress,
  noteAnswer,
  sanitizeProgress,
} from '@/lib/progress'
import type { Bank, Progress, Question } from '@/types'

interface ArenaValue {
  ready: boolean
  bank: Bank
  progress: Progress
  rank: ReturnType<typeof rankForXp>
  banner: string | null
  dismissBanner: () => void
  recordAnswer: (question: Question, correct: boolean) => void
  finishMock: (result: Progress['mocks'][number], graded: { question: Question; correct: boolean }[]) => void
  recordGame: (week: number, score: number, passed: boolean) => void
  recordBoss: (bossId: string, checks: boolean[]) => void
  reviewCard: (cardId: string, grade: number) => void
  setTheme: (theme: Progress['theme']) => void
  setName: (name: string) => void
  resetProgress: () => void
  exportProgress: () => string
  importProgress: (raw: string) => string | null
  importBank: (payload: ImportPayload) => Promise<string | null>
  clearBank: () => Promise<void>
}

const ArenaContext = createContext<ArenaValue | null>(null)

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return emptyProgress()
    return sanitizeProgress(JSON.parse(raw) as unknown) ?? emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function ArenaProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [imported, setImported] = useState<ImportPayload | null>(null)
  const [ready, setReady] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    idbGet<ImportPayload>(BANK_KEY)
      .then((value) => {
        if (cancelled) return
        if (value && value.version === 1 && !payloadIsEmpty(value)) setImported(value)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    document.documentElement.dataset.theme = progress.theme
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', progress.theme === 'light' ? '#f4f5f2' : '#16181b')
  }, [progress])

  const bank = useMemo(() => applyPayload(bundledBank, imported), [imported])
  const rank = rankForXp(progress.xp)

  const commit = (next: Progress, rankUp: string | null, xpGained: number) => {
    setProgress(next)
    if (rankUp) setBanner(`Rank up: ${rankUp}`)
    else if (xpGained > 0) setBanner(`+${xpGained} XP`)
  }

  const value = useMemo<ArenaValue>(() => {
    const today = () => todayLocal()
    const now = () => new Date().toISOString()
    return {
      ready,
      bank,
      progress,
      rank,
      banner,
      dismissBanner: () => setBanner(null),
      recordAnswer: (question, correct) => {
        const result = applyAnswer(progress, question, correct, today(), now())
        commit(result.progress, result.rankUp, result.xpGained)
      },
      finishMock: (result, graded) => {
        let next = progress
        for (const item of graded) next = noteAnswer(next, item.question, item.correct, now())
        const studied = applyMock(next, result, today())
        commit(studied.progress, studied.rankUp, studied.xpGained)
      },
      recordGame: (week, score, passed) => {
        const result = applyGame(progress, week, score, passed, today())
        commit(result.progress, result.rankUp, result.xpGained)
      },
      recordBoss: (bossId, checks) => {
        const result = applyBoss(progress, bossId, checks, today())
        commit(result.progress, result.rankUp, result.xpGained)
      },
      reviewCard: (cardId, grade) => {
        const result = applyCard(progress, cardId, grade, today())
        commit(result.progress, result.rankUp, result.xpGained)
      },
      setTheme: (theme) => setProgress((current) => ({ ...current, theme })),
      setName: (name) => setProgress((current) => ({ ...current, displayName: name.slice(0, 40) })),
      resetProgress: () =>
        setProgress((current) => ({ ...emptyProgress(), theme: current.theme, displayName: current.displayName })),
      exportProgress: () => JSON.stringify(progress, null, 2),
      importProgress: (raw) => {
        try {
          const parsed = sanitizeProgress(JSON.parse(raw) as unknown)
          if (!parsed) return 'That file is not an Arena progress export.'
          setProgress(parsed)
          return null
        } catch {
          return 'Could not read that JSON file.'
        }
      },
      importBank: async (payload) => {
        if (payloadIsEmpty(payload)) return 'No week, boss, flashcard, or mock files were recognized.'
        try {
          await idbSet(BANK_KEY, payload)
          setImported(payload)
          return null
        } catch {
          return 'This browser could not store the question bank.'
        }
      },
      clearBank: async () => {
        setImported(null)
        await idbDel(BANK_KEY)
      },
    }
  }, [ready, bank, progress, rank, banner])

  return <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>
}

export function useArena(): ArenaValue {
  const value = useContext(ArenaContext)
  if (!value) throw new Error('useArena must be used inside ArenaProvider')
  return value
}
