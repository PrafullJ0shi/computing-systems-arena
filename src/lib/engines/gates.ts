export type Gate = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'NOT'
export type Bit = 0 | 1

export const GATES: readonly Gate[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'NOT']

export function evalGate(gate: Gate, a: Bit, b: Bit = 0): Bit {
  switch (gate) {
    case 'AND':
      return a && b ? 1 : 0
    case 'OR':
      return a || b ? 1 : 0
    case 'XOR':
      return a !== b ? 1 : 0
    case 'NAND':
      return a && b ? 0 : 1
    case 'NOR':
      return a || b ? 0 : 1
    case 'NOT':
      return a ? 0 : 1
  }
}

export interface TruthRow {
  a: Bit
  b: Bit
  y: Bit
}

export function truthTable(gate: Gate): TruthRow[] {
  const rows: [Bit, Bit][] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ]
  return rows.map(([a, b]) => ({ a, b, y: evalGate(gate, a, b) }))
}

/** out = g2(g1(a, b), a). NOT ignores its second input. */
export function evalChain(first: Gate, second: Gate, a: Bit, b: Bit): Bit {
  return evalGate(second, evalGate(first, a, b), a)
}

export function chainMatches(first: Gate, second: Gate, target: TruthRow[]): boolean {
  return target.every((row) => evalChain(first, second, row.a, row.b) === row.y)
}
