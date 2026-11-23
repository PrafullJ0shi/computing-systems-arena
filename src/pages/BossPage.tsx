import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { worldByWeek } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { worldMastery } from '@/lib/stats'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function BossPage() {
  const week = Number(useParams().week)
  const world = worldByWeek(week)
  const { bank, progress, recordBoss } = useArena()
  const content = bank.weeks.find((item) => item.week === week)
  const mastery = worldMastery(content?.questions ?? [], progress.answered)
  const bosses = bank.bosses.filter((boss) => boss.week === week || boss.weeks.includes(week))
  const [active, setActive] = useState(0)
  const boss = bosses[active]
  const saved = boss ? progress.bosses[boss.id]?.checks ?? [] : []
  const [checks, setChecks] = useState<boolean[]>(saved)

  if (!world) return <NotFoundPage />
  if (!mastery.bossUnlocked) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">Boss locked</h1>
        <p className="mt-2 text-muted">
          Reach 70% mastered in this world. You have {mastery.correct} of {mastery.total}.
        </p>
        <Link className="btn btn-primary mt-5" to={`/quiz/${week}`}>
          Practice the quiz
        </Link>
      </section>
    )
  }
  if (!boss) {
    return (
      <section className="panel p-6">
        <h1 className="text-2xl font-semibold">No boss is loaded for this world</h1>
      </section>
    )
  }

  return (
    <section>
      <Link to={`/world/${week}`} className="text-sm text-muted">
        ← {content?.title ?? world.title}
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">{boss.title}</h1>
      {bosses.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bosses.map((item, index) => (
            <button
              key={item.id}
              className="chip"
              type="button"
              aria-pressed={index === active}
              onClick={() => {
                setActive(index)
                setChecks(progress.bosses[item.id]?.checks ?? [])
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-lg leading-7">{boss.prompt}</p>
      <fieldset className="mt-4 space-y-2">
        <legend className="text-sm font-semibold">5-step rubric. Check each part you actually covered.</legend>
        {boss.rubric.map((step, index) => (
          <label key={step} className="panel flex min-h-12 items-start gap-3 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(checks[index])}
              onChange={() =>
                setChecks((current) => {
                  const next = boss.rubric.map((_, slot) => Boolean(current[slot]))
                  next[index] = !next[index]
                  return next
                })
              }
            />
            <span>{step}</span>
          </label>
        ))}
      </fieldset>
      <details className="panel mt-4 p-4">
        <summary className="cursor-pointer font-semibold">Sample outline</summary>
        <p className="mt-2 text-sm leading-6 text-muted">{boss.sampleStub}</p>
      </details>
      <button className="btn btn-primary mt-4" type="button" onClick={() => recordBoss(boss.id, boss.rubric.map((_, index) => Boolean(checks[index])))}>
        Save self-grade
      </button>
    </section>
  )
}
