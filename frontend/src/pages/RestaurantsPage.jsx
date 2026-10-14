import { useEffect, useRef, useState } from 'react'
import { deleteRestaurant, getRestaurants } from '../api/restaurants'
import ConfirmDialog from '../components/ConfirmDialog'
import RestaurantForm from '../components/RestaurantForm'
import RestaurantList from '../components/RestaurantList'
import './RestaurantsPage.css'

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const formRef = useRef(null)

  const [reloadKey, setReloadKey] = useState(0)
  const reloadRestaurants = () => setReloadKey((key) => key + 1)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRestaurants() {
      try {
        const data = await getRestaurants(controller.signal)
        setRestaurants(data)
        setLoadError('')
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error.message || '식당 목록을 불러오지 못했어요.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadRestaurants()
    return () => controller.abort()
  }, [reloadKey])

  function startEdit(id) {
    setEditingId(id)
    setNotice('')
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSaved(saved, message) {
    setEditingId(null)
    setNotice(message ?? '')
    reloadRestaurants()
  }

  function openDelete(restaurant) {
    setDeleteError('')
    setDeleteTarget(restaurant)
  }

  async function confirmDelete() {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteRestaurant(deleteTarget.id)
      if (editingId === deleteTarget.id) setEditingId(null)
      setNotice(`'${deleteTarget.name}'을(를) 삭제했어요.`)
      setDeleteTarget(null)
      reloadRestaurants()
    } catch (error) {
      setDeleteError(error.message || '삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="restaurants-page">
      <div className="restaurants-form-column" ref={formRef}>
        <RestaurantForm
          key={editingId ?? 'new'}
          restaurantId={editingId}
          onSaved={handleSaved}
          onCancel={() => setEditingId(null)}
        />
      </div>

      <section className="restaurants-list-column" aria-labelledby="restaurant-list-title">
        <div className="section-heading">
          <h2 id="restaurant-list-title">내 식당 목록</h2>
          {!isLoading && !loadError && <span className="count-label">{restaurants.length}곳</span>}
        </div>

        {notice && <p className="page-notice" role="status">{notice}</p>}

        {isLoading ? (
          <p role="status">식당 목록을 불러오고 있어요.</p>
        ) : loadError ? (
          <div className="empty-state" role="alert">
            <p>{loadError}</p>
            <button className="secondary-button" type="button" onClick={reloadRestaurants}>
              다시 불러오기
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <p>아직 저장한 식당이 없어요.</p>
            <p>식당 등록 폼에서 첫 식당을 저장해 보세요.</p>
          </div>
        ) : (
          <RestaurantList restaurants={restaurants} onEdit={startEdit} onDelete={openDelete} />
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="식당을 삭제할까요?"
        message={deleteTarget ? `'${deleteTarget.name}'을(를) 삭제하면 되돌릴 수 없어요.` : ''}
        confirmLabel="삭제하기"
        isWorking={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default RestaurantsPage
