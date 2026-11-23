import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuizRunner } from '@/components/QuizRunner'
import { worldByWeek } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { countsForMastery } from '@/lib/scoring'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function QuizPage() {
  const { week: weekParam } = useParams()
  const week = Number(weekParam)
  const world = worldByWeek(week)
  const { bank, recordAnswer } = useArena()
  const [done, setDone] = useState<{ correct: number; total: number } | null>(null)
  const questions = useMemo(
    () => (bank.weeks.find((item) => item.week === week)?.questions ?? []).filter(countsForMastery),
    [bank.weeks, week],
  )
  if (!world) return <NotFoundPage />
  if (done) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">World {week} logged</h1>
        <p className="mt-2 text-muted">
          {done.correct} / {done.total} correct this pass. Misses are waiting in the vault.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="btn btn-primary" to={`/world/${week}`}>
            Back to the world
          </Link>
          <button className="btn btn-ghost" type="button" onClick={() => setDone(null)}>
            Run it again
          </button>
        </div>
      </section>
    )
  }
  return (
    <QuizRunner
      title={world.title}
      questions={questions}
      mode="practice"
      onAnswer={recordAnswer}
      onDone={(summary) => setDone({ correct: summary.correct, total: summary.total })}
    />
  )
}
