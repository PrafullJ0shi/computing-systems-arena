import { Link } from 'react-router-dom'
import { RANKS } from '@/config/ranks'
import { WORLDS, badgeId } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { weakTopics, worldMastery } from '@/lib/stats'

export function ProfilePage() {
  const { bank, progress, rank } = useArena()
  const topics = weakTopics(bank.questions, progress.answered)
  const ratio = rank.span > 0 ? Math.min(1, rank.into / rank.span) : 1

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{progress.displayName || 'Student'}</p>
          <h1 className="text-3xl font-semibold">{rank.name}</h1>
          <p className="mt-1 font-mono tabular-nums text-muted">
            {progress.xp.toLocaleString()} XP
            {rank.nextName ? ` · ${rank.nextXp! - progress.xp} to ${rank.nextName}` : ' · top rank'}
          </p>
        </div>
        <Link className="btn btn-ghost" to="/settings">
          Settings
        </Link>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg3" aria-hidden="true">
        <div className="h-full bg-accent" style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">
        Streak {progress.streak} · longest {progress.longestStreak}
      </p>
      <h2 className="mt-8 text-xl font-semibold">Ranks</h2>
      <ol className="mt-3 space-y-2">
        {RANKS.map((item) => (
          <li key={item.name} className={`flex items-center justify-between rounded-xl px-3 py-2 ${item.index === rank.index ? 'bg-bg3' : ''}`}>
            <span>
              {item.index + 1}. {item.name}
            </span>
            <span className="font-mono text-sm tabular-nums text-muted">{item.minXp.toLocaleString()}</span>
          </li>
        ))}
      </ol>
      <h2 className="mt-8 text-xl font-semibold">Accuracy by week</h2>
      <ul className="mt-3 space-y-2">
        {WORLDS.map((world) => {
          const content = bank.weeks.find((item) => item.week === world.week)
          const mastery = worldMastery(content?.questions ?? [], progress.answered)
          return (
            <li key={world.week} className="grid grid-cols-[2rem_1fr_4rem] items-center gap-2 text-sm">
              <span className="font-mono">{world.week}</span>
              <span className="h-2 overflow-hidden rounded-full bg-bg3">
                <span className="block h-full bg-teal" style={{ width: `${mastery.ratio * 100}%` }} />
              </span>
              <span className="font-mono tabular-nums">
                {mastery.correct}/{mastery.total}
              </span>
            </li>
          )
        })}
      </ul>
      <h2 className="mt-8 text-xl font-semibold">Weak topics</h2>
      {topics.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Answer a few questions. Topics under 70% with at least two attempts show up here.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {topics.slice(0, 8).map((topic) => (
            <li key={topic.tag}>
              {topic.tag} · {Math.round(topic.accuracy * 100)}% of {topic.attempted}
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-8 text-xl font-semibold">Badges</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {WORLDS.map((world) => {
          const earned = progress.badges.includes(badgeId(world.week))
          return (
            <li key={world.week} className={`panel p-3 text-sm ${earned ? '' : 'opacity-45'}`}>
              <span className="block font-semibold">{world.badge}</span>
              <span className="text-muted">{earned ? 'Cleared the mini-game' : world.gameTitle}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
