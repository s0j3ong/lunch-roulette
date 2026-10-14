import RestaurantForm from './components/RestaurantForm'
import './App.css'

function App() {
  const editId = new URLSearchParams(window.location.search).get('edit')
  const restaurantId = editId && /^\d+$/.test(editId) ? Number(editId) : null

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-name">오늘 뭐 먹지?</p>
      </header>
      {editId && restaurantId === null ? (
        <p role="alert">수정할 식당 번호가 올바르지 않아요.</p>
      ) : (
        <RestaurantForm restaurantId={restaurantId} />
      )}
    </main>
  )
}

export default App
