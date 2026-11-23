import { Link, useParams } from 'react-router-dom'
import { badgeId, worldByWeek } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { worldMastery } from '@/lib/stats'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function WorldPage() {
  const { week: weekParam } = useParams()
  const week = Number(weekParam)
  const world = worldByWeek(week)
  const { bank, progress } = useArena()
  if (!world) return <NotFoundPage />
  const content = bank.weeks.find((item) => item.week === week)
  const questions = content?.questions ?? []
  const mastery = worldMastery(questions, progress.answered)
  const badge = progress.badges.includes(badgeId(week))
  const game = progress.games[String(week)]

  return (
    <article>
      <Link to="/" className="text-sm text-muted">
        ← Map
      </Link>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em]" style={{ color: world.accent }}>
        World {world.week}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{content?.title ?? world.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{content?.blurb ?? world.blurb}</p>
      <dl className="mt-5 grid grid-cols-3 gap-2">
        {[
          ['Mastered', `${mastery.correct}/${mastery.total}`],
          ['Boss', mastery.bossUnlocked ? 'Open' : 'Locked'],
          ['Badge', badge ? world.badge : 'Hidden'],
        ].map(([label, value]) => (
          <div key={label} className="panel p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-1 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="btn btn-primary" to={`/quiz/${week}`}>
          Quiz
        </Link>
        <Link className="btn btn-teal" to={`/play/${week}`}>
          {world.gameTitle}
          {game?.passed ? ' · cleared' : ''}
        </Link>
        <Link className="btn btn-ghost" to={`/boss/${week}`}>
          Boss
        </Link>
        <Link className="btn btn-ghost" to={`/cards?week=${week}`}>
          Cards
        </Link>
      </div>
    </article>
  )
}
