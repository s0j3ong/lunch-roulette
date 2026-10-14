import RestaurantsPage from './pages/RestaurantsPage'
import './App.css'

function App() {
  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <p className="app-name">오늘 뭐 먹지?</p>
        </div>
      </header>
      <main className="app-shell">
        <RestaurantsPage />
      </main>
    </>
  )
}

export default App
