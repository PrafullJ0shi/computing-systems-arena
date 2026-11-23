import { Link } from 'react-router-dom'
import { WORLDS, badgeId } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { worldMastery } from '@/lib/stats'

export function MapPage() {
  const { bank, progress } = useArena()
  const rows = WORLDS.map((world) => {
    const content = bank.weeks.find((item) => item.week === world.week)
    const mastery = worldMastery(content?.questions ?? [], progress.answered)
    return {
      world,
      title: content?.title ?? world.title,
      blurb: content?.blurb ?? world.blurb,
      mastery,
      badge: progress.badges.includes(badgeId(world.week)),
    }
  })
  const weakest = [...rows].sort((a, b) => a.mastery.ratio - b.mastery.ratio || a.world.week - b.world.week)[0]

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Computing Systems · 13 worlds</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Thirteen worlds. All of them open.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Revise Computing Systems one machine at a time: a quiz, a mini-game, flashcards, and a boss that waits until you hold 70% of the world.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="btn btn-primary" to={`/quiz/${weakest.world.week}`}>
          Revise {weakest.world.short}
        </Link>
        <Link className="btn btn-ghost" to="/mock">
          45-minute mock
        </Link>
        <Link className="btn btn-ghost" to="/vault">
          Mistake vault ({progress.mistakes.length})
        </Link>
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map(({ world, title, blurb, mastery, badge }) => {
          const width = `${Math.round(mastery.ratio * 100)}%`
          return (
            <li key={world.week}>
              <Link
                to={`/world/${world.week}`}
                className="panel flex h-full gap-3 p-4 transition hover:-translate-y-0.5"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-sm font-semibold"
                  style={{ background: world.accent, color: '#1a1408' }}
                >
                  {String(world.week).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-5">{title}</span>
                    {badge && <span className="chip shrink-0">Badge</span>}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{blurb}</span>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-bg3" aria-hidden="true">
                    <span className="block h-full rounded-full" style={{ width, background: world.accent }} />
                  </span>
                  <span className="mt-1 block font-mono text-xs text-muted">
                    {mastery.correct}/{mastery.total || 0} mastered
                    {mastery.bossUnlocked ? ' · boss open' : ' · boss at 70%'}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
