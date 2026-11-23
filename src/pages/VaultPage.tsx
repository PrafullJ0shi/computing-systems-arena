import { useMemo, useState } from 'react'
import { QuizRunner } from '@/components/QuizRunner'
import { useArena } from '@/context/ArenaContext'

export function VaultPage() {
  const { bank, progress, recordAnswer } = useArena()
  const [running, setRunning] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const questions = useMemo(() => {
    const byId = new Map([...bank.questions, ...bank.mockQuestions].map((question) => [question.id, question]))
    return progress.mistakes.flatMap((id) => {
      const question = byId.get(id)
      return question ? [question] : []
    })
  }, [bank.mockQuestions, bank.questions, progress.mistakes])

  if (note) {
    return (
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold">Vault cleared for now</h1>
        <p className="mt-2 text-muted">{note}</p>
        <button className="btn btn-primary mt-5" type="button" onClick={() => { setNote(null); setRunning(false) }}>
          Back
        </button>
      </section>
    )
  }

  if (running) {
    return (
      <QuizRunner
        title="Mistake vault"
        questions={questions}
        mode="practice"
        onAnswer={recordAnswer}
        onDone={(summary) => setNote(`${summary.correct} / ${summary.total} corrected this pass.`)}
      />
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold">Mistake vault</h1>
      <p className="mt-2 text-muted">{questions.length === 0 ? 'Nothing queued. A miss in a quiz lands here until you get it right.' : `${questions.length} questions waiting for a retry.`}</p>
      <ul className="mt-4 space-y-2">
        {questions.slice(0, 8).map((question) => (
          <li key={question!.id} className="panel px-4 py-3 text-sm">
            Week {question!.week} · {question!.prompt.slice(0, 120)}
          </li>
        ))}
      </ul>
      <button className="btn btn-primary mt-5" type="button" disabled={questions.length === 0} onClick={() => setRunning(true)}>
        Retry the queue
      </button>
    </section>
  )
}
