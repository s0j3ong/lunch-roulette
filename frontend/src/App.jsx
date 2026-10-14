import { useEffect, useState } from 'react'
import RestaurantsPage from './pages/RestaurantsPage'
import RoulettePage from './pages/RoulettePage'
import './App.css'

const PAGES = [
  { id: 'roulette', label: '룰렛' },
  { id: 'restaurants', label: '식당 관리' },
]

function pageFromHash() {
  const id = window.location.hash.slice(1)
  return PAGES.some((page) => page.id === id) ? id : 'roulette'
}

function App() {
  const [page, setPage] = useState(pageFromHash)

  useEffect(() => {
    const syncPage = () => setPage(pageFromHash())
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <p className="app-name">오늘 뭐 먹지?</p>
          <nav className="app-nav" aria-label="화면 이동">
            {PAGES.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="app-nav-link"
                aria-current={page === item.id ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-shell">
        {page === 'roulette' ? <RoulettePage /> : <RestaurantsPage />}
      </main>
    </>
  )
}

export default App
