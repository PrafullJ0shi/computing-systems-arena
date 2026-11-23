export interface Irq {
  id: string
  name: string
  priority: number
  masked: boolean
}

/** Lower priority number is more urgent. Masked devices are skipped. */
export function nextInterrupt(irqs: readonly Irq[]): string | null {
  const eligible = irqs.filter((irq) => !irq.masked)
  if (eligible.length === 0) return null
  eligible.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))
  return eligible[0].id
}
