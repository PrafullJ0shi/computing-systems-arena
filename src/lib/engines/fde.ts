export interface FdeStep {
  id: string
  phase: 'Fetch' | 'Decode' | 'Execute'
  label: string
  detail: string
}

export const FDE_DEMO = {
  memory: ['LOAD R1, 8', 'ADD R1, R2', 'STORE R1, 9'],
  note: 'R2 already holds 3. Address 8 holds 4.',
}

/** One instruction at a time: fetch, then decode, then execute. */
export const FDE_STEPS: readonly FdeStep[] = [
  { id: 'f1', phase: 'Fetch', label: 'Copy PC into MAR', detail: 'The address of LOAD goes out on the address bus.' },
  { id: 'f2', phase: 'Fetch', label: 'Read memory into MDR, then IR', detail: 'LOAD R1, 8 lands in the instruction register.' },
  { id: 'f3', phase: 'Fetch', label: 'Increment the PC', detail: 'PC now points at ADD, before the current instruction runs.' },
  { id: 'd1', phase: 'Decode', label: 'Control unit reads the opcode', detail: 'It is a LOAD. R1 is the destination. 8 is a memory address.' },
  { id: 'e1', phase: 'Execute', label: 'Read address 8 into R1', detail: 'R1 becomes 4. The ALU is idle for this instruction.' },
  { id: 'f4', phase: 'Fetch', label: 'Fetch ADD R1, R2', detail: 'PC is copied to MAR, the word is read into IR, and PC advances.' },
  { id: 'd2', phase: 'Decode', label: 'Decode ADD', detail: 'Both operands are registers. The ALU is asked to add.' },
  { id: 'e2', phase: 'Execute', label: 'ALU adds R1 and R2 into R1', detail: '4 + 3 = 7. Flags may update. Memory is not written.' },
  { id: 'f5', phase: 'Fetch', label: 'Fetch STORE R1, 9', detail: 'Same fetch micro-steps. IR now holds STORE.' },
  { id: 'd3', phase: 'Decode', label: 'Decode STORE', detail: 'R1 is the source. 9 is the destination address.' },
  { id: 'e3', phase: 'Execute', label: 'Write R1 to address 9', detail: 'Memory[9] = 7. The instruction cycle can halt or fetch again.' },
]

export const FDE_DISTRACTORS = [
  'Write the PC into memory',
  'Add R1 and R2 during fetch',
  'Decode the opcode before reading memory',
  'Increment the PC after the instruction finishes',
]
