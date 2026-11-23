import { useState } from 'react'
import { useArena } from '@/context/ArenaContext'
import { importFromTexts, importFromZip } from '@/lib/bankImport'

export function SettingsPage() {
  const arena = useArena()
  const [message, setMessage] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function download() {
    const blob = new Blob([arena.exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'arena-progress.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function onProgressFile(file: File) {
    const error = arena.importProgress(await file.text())
    setMessage(error ?? 'Progress restored.')
  }

  async function onBankFiles(files: FileList) {
    const list = [...files]
    const zip = list.find((file) => file.name.toLowerCase().endsWith('.zip'))
    const result = zip
      ? importFromZip(new Uint8Array(await zip.arrayBuffer()))
      : importFromTexts(await Promise.all(list.map(async (file) => ({ name: file.name, text: await file.text() }))))
    const error = await arena.importBank(result.payload)
    const report = result.report
    setMessage(
      error ??
        `Imported ${report.weeks.length} weeks, ${report.questions} questions, ${report.bosses} bosses, ${report.flashcards} cards${report.mock ? ', mock updated' : ''}. Dropped ${report.droppedQuestions}. Skipped ${report.filesSkipped.length}.`,
    )
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      {message && <p className="panel p-3 text-sm" role="status">{message}</p>}
      <label className="block">
        <span className="text-sm">Display name</span>
        <input
          className="mt-1 w-full min-h-11 rounded-xl border border-line bg-bg2 px-3"
          value={arena.progress.displayName}
          maxLength={40}
          onChange={(event) => arena.setName(event.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button className="btn btn-ghost" type="button" aria-pressed={arena.progress.theme === 'dark'} onClick={() => arena.setTheme('dark')}>
          Dark
        </button>
        <button className="btn btn-ghost" type="button" aria-pressed={arena.progress.theme === 'light'} onClick={() => arena.setTheme('light')}>
          Light
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" type="button" onClick={download}>
          Export progress
        </button>
        <label className="btn btn-ghost">
          Import progress
          <input className="sr-only" type="file" accept="application/json,.json" onChange={(event) => event.target.files?.[0] && void onProgressFile(event.target.files[0])} />
        </label>
      </div>
      <div className="panel p-4">
        <h2 className="font-semibold">Custom question bank</h2>
        <p className="mt-1 text-sm text-muted">
          Optional. Load JSON files or one zip in this browser. The bundled bank stays the fallback for weeks you do not replace.
        </p>
        <label className="btn btn-teal mt-3">
          Import question bank
          <input
            className="sr-only"
            type="file"
            accept="application/json,.json,.zip,application/zip"
            multiple
            onChange={(event) => event.target.files && event.target.files.length > 0 && void onBankFiles(event.target.files)}
          />
        </label>
        <button className="btn btn-ghost ml-2 mt-3" type="button" onClick={() => void arena.clearBank().then(() => setMessage('Imported bank removed.'))}>
          Use bundled bank only
        </button>
      </div>
      {!confirmReset ? (
        <button className="btn btn-danger" type="button" onClick={() => setConfirmReset(true)}>
          Reset progress
        </button>
      ) : (
        <div className="panel p-4">
          <p>This clears XP, streaks, answers, badges, and cards on this device. The question bank stays.</p>
          <div className="mt-3 flex gap-2">
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                arena.resetProgress()
                setConfirmReset(false)
                setMessage('Progress reset.')
              }}
            >
              Confirm reset
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
