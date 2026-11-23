/// <reference types="vite/client" />

declare module '*.css'

declare module 'virtual:sample-bank' {
  import type { Bank } from '@/types'
  const bank: Bank
  export default bank
}
