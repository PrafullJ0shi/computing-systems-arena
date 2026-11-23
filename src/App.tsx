import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Shell } from '@/components/Shell'
import { BossPage } from '@/pages/BossPage'
import { CardsPage } from '@/pages/CardsPage'
import { MapPage } from '@/pages/MapPage'
import { MockPage } from '@/pages/MockPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { QuizPage } from '@/pages/QuizPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SprintPage } from '@/pages/SprintPage'
import { VaultPage } from '@/pages/VaultPage'
import { WorldPage } from '@/pages/WorldPage'

const GamePage = lazy(() => import('@/games/GamePage').then((module) => ({ default: module.GamePage })))

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<MapPage />} />
        <Route path="world/:week" element={<WorldPage />} />
        <Route path="quiz/:week" element={<QuizPage />} />
        <Route
          path="play/:week"
          element={
            <Suspense fallback={<p className="text-muted">Loading the machine…</p>}>
              <GamePage />
            </Suspense>
          }
        />
        <Route path="boss/:week" element={<BossPage />} />
        <Route path="mock" element={<MockPage />} />
        <Route path="sprint" element={<SprintPage />} />
        <Route path="vault" element={<VaultPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
