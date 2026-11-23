type MarkProps = { week?: number; rank?: number; className?: string }

const ink = 'currentColor'

export function WorldMark({ week = 1, className = 'h-8 w-8' }: MarkProps) {
  const paths: Record<number, string> = {
    1: 'M4 20h24M8 20V8h6v12M18 20V12h6v8',
    2: 'M6 8h20v4H6zM6 14h14v4H6zM6 20h8v4H6z',
    3: 'M6 6h8v4H6zM18 6h8v4h-8zM6 16h20v4H6zM12 10v6M20 10v6',
    4: 'M6 8h18M8 8v12M16 8v12M8 14h8M20 8v4h4',
    5: 'M8 6h6v6H8zM18 6h6v6h-6zM8 18h6v6H8zM18 18h6v6h-6zM14 9h4M11 12v6M21 12v6',
    6: 'M8 8h16v16H8zM12 12h8v8h-8z',
    7: 'M6 22V10l6-4 6 4v4l6 4v8',
    8: 'M8 6h16v16H8zM12 10h8M12 14h5M20 18l4 4',
    9: 'M6 22V14h4V8h4V4h4v6h4v4h4v8',
    10: 'M8 22V6M14 22V10M20 22V14M26 22V8',
    11: 'M6 16h6M20 16h6M12 16a4 4 0 1 1 8 0 4 4 0 0 1-8 0M8 10v6M24 10v6',
    12: 'M6 18h20v6H6zM10 12h12v6H10zM14 6h4v6h-4z',
    13: 'M10 4h12v6H10zM8 12h16v4H8zM6 18h20v6H6z',
  }
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" stroke={ink} strokeWidth="1.5">
      <path d={paths[week] ?? paths[1]} />
    </svg>
  )
}

export function RankMark({ rank = 0, className = 'h-6 w-6' }: MarkProps) {
  const bars = Math.min(5, rank + 1)
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" stroke={ink} strokeWidth="1.5">
      {Array.from({ length: bars }, (_, index) => (
        <path key={index} d={`M${6 + index * 5} ${26 - index * 3}v${4 + index * 3}`} />
      ))}
      {rank >= 5 && <path d="M6 8h20M16 8v6" />}
      {rank >= 8 && <circle cx="16" cy="6" r="2" />}
    </svg>
  )
}
