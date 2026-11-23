export interface Machine {
  reg: number[]
  mem: number[]
  pc: number
  z: boolean
  halted: boolean
  steps: number
  error?: string
}

interface Instruction {
  op: string
  args: string[]
  line: number
}

const REG = /^R([0-3])$/i

function register(token: string): number | null {
  const match = REG.exec(token.trim())
  return match ? Number(match[1]) : null
}

export function runProgram(source: string, memory?: readonly number[]): Machine {
  const machine: Machine = {
    reg: [0, 0, 0, 0],
    mem: Array.from({ length: 16 }, (_, index) => memory?.[index] ?? 0),
    pc: 0,
    z: false,
    halted: false,
    steps: 0,
  }
  const labels = new Map<string, number>()
  const program: Instruction[] = []
  const lines = source.split(/\r?\n/)
  for (const lineText of lines) {
    const stripped = lineText.replace(/;.*/, '').trim()
    if (!stripped) continue
    const labeled = /^(?:([A-Za-z_][\w]*):)?\s*(.*)$/.exec(stripped)
    if (!labeled) continue
    if (labeled[1]) labels.set(labeled[1].toLowerCase(), program.length)
    const body = labeled[2].trim()
    if (!body) continue
    const operation = /^([A-Za-z]+)\s*(.*)$/.exec(body)
    if (!operation) continue
    const op = operation[1]
    const rest = operation[2]
    const args = rest
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    program.push({ op: op.toUpperCase(), args, line: program.length })
  }

  const fail = (message: string): Machine => {
    machine.error = message
    machine.halted = true
    return machine
  }

  while (!machine.halted && machine.steps < 100) {
    const instruction = program[machine.pc]
    if (!instruction) {
      machine.halted = true
      break
    }
    machine.steps += 1
    const [a = '', b = ''] = instruction.args
    const rd = register(a)
    const rs = register(b)
    switch (instruction.op) {
      case 'MOV': {
        if (rd === null) return fail(`bad MOV at ${machine.pc}`)
        if (rs !== null && instruction.args.length === 2) machine.reg[rd] = machine.reg[rs]
        else if (/^-?\d+$/.test(b)) machine.reg[rd] = Number(b)
        else return fail(`bad MOV at ${machine.pc}`)
        machine.pc += 1
        break
      }
      case 'ADD':
      case 'SUB': {
        if (rd === null || rs === null) return fail(`bad ${instruction.op} at ${machine.pc}`)
        machine.reg[rd] = instruction.op === 'ADD' ? machine.reg[rd] + machine.reg[rs] : machine.reg[rd] - machine.reg[rs]
        machine.pc += 1
        break
      }
      case 'LOAD': {
        const addr = Number(b)
        if (rd === null || !Number.isInteger(addr) || addr < 0 || addr >= machine.mem.length) return fail(`bad LOAD at ${machine.pc}`)
        machine.reg[rd] = machine.mem[addr]
        machine.pc += 1
        break
      }
      case 'STORE': {
        const addr = Number(b)
        if (rd === null || !Number.isInteger(addr) || addr < 0 || addr >= machine.mem.length) {
          return fail(`bad STORE at ${machine.pc}`)
        }
        machine.mem[addr] = machine.reg[rd]
        machine.pc += 1
        break
      }
      case 'CMP': {
        if (rd === null || rs === null) return fail(`bad CMP at ${machine.pc}`)
        machine.z = machine.reg[rd] === machine.reg[rs]
        machine.pc += 1
        break
      }
      case 'JZ': {
        const target = labels.get(a.toLowerCase())
        if (target === undefined) return fail(`missing label ${a}`)
        machine.pc = machine.z ? target : machine.pc + 1
        break
      }
      case 'JMP': {
        const target = labels.get(a.toLowerCase())
        if (target === undefined) return fail(`missing label ${a}`)
        machine.pc = target
        break
      }
      case 'HLT':
        machine.halted = true
        break
      default:
        return fail(`unknown opcode ${instruction.op}`)
    }
  }
  if (!machine.halted && !machine.error) machine.error = 'step limit'
  return machine
}
