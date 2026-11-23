import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { bankPlugin } from './vite/bankPlugin'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: process.env.VITE_BASE || '/computing-systems-arena/',
  plugins: [react(), tailwindcss(), bankPlugin(root)],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
