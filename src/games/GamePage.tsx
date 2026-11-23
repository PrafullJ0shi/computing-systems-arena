import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { worldByWeek } from '@/config/worlds'
import { useArena } from '@/context/ArenaContext'
import { DRILLS } from '@/games/drills'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function GamePage() {
  const week = Number(useParams().week)
  const world = worldByWeek(week)
  const { recordGame } = useArena()
  const rounds = DRILLS[week] ?? []
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  if (!world) return <NotFoundPage />
  const round = rounds[index]
  const finished = index >= rounds.length
  const score = rounds.length ? Math.round((correct / rounds.length) * 100) : 0
  const passed = score >= 70

  function choose(choice: number) {
    if (picked !== null || !round) return
    setPicked(choice)
    if (choice === round.answer) setCorrect((value) => value + 1)
  }

  function finish() {
    if (saved) return
    setSaved(true)
    recordGame(week, score, passed)
  }

  return (
    <section className="panel p-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        World {week} · {world.gameTitle}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{world.badge}</h1>
      {!finished && round && (
        <>
          <p className="mt-4 text-lg">{round.prompt}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            {index + 1} / {rounds.length}
          </p>
          <ul className="mt-4 grid gap-2">
            {round.choices.map((choice, choiceIndex) => {
              const show = picked !== null
              const isAnswer = choiceIndex === round.answer
              const tone = show && isAnswer ? 'bg-[var(--ok-bg)]' : show && picked === choiceIndex ? 'bg-[var(--bad-bg)]' : 'bg-bg'
              return (
                <li key={choice}>
                  <button type="button" className={`min-h-12 w-full rounded-2xl border border-line px-3 py-3 text-left ${tone}`} onClick={() => choose(choiceIndex)}>
                    {choice}
                  </button>
                </li>
              )
            })}
          </ul>
          {picked !== null && (
            <div className="mt-4" role="status">
              <p className="font-semibold">{picked === round.answer ? 'Correct.' : 'Not this one.'}</p>
              <p className="mt-1 text-sm text-muted">{round.why}</p>
              <button className="btn btn-primary mt-3" type="button" onClick={() => { setIndex((value) => value + 1); setPicked(null) }}>
                {index + 1 === rounds.length ? 'See score' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}
      {finished && (
        <div>
          <p className="mt-4 text-lg">
            {score}% · {passed ? 'Cleared. The badge is yours.' : '70% clears it. Run it again.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={finish}>
              Save result
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setIndex(0)
                setCorrect(0)
                setPicked(null)
                setSaved(false)
              }}
            >
              Replay
            </button>
            <Link className="btn btn-ghost" to={`/world/${week}`}>
              Back
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
