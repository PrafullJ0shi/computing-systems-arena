import { Link } from 'react-router-dom'
import { WORLDS, badgeId } from '@/config/worlds'
import { WorldMark } from '@/components/Marks'
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">Address map</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">Thirteen worlds, all open. Bosses unlock at 70% mastered.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-primary" to={`/quiz/${weakest.world.week}`}>Revise {weakest.world.short}</Link>
          <Link className="btn btn-ghost" to="/mock">Mock</Link>
          <Link className="btn btn-ghost" to="/vault">Vault {progress.mistakes.length}</Link>
        </div>
      </div>
      <table className="map-table mt-5">
        <thead>
          <tr>
            <th>Addr</th>
            <th>World</th>
            <th className="hidden sm:table-cell">Mastered</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ world, title, blurb, mastery, badge }) => (
            <tr key={world.week}>
              <td className="w-14 font-mono text-sm text-muted">{String(world.week - 1).padStart(2, '0')}</td>
              <td>
                <Link to={`/world/${world.week}`} className="flex gap-3">
                  <WorldMark week={world.week} className="mt-0.5 hidden h-8 w-8 shrink-0 sm:block" />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-0.5 hidden text-sm text-muted md:block">{blurb}</span>
                    <span className="mt-1 block font-mono text-xs text-muted sm:hidden">
                      {mastery.correct}/{mastery.total || 0}
                      {badge ? ' · badge' : ''}
                      {mastery.bossUnlocked ? ' · boss' : ''}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="hidden w-36 sm:table-cell">
                <div className="tick" aria-hidden="true"><span style={{ width: `${Math.round(mastery.ratio * 100)}%` }} /></div>
                <span className="mt-1 block font-mono text-xs text-muted">
                  {mastery.correct}/{mastery.total || 0}
                  {badge ? ' · badge' : ''}
                  {mastery.bossUnlocked ? ' · boss' : ''}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
