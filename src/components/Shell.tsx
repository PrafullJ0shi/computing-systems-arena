import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { DISCLAIMER } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'

const NAV = [
  { to: '/', label: 'Map', end: true, d: 'M4 12h16M4 7h10M4 17h13' },
  { to: '/sprint', label: 'Sprint', d: 'M5 16 6-6 4 3 5-7' },
  { to: '/mock', label: 'Mock', d: 'M8 5h8v14H8zM10 9h4M10 13h4' },
  { to: '/cards', label: 'Cards', d: 'M6 7h9v12H6zM10 7V5h9v12h-2' },
  { to: '/profile', label: 'Rank', d: 'm12 4 2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.8 7.5 18l.9-5.1L4.8 9.3l5-.7z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Shell() {
  const { progress, rank, banner, dismissBanner, bank } = useArena()
  useEffect(() => {
    if (!banner) return
    const id = window.setTimeout(dismissBanner, 2400)
    return () => window.clearTimeout(id)
  }, [banner, dismissBanner])

  const source =
    bank.origin === 'sample'
      ? 'Sample questions'
      : bank.replacedWeeks.length >= 13
        ? 'Personal bank'
        : `Personal bank · weeks ${bank.replacedWeeks.join(', ')}`

  return (
    <div className="min-h-dvh">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight" end>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-mono text-sm text-accentink">CS</span>
            <span className="hidden sm:block">Computing Systems Arena</span>
            <span className="sm:hidden">Arena</span>
          </NavLink>
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-bg3 text-ink' : 'text-muted'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden rounded-full bg-bg3 px-3 py-1 font-mono text-xs text-amber-200 sm:inline" style={{ color: 'var(--accent)' }}>
              {rank.name}
            </span>
            <span className="font-mono tabular-nums">{progress.xp.toLocaleString()} XP</span>
            <span className="font-mono tabular-nums" aria-label={`${progress.streak} day streak`}>
              {progress.streak}d
            </span>
          </div>
        </div>
      </header>
      {banner && (
        <div className="mx-auto mt-3 max-w-6xl px-4" role="status">
          <p className="rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-accentink">{banner}</p>
        </div>
      )}
      <main id="main" className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-16">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{source}</p>
        <Outlet />
        <footer className="mt-10 border-t border-line pt-4 text-sm text-muted">{DISCLAIMER}</footer>
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? 'text-ink' : 'text-muted'}`
                }
              >
                <Icon d={item.d} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
