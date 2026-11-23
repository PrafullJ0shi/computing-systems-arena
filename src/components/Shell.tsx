import { useEffect } from 'react'
import { Award, ClipboardList, Gauge, Layers, Map } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { DISCLAIMER } from '@/config/worlds'
import { RankMark } from '@/components/Marks'
import { useArena } from '@/context/ArenaContext'

const NAV = [
  { to: '/', label: 'Map', end: true, icon: Map },
  { to: '/sprint', label: 'Sprint', icon: Gauge },
  { to: '/mock', label: 'Mock', icon: ClipboardList },
  { to: '/cards', label: 'Cards', icon: Layers },
  { to: '/profile', label: 'Rank', icon: Award },
]

export function Shell() {
  const { progress, rank, banner, dismissBanner, bank } = useArena()
  useEffect(() => {
    if (!banner) return
    const id = window.setTimeout(dismissBanner, 2400)
    return () => window.clearTimeout(id)
  }, [banner, dismissBanner])

  const source =
    bank.origin === 'sample' ? 'Bundled bank' : bank.replacedWeeks.length >= 13 ? 'Imported bank' : `Imported weeks ${bank.replacedWeeks.join(', ')}`

  return (
    <div className="min-h-dvh">
      <a className="skip" href="#main">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-3 py-2">
          <NavLink to="/" end className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-3 w-3 bg-[#f0a202]" aria-hidden="true" />
            Arena
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 border-b-2 px-2 py-2 text-sm ${isActive ? 'border-accent text-ink' : 'border-transparent text-muted'}`
                }
              >
                <item.icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 font-mono text-sm tabular-nums">
            <span className="hidden items-center gap-1 sm:flex">
              <RankMark rank={rank.index} />
              {rank.name}
            </span>
            <span>{progress.xp.toLocaleString()} XP</span>
            <span aria-label={`${progress.streak} day streak`}>{progress.streak}d</span>
          </div>
        </div>
      </header>
      {banner && (
        <div className="mx-auto max-w-5xl px-3 pt-3" role="status">
          <p className="banner-line">{banner}</p>
        </div>
      )}
      <main id="main" className="mx-auto max-w-5xl px-3 pb-24 pt-5 lg:pb-10">
        <p className="mb-4 font-mono text-xs text-muted">{source}</p>
        <Outlet />
        <footer className="mt-10 border-t border-line pt-4 text-sm text-muted">{DISCLAIMER}</footer>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Primary">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-2 text-[11px] ${isActive ? 'border-accent text-ink' : 'border-transparent text-muted'}`
                }
              >
                <item.icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
