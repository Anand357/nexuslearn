import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import MyNotes from './pages/MyNotes'
import BrainMapPage from './pages/BrainMapPage'
import ModelsPage from './pages/ModelsPage'
import QuizPage from './pages/QuizPage'
import BrainAIPage from './pages/BrainAIPage'
import ConceptsPage from './pages/ConceptsPage'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<MyNotes />} />
          <Route path="/brain" element={<BrainMapPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/ai" element={<BrainAIPage />} />
          <Route path="/concepts" element={<ConceptsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
