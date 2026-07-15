import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Convite from '@/pages/Convite'
import Confirmar from '@/pages/Confirmar'
import Presentes from '@/pages/Presentes'
import Pagamento from '@/pages/Pagamento'

/** Scroll to top on every route change (each screen starts at its header). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Convite />} />
        <Route path="/confirmar" element={<Confirmar />} />
        <Route path="/presentes" element={<Presentes />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="*" element={<Convite />} />
      </Routes>
    </BrowserRouter>
  )
}
