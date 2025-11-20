import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import HomeFeed from './pages/HomeFeed'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/app" element={<HomeFeed />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App
