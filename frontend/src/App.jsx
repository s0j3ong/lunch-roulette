import RestaurantsPage from './pages/RestaurantsPage'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-name">오늘 뭐 먹지?</p>
      </header>
      <RestaurantsPage />
    </main>
  )
}

export default App
