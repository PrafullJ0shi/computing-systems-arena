import { useEffect, useMemo, useRef, useState } from 'react'
import { ISSUE_URL, sourceLabel } from '@/config/worlds'
import { grade, interaction } from '@/lib/scoring'
import type { Question } from '@/types'

interface QuizRunnerProps {
  title: string
  questions: Question[]
  mode: 'practice' | 'exam'
  onAnswer?: (question: Question, correct: boolean, selected: number[]) => void
  onDone: (summary: { correct: number; total: number; picks: { question: Question; selected: number[]; correct: boolean }[] }) => void
  endsAt?: number
}

function formatLeft(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function QuizRunner({ title, questions, mode, onAnswer, onDone, endsAt }: QuizRunnerProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [selfCorrect, setSelfCorrect] = useState<boolean | null>(null)
  const [picks, setPicks] = useState<{ question: Question; selected: number[]; correct: boolean }[]>([])
  const [now, setNow] = useState(() => Date.now())
  const headingRef = useRef<HTMLHeadingElement>(null)
  const doneRef = useRef(false)
  const picksRef = useRef(picks)
  picksRef.current = picks

  const question = questions[index]
  const modeKind = question ? interaction(question) : 'reveal'
  const correctNow = question
    ? grade(question, { indexes: selected, selfCorrect: selfCorrect ?? false })
    : false

  const finish = useRef(onDone)
  finish.current = onDone

  const complete = (finalPicks: typeof picks) => {
    if (doneRef.current) return
    doneRef.current = true
    const correct = finalPicks.filter((item) => item.correct).length
    finish.current({ correct, total: questions.length, picks: finalPicks })
  }

  useEffect(() => {
    headingRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (!endsAt) return
    const id = window.setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      if (tick < endsAt || doneRef.current) return
      doneRef.current = true
      const finalPicks = picksRef.current
      const correctCount = finalPicks.filter((item) => item.correct).length
      finish.current({ correct: correctCount, total: questions.length, picks: finalPicks })
    }, 250)
    return () => window.clearInterval(id)
  }, [endsAt, questions.length])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      if (!question || (revealed && mode === 'practice')) {
        if (revealed && (event.key === 'n' || event.key === 'N' || event.key === 'Enter')) {
          event.preventDefault()
          goNext()
        }
        return
      }
      if (/^[1-9]$/.test(event.key)) {
        const choice = Number(event.key) - 1
        if (choice < question.options.length) toggle(choice)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // The handlers close over the latest question state on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, revealed, selected, mode, index])

  function toggle(choice: number) {
    if (revealed && mode === 'practice') return
    if (modeKind === 'multi') {
      setSelected((current) => (current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice]))
    } else {
      setSelected([choice])
    }
  }

  function check() {
    if (!question || modeKind === 'reveal') return
    if (selected.length === 0) return
    const correct = grade(question, { indexes: selected })
    const next = [...picks, { question, selected, correct }]
    setPicks(next)
    onAnswer?.(question, correct, selected)
    if (mode === 'exam') {
      if (index + 1 >= questions.length) complete(next)
      else {
        setIndex((value) => value + 1)
        setSelected([])
      }
      return
    }
    setRevealed(true)
  }

  function goNext() {
    if (!question) return
    if (index + 1 >= questions.length) complete(picks)
    else {
      setIndex((value) => value + 1)
      setSelected([])
      setRevealed(false)
      setSelfCorrect(null)
    }
  }

  function gradeSelf(correct: boolean) {
    if (!question) return
    setSelfCorrect(correct)
    const next = [...picks, { question, selected: [], correct }]
    setPicks(next)
    onAnswer?.(question, correct, [])
    setRevealed(true)
  }

  const left = endsAt ? endsAt - now : null
  const letters = 'ABCDEFGHIJ'

  if (!question) {
    return (
      <section className="panel p-6">
        <h1 className="text-2xl font-semibold">Nothing to ask</h1>
        <p className="mt-2 text-muted">This set has no playable questions yet.</p>
      </section>
    )
  }

  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{title}</p>
        <p className="font-mono text-sm tabular-nums">
          {index + 1} / {questions.length}
          {left !== null && (
            <span className="ml-3" role="timer" aria-live="off">
              {formatLeft(left)}
            </span>
          )}
        </p>
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        {question.prompt}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Week {question.week} · {sourceLabel(question.source)} · {question.tags[0] || 'general'} · difficulty {question.difficulty}
        {modeKind === 'multi' ? ' · select all that apply' : ''}
      </p>
      {question.needsReview && (
        <p className="mt-3 text-sm">
          <span className="chip mr-2">unverified</span>
          <a
            className="underline"
            href={`${ISSUE_URL}?title=${encodeURIComponent(`Question ${question.id}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Report issue
          </a>
        </p>
      )}
      {question.code && (
        <pre className="mt-4 overflow-x-auto rounded-xl bg-bg3 p-4 font-mono text-sm leading-6">{question.code}</pre>
      )}
      {modeKind === 'reveal' ? (
        <div className="mt-5">
          {!revealed ? (
            <button className="btn btn-primary" type="button" onClick={() => setRevealed(true)}>
              Show a model answer
            </button>
          ) : (
            <div className="rounded-2xl bg-bg3 p-4">
              <p className="text-sm font-semibold">Model answer</p>
              <p className="mt-2">{question.answerText || question.explanation}</p>
              <p className="mt-3 text-sm text-muted">{question.explanation}</p>
              {selfCorrect === null && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn btn-teal" type="button" onClick={() => gradeSelf(true)}>
                    I had this
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => gradeSelf(false)}>
                    I missed it
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <ul className="mt-5 grid gap-2">
          {question.options.map((option, optionIndex) => {
            const active = selected.includes(optionIndex)
            const show = revealed && mode === 'practice'
            const isAnswer = question.answerIndexes.includes(optionIndex)
            let tone = 'border-line bg-bg'
            if (active) tone = 'border-accent bg-bg3'
            if (show && isAnswer) tone = 'border-transparent bg-[var(--ok-bg)] text-[var(--ok-fg)]'
            if (show && active && !isAnswer) tone = 'border-transparent bg-[var(--bad-bg)] text-[var(--bad-fg)]'
            return (
              <li key={`${question.id}-${optionIndex}`}>
                <button
                  type="button"
                  className={`flex w-full min-h-12 items-start gap-3 rounded-2xl border px-3 py-3 text-left ${tone}`}
                  aria-pressed={active}
                  onClick={() => toggle(optionIndex)}
                >
                  <span className="font-mono text-sm">{letters[optionIndex]}</span>
                  <span className="flex-1">{option}</span>
                  {show && isAnswer && <span className="text-sm font-semibold">Answer</span>}
                  {show && active && !isAnswer && <span className="text-sm font-semibold">Not this</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {revealed && mode === 'practice' && modeKind !== 'reveal' && (
        <div className="mt-4 rounded-2xl bg-bg3 p-4" role="status">
          <p className="font-semibold">{correctNow ? 'Correct.' : 'Not quite.'}</p>
          <p className="mt-2 text-sm leading-6">{question.explanation}</p>
          {question.traps.length > 0 && (
            <p className="mt-3 text-sm">
              <span className="chip mr-2">Trap</span>
              {question.traps.join(' ')}
            </p>
          )}
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {modeKind !== 'reveal' && !(revealed && mode === 'practice') && (
          <button className="btn btn-primary" type="button" onClick={check} disabled={selected.length === 0}>
            {mode === 'exam' ? 'Lock answer' : 'Check answer'}
          </button>
        )}
        {((revealed && mode === 'practice' && (modeKind === 'reveal' ? selfCorrect !== null : true)) || false) && (
          <button className="btn btn-teal" type="button" onClick={goNext}>
            {index + 1 >= questions.length ? 'Finish' : 'Next'}
          </button>
        )}
        <p className="text-sm text-muted">Keys 1–9 select. Enter checks. N moves on.</p>
      </div>
    </section>
  )
}

export function useQuestionList(questions: Question[]): Question[] {
  return useMemo(() => questions, [questions])
}
