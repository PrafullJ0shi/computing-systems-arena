import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useArena } from '@/context/ArenaContext'
import { todayLocal } from '@/lib/dates'
import { isDue } from '@/lib/sm2'
import type { Flashcard } from '@/types'

const GRADES = [
  { grade: 1, label: 'Again' },
  { grade: 3, label: 'Hard' },
  { grade: 4, label: 'Good' },
  { grade: 5, label: 'Easy' },
]

export function CardsPage() {
  const { bank, progress, reviewCard } = useArena()
  const [params] = useSearchParams()
  const week = Number(params.get('week') || '0')
  const today = todayLocal()
  const deck = useMemo(() => {
    const pool = bank.flashcards.filter((card) => (week ? card.week === week : true))
    const due = pool.filter((card) => isDue(progress.flashcards[card.id], today))
    return due.length > 0 ? due : pool.slice(0, 20)
  }, [bank.flashcards, progress.flashcards, today, week])
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)
  const card: Flashcard | undefined = deck[index]

  if (!card) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">No cards in this deck</h1>
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Flashcards</h1>
      <p className="mt-2 text-sm text-muted">
        {week ? `Week ${week}` : 'All weeks, including the course sheet'} · {index + 1} / {deck.length}. Spacing follows SM-2.
      </p>
      <article className="panel mt-4 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{card.tags[0] || 'card'}</p>
        <h2 className="mt-3 text-2xl font-semibold">{card.front}</h2>
        {show && <p className="mt-4 border-t border-line pt-4 leading-7">{card.back}</p>}
      </article>
      {!show ? (
        <button className="btn btn-primary mt-4" type="button" onClick={() => setShow(true)}>
          Show answer
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {GRADES.map((item) => (
            <button
              key={item.label}
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                reviewCard(card.id, item.grade)
                setShow(false)
                setIndex((value) => (value + 1) % deck.length)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
