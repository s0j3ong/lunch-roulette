import { useEffect, useState } from 'react'
import { getMe, logout } from './api/auth'
import { AUTH_REQUIRED_EVENT } from './api/client'
import AuthPage from './pages/AuthPage'
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
  // undefined: 로그인 상태 확인 중, null: 로그인 안 함, 객체: 로그인한 사용자
  const [user, setUser] = useState(undefined)
  const [authError, setAuthError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const syncPage = () => setPage(pageFromHash())
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    getMe(controller.signal)
      .then(setUser)
      .catch((error) => {
        if (controller.signal.aborted) return
        // 401이면 로그인 화면을, 그 밖의 오류면 안내를 보여준다.
        if (error.status !== 401) setAuthError(error.message)
        setUser(null)
      })
    return () => controller.abort()
  }, [])

  // 다른 요청이 401을 받으면(세션 만료 등) 로그인 화면으로 돌아간다.
  useEffect(() => {
    const requireLogin = () => setUser(null)
    window.addEventListener(AUTH_REQUIRED_EVENT, requireLogin)
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, requireLogin)
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      // 서버에 닿지 않아도 화면에서는 로그아웃한다. 쿠키는 다음 로그인 때 새로 바뀐다.
    }
    setIsLoggingOut(false)
    setUser(null)
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <p className="app-name">오늘 뭐 먹지?</p>
          {user && (
            <div className="app-header-actions">
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
              <div className="app-user">
                <span className="app-username">{user.username}님</span>
                <button className="app-logout" type="button" onClick={handleLogout} disabled={isLoggingOut}>
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="app-shell">
        {user === undefined ? (
          <p role="status">로그인 상태를 확인하고 있어요.</p>
        ) : user === null ? (
          <>
            {authError && (
              <p className="app-error" role="alert">
                {authError}
              </p>
            )}
            <AuthPage
              onAuthenticated={(nextUser) => {
                setAuthError('')
                setUser(nextUser)
              }}
            />
          </>
        ) : page === 'roulette' ? (
          // 사용자가 바뀌면 이전 사용자의 화면 상태가 남지 않게 새로 그린다.
          <RoulettePage key={user.id} />
        ) : (
          <RestaurantsPage key={user.id} />
        )}
      </main>
    </>
  )
}

export default App
