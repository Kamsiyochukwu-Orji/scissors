import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpiredPage } from './pages/ExpiredPage'
import { RedirectPage } from './pages/RedirectPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expired" element={<ExpiredPage />} />
        <Route path="/:slug" element={<RedirectPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
