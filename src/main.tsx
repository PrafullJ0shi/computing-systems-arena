import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import { ArenaProvider } from '@/context/ArenaContext'
import { App } from '@/App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <ArenaProvider>
        <App />
      </ArenaProvider>
    </HashRouter>
  </StrictMode>,
)
