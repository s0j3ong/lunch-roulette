import { useEffect, useRef, useState } from 'react'
import { deleteRestaurant, getPriceRange, getRestaurants, getTags } from '../api/restaurants'
import ConfirmDialog from '../components/ConfirmDialog'
import PriceRangeFilter from '../components/PriceRangeFilter'
import RestaurantForm from '../components/RestaurantForm'
import RestaurantList from '../components/RestaurantList'
import TagFilter from '../components/TagFilter'
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
  const [tags, setTags] = useState([])
  const [priceBounds, setPriceBounds] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const formRef = useRef(null)

  const [reloadKey, setReloadKey] = useState(0)
  const reloadRestaurants = () => setReloadKey((key) => key + 1)
  const isFiltered = selectedTags.length > 0 || priceRange !== null

  // 태그 목록과 가격 범위는 식당이 바뀔 때마다 다시 불러온다.
  useEffect(() => {
    const controller = new AbortController()

    async function loadFilterOptions() {
      try {
        const [tagList, bounds] = await Promise.all([
          getTags(controller.signal),
          getPriceRange(controller.signal),
        ])
        setTags(tagList)
        setPriceBounds(bounds)
      } catch {
        // 필터 선택지를 못 불러와도 목록은 볼 수 있게 둔다.
      }
    }

    loadFilterOptions()
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    const controller = new AbortController()

    async function loadRestaurants() {
      try {
        const data = await getRestaurants(
          {
            tags: selectedTags,
            priceMin: priceRange?.[0],
            priceMax: priceRange?.[1],
          },
          controller.signal,
        )
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

    // 가격 막대를 움직이는 동안 요청이 몰리지 않게 잠깐 기다렸다가 불러온다.
    const timer = setTimeout(loadRestaurants, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [reloadKey, selectedTags, priceRange])

  function resetFilters() {
    setSelectedTags([])
    setPriceRange(null)
  }

  function startEdit(id) {
    setEditingId(id)
    setNotice('')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
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

        <div className="list-filters">
          <TagFilter tags={tags} selected={selectedTags} onChange={setSelectedTags} />
          <PriceRangeFilter bounds={priceBounds} value={priceRange} onChange={setPriceRange} />
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
        ) : restaurants.length === 0 && isFiltered ? (
          <div className="empty-state">
            <p>조건에 맞는 식당이 없어요.</p>
            <p>음식 종류나 가격 범위를 바꿔 보세요.</p>
            <button className="secondary-button" type="button" onClick={resetFilters}>
              필터 초기화하기
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
