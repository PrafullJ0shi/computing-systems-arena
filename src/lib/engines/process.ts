export type PState = 'new' | 'ready' | 'running' | 'waiting' | 'terminated'
export type PEvent = 'admit' | 'dispatch' | 'timeout' | 'wait' | 'iocomplete' | 'exit'

const TABLE: Record<PState, Partial<Record<PEvent, PState>>> = {
  new: { admit: 'ready' },
  ready: { dispatch: 'running' },
  running: { timeout: 'ready', wait: 'waiting', exit: 'terminated' },
  waiting: { iocomplete: 'ready' },
  terminated: {},
}

export function nextProcessState(state: PState, event: PEvent): PState | null {
  return TABLE[state][event] ?? null
}

export const PROCESS_STATES: readonly PState[] = ['new', 'ready', 'running', 'waiting', 'terminated']
