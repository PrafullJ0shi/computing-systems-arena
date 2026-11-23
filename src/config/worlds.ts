import type { WorldDef } from '../types'

/**
 * Game names, badges, and fallback titles. Week files in content/bank
 * override the title and blurb when they supply their own.
 */
export const WORLDS: readonly WorldDef[] = [
  {
    week: 1,
    title: 'Getting Started (Computer System Basics and Architectures)',
    short: 'Basics',
    blurb: 'Parts of a machine, the memory hierarchy, and how caches stay coherent.',
    gameTitle: 'Hierarchy',
    badge: 'Cold Boot',
    accent: '#8ecbff',
  },
  {
    week: 2,
    title: 'Computer System Architecture (Memory and I/O)',
    short: 'Memory',
    blurb: 'Locality, SRAM and DRAM, and how devices talk to the machine.',
    gameTitle: 'Hit or Miss',
    badge: 'Locality',
    accent: '#7ee0c6',
  },
  {
    week: 3,
    title: 'Introduction to an Operating System (Linux and UNIX Commands)',
    short: 'Commands',
    blurb: 'The shell as the way you ask the kernel to do work.',
    gameTitle: 'Command Relay',
    badge: 'Shell Relay',
    accent: '#d7c4ff',
  },
  {
    week: 4,
    title: 'Shell Scripting',
    short: 'Scripts',
    blurb: 'Variables, tests, loops, and the difference between a script and a command.',
    gameTitle: 'Script Sprint',
    badge: 'Script Hand',
    accent: '#ffd27a',
  },
  {
    week: 5,
    title: 'Program Execution in a System (Processes, Threads and Synchronisation)',
    short: 'Processes',
    blurb: 'Process states, threads, and the critical section.',
    gameTitle: 'State Pilot',
    badge: 'State Pilot',
    accent: '#ffb08a',
  },
  {
    week: 6,
    title: 'Virtual Environments and Isolation',
    short: 'Isolation',
    blurb: 'Abstraction, virtual machines, and containers.',
    gameTitle: 'Isolation Call',
    badge: 'Boundary',
    accent: '#9ad1ff',
  },
  {
    week: 7,
    title: 'Source Code Repositories and Versioning Systems (Git and GitHub)',
    short: 'Git',
    blurb: 'The three trees, and the commands that move work between them.',
    gameTitle: 'Three Trees',
    badge: 'Committer',
    accent: '#f3a6c8',
  },
  {
    week: 8,
    title: 'Profiling and Debugging',
    short: 'Debug',
    blurb: 'Compile time versus run time, and how a debugger walks a program.',
    gameTitle: 'Break Point',
    badge: 'Break Point',
    accent: '#b7e38d',
  },
  {
    week: 9,
    title: 'Introduction to GPUs',
    short: 'GPUs',
    blurb: 'Why a GPU is a co-processor, and how warps hide latency.',
    gameTitle: 'Warp Count',
    badge: 'Warp',
    accent: '#c6b6ff',
  },
  {
    week: 10,
    title: 'Program Execution and Performance Tuning in GPUs',
    short: 'Tuning',
    blurb: 'The GPU memory ladder, and why two kernels can do the same math at different speeds.',
    gameTitle: 'Memory Ladder',
    badge: 'Tuner',
    accent: '#ffce6b',
  },
  {
    week: 11,
    title: 'Introduction to Distributed Systems',
    short: 'Distributed',
    blurb: 'When one machine is not enough: messages, scale, partition, and replicate.',
    gameTitle: 'Split or Copy',
    badge: 'Cluster',
    accent: '#8ad7d1',
  },
  {
    week: 12,
    title: 'Introduction to Cloud Computing',
    short: 'Cloud',
    blurb: 'Service models, hypervisors, and elasticity.',
    gameTitle: 'Service Desk',
    badge: 'Elastic',
    accent: '#f0b7ff',
  },
  {
    week: 13,
    title: 'Mobile and Embedded Computing',
    short: 'Edge',
    blurb: 'Battery, thermals, and the phone as a client of a larger system.',
    gameTitle: 'On the Edge',
    badge: 'On Device',
    accent: '#9eb6ff',
  },
] as const

export const PASSING_MASTERY = 0.7

export const DISCLAIMER =
  'Questions and answers are AI-assisted study material, not official course content; verify against your course resources.'

export const ISSUE_URL = 'https://github.com/PrafullJ0shi/computing-systems-arena/issues/new'

export function worldByWeek(week: number): WorldDef | undefined {
  return WORLDS.find((world) => world.week === week)
}

export function badgeId(week: number): string {
  return `badge-w${String(week).padStart(2, '0')}`
}

export function sourceLabel(source: string): string {
  if (source === 'quiz') return 'Practice quiz'
  if (source === 'mock') return 'Mock'
  return 'Extra practice'
}
