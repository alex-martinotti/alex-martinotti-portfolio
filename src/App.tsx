import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CursorProvider } from './lib/cursor-context'
import { ProjectTransitionProvider } from './lib/project-transition'
import { CartProvider } from './lib/cart-context'
import { CustomCursor } from './components/CustomCursor'
import { CartBar } from './components/CartBar'
import { Navigation } from './components/Navigation'
import { Home } from './pages/Home'
import { ProjectsIndex } from './pages/ProjectsIndex'
import { ProjectPage } from './pages/ProjectPage'
import { Contact } from './pages/Contact'
import { About } from './pages/About'
import { Luts } from './pages/Luts'
import { Wallpapers } from './pages/Wallpapers'

function App() {
  const location = useLocation()

  return (
    <CursorProvider>
      <CartProvider>
        <ProjectTransitionProvider>
          <CustomCursor />
          <CartBar />
          <Navigation>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<ProjectsIndex />} />
                <Route path="/work/:slug" element={<ProjectPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/work-with-me" element={<Navigate to="/contact" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/luts" element={<Luts />} />
                <Route path="/wallpapers" element={<Wallpapers />} />
              </Routes>
            </AnimatePresence>
          </Navigation>
        </ProjectTransitionProvider>
      </CartProvider>
    </CursorProvider>
  )
}

export default App
