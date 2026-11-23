import { useMemo, useState } from 'react'
import { QuizRunner } from '@/components/QuizRunner'
import { WORLDS } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { orderSprint } from '@/lib/select'

export function SprintPage() {
  const { bank, progress, recordAnswer } = useArena()
  const [weeks, setWeeks] = useState<number[]>(WORLDS.map((world) => world.week))
  const [count, setCount] = useState(15)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const questions = useMemo(
    () => orderSprint(bank.questions, progress.answered, progress.mistakes, weeks, count),
    [bank.questions, count, progress.answered, progress.mistakes, weeks],
  )

  if (done) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">Sprint logged</h1>
        <p className="mt-2 text-muted">{done}</p>
        <button className="btn btn-primary mt-5" type="button" onClick={() => { setDone(null); setStarted(false) }}>
          New sprint
        </button>
      </section>
    )
  }

  if (started) {
    return (
      <QuizRunner
        title="Revision sprint"
        questions={questions}
        mode="practice"
        onAnswer={recordAnswer}
        onDone={(summary) => setDone(`${summary.correct} / ${summary.total} correct. Weak topics were placed first.`)}
      />
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Revision sprint</h1>
      <p className="mt-2 max-w-xl text-muted">A mixed set from the weeks you tick. Missed and weak topics come first.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Weeks">
        {WORLDS.map((world) => {
          const on = weeks.includes(world.week)
          return (
            <button
              key={world.week}
              type="button"
              aria-pressed={on}
              className={`chip ${on ? 'border-transparent bg-accent text-accentink' : ''}`}
              onClick={() =>
                setWeeks((current) =>
                  current.includes(world.week) ? current.filter((week) => week !== world.week) : [...current, world.week].sort((a, b) => a - b),
                )
              }
            >
              {world.week} {world.short}
            </button>
          )
        })}
      </div>
      <label className="mt-4 block text-sm">
        Questions
        <select className="ml-2 min-h-11 rounded-xl border border-line bg-bg2 px-3" value={count} onChange={(event) => setCount(Number(event.target.value))}>
          {[10, 15, 20].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary mt-5" type="button" disabled={questions.length === 0} onClick={() => setStarted(true)}>
        Start · {questions.length} ready
      </button>
    </section>
  )
}
