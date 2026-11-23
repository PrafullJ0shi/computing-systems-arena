import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuizRunner } from '@/components/QuizRunner'
import { useArena } from '@/context/ArenaContext'
import { grade } from '@/lib/scoring'
import type { MockResult, Question } from '@/types'

function orderMock(questions: Question[], ids: string[]): Question[] {
  if (ids.length === 0) return questions
  const byId = new Map(questions.map((question) => [question.id, question]))
  const ordered = ids.map((id) => byId.get(id)).filter((question): question is Question => Boolean(question))
  return ordered.length > 0 ? ordered : questions
}

export function MockPage() {
  const { bank, finishMock, progress } = useArena()
  const questions = useMemo(
    () => orderMock(bank.mockQuestions, bank.mock.questionIds),
    [bank.mock.questionIds, bank.mockQuestions],
  )
  const [run, setRun] = useState<{ endsAt: number } | null>(null)
  const [result, setResult] = useState<MockResult | null>(null)
  const [review, setReview] = useState(false)

  if (questions.length === 0) {
    return (
      <section className="panel p-6">
        <h1 className="text-2xl font-semibold">No mock is loaded</h1>
        <p className="mt-2 text-muted">Import a mock file from Settings, or use the bundled bank.</p>
      </section>
    )
  }

  if (result && review) {
    const byId = new Map(questions.map((question) => [question.id, question]))
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold">Review</h1>
        {result.questions.map((item, index) => {
          const question = byId.get(item.id)
          if (!question) return null
          return (
            <article key={item.id} className="panel p-4">
              <p className="font-mono text-xs text-muted">
                {index + 1}. Week {question.week} · {item.correct ? 'Correct' : 'Missed'}
                {question.needsReview ? ' · unverified' : ''}
              </p>
              <h2 className="mt-1 font-semibold">{question.prompt}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {question.options.map((option, optionIndex) => {
                  const picked = item.selected.includes(optionIndex)
                  const answer = question.answerIndexes.includes(optionIndex)
                  return (
                    <li key={option} className={answer ? 'text-[var(--ok-fg)]' : picked ? 'text-[var(--bad-fg)]' : ''}>
                      {answer ? 'Answer: ' : picked ? 'Your pick: ' : ''}
                      {option}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-sm text-muted">{question.explanation}</p>
            </article>
          )
        })}
        <button className="btn btn-ghost" type="button" onClick={() => setReview(false)}>
          Back to results
        </button>
      </section>
    )
  }

  if (result) {
    const weeks = Object.entries(result.byWeek).sort((a, b) => Number(a[0]) - Number(b[0]))
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">Mock results</h1>
        <p className="mt-2 text-lg">
          {result.correct} / {result.total} correct
        </p>
        <ul className="mt-4 space-y-2">
          {weeks.map(([week, row]) => (
            <li key={week} className="flex items-center justify-between gap-3 text-sm">
              <span>Week {week}</span>
              <span className="font-mono tabular-nums">
                {row.correct}/{row.total}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn btn-primary" type="button" onClick={() => setReview(true)}>
            Review answers
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setResult(null)}>
            Try again
          </button>
          <Link className="btn btn-ghost" to="/">
            Map
          </Link>
        </div>
      </section>
    )
  }

  if (!run) {
    return (
      <section className="panel p-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Timed paper</p>
        <h1 className="mt-2 text-3xl font-semibold">{bank.mock.title}</h1>
        <p className="mt-3 max-w-xl text-muted">
          {questions.length} questions, {bank.mock.durationMinutes} minutes. Feedback waits until the end. Your best recent score is{' '}
          {progress.mocks[0] ? `${progress.mocks[0].correct}/${progress.mocks[0].total}` : 'not taken yet'}.
        </p>
        <button
          className="btn btn-primary mt-5"
          type="button"
          onClick={() => setRun({ endsAt: Date.now() + bank.mock.durationMinutes * 60_000 })}
        >
          Start the clock
        </button>
      </section>
    )
  }

  return (
    <QuizRunner
      title={bank.mock.title}
      questions={questions}
      mode="exam"
      endsAt={run.endsAt}
      onDone={(summary) => {
        const byWeek: MockResult['byWeek'] = {}
        const graded = summary.picks.map((pick) => {
          const row = byWeek[String(pick.question.week)] ?? { correct: 0, total: 0 }
          row.total += 1
          if (pick.correct) row.correct += 1
          byWeek[String(pick.question.week)] = row
          return { question: pick.question, correct: grade(pick.question, { indexes: pick.selected }) }
        })
        const next: MockResult = {
          id: bank.mock.id,
          at: new Date().toISOString(),
          correct: summary.correct,
          total: summary.total,
          byWeek,
          questions: summary.picks.map((pick) => ({ id: pick.question.id, selected: pick.selected, correct: pick.correct })),
        }
        finishMock(next, graded)
        setResult(next)
        setRun(null)
      }}
    />
  )
}
