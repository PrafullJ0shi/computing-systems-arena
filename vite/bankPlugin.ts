import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { WORLDS } from '../src/config/worlds'
import { assembleBank, type RawFile } from '../src/lib/loader'

function walkJson(dir: string): RawFile[] {
  if (!existsSync(dir)) return []
  const files: RawFile[] = []
  const stack = [dir]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) break
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          files.push({
            name: path.relative(dir, full).replaceAll('\\', '/'),
            data: JSON.parse(readFileSync(full, 'utf8')) as unknown,
            origin: 'sample',
          })
        } catch {
          console.warn(`[arena] skipped unreadable JSON: ${full}`)
        }
      }
    }
  }
  return files
}

export function loadBundledBank(root: string) {
  const bankDir = path.join(root, 'content/bank/data')
  const sampleDir = path.join(root, 'content/sample')
  const envDir = process.env.VITE_PRIVATE_CONTENT_DIR || process.env.PRIVATE_CONTENT_DIR
  const privateDir = envDir ? path.resolve(root, envDir) : path.join(root, 'content/private')
  const bundledDir = walkJson(bankDir).length > 0 ? bankDir : sampleDir
  const sample = walkJson(bundledDir)
  let privateFiles: RawFile[] = []
  if (existsSync(privateDir) && statSync(privateDir).isDirectory()) {
    privateFiles = walkJson(privateDir).map((file) => ({ ...file, origin: 'private' as const }))
  }
  if (envDir && privateFiles.length === 0) {
    console.info(`[arena] no private JSON in ${privateDir}; using samples`)
  } else if (privateFiles.length > 0) {
    console.info(`[arena] overlaying ${privateFiles.length} private JSON file(s)`)
  }
  const assembled = assembleBank([...sample, ...privateFiles], WORLDS)
  return {
    weeks: assembled.weeks,
    questions: assembled.questions,
    bosses: assembled.bosses,
    flashcards: assembled.flashcards,
    mock: assembled.mock,
    mockQuestions: assembled.mockQuestions,
    origin: assembled.origin,
    replacedWeeks: assembled.replacedWeeks,
  }
}

export function bankPlugin(root: string): Plugin {
  const virtualId = 'virtual:sample-bank'
  const resolved = `\0${virtualId}`
  return {
    name: 'arena-bank',
    resolveId(id) {
      if (id === virtualId) return resolved
    },
    load(id) {
      if (id !== resolved) return null
      return `export default ${JSON.stringify(loadBundledBank(root))}`
    },
  }
}
