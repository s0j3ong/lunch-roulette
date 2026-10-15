import { useEffect, useState } from 'react'
import { deleteRestaurant, getRestaurants, getTags } from '../api/restaurants'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import PriceBandFilter from '../components/PriceBandFilter'
import RestaurantDetail from '../components/RestaurantDetail'
import RestaurantForm from '../components/RestaurantForm'
import RestaurantList from '../components/RestaurantList'
import TagFilter from '../components/TagFilter'
import './RestaurantsPage.css'

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  // 폼 팝업: null이면 닫힘, 'new'면 등록, 숫자면 그 식당 수정
  const [formTarget, setFormTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [tags, setTags] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [priceBands, setPriceBands] = useState([])

  const [reloadKey, setReloadKey] = useState(0)
  const reloadRestaurants = () => setReloadKey((key) => key + 1)
  const isFiltered = selectedTags.length > 0 || priceBands.length > 0

  // 태그 목록은 식당이 바뀔 때마다 다시 불러온다.
  useEffect(() => {
    const controller = new AbortController()
    getTags(controller.signal)
      .then(setTags)
      .catch(() => {
        // 필터 선택지를 못 불러와도 목록은 볼 수 있게 둔다.
      })
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    const controller = new AbortController()

    async function loadRestaurants() {
      try {
        const data = await getRestaurants({ tags: selectedTags, priceBands }, controller.signal)
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

    // 필터를 빠르게 여러 번 바꿀 때 요청이 몰리지 않게 잠깐 기다렸다가 불러온다.
    const timer = setTimeout(loadRestaurants, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [reloadKey, selectedTags, priceBands])

  function resetFilters() {
    setSelectedTags([])
    setPriceBands([])
  }

  function openForm(target) {
    setNotice('')
    setDetailTarget(null)
    setFormTarget(target)
  }

  function handleSaved(saved, message) {
    setFormTarget(null)
    setNotice(message)
    reloadRestaurants()
  }

  // 삭제한 종류는 필터에서도 빼고, 식당 카드의 태그가 바뀌었으니 목록을 다시 불러온다.
  function handleTagDeleted(name) {
    setSelectedTags((current) => current.filter((tag) => tag !== name))
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
      setNotice(`'${deleteTarget.name}'을(를) 삭제했어요.`)
      setDeleteTarget(null)
      setDetailTarget(null)
      reloadRestaurants()
    } catch (error) {
      setDeleteError(error.message || '삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="restaurants-page">
      {/* 필터 선택지를 불러온 뒤에만 보여준다. 연결 실패 시 잘못된 빈 안내가 나오지 않게 한다. */}
      {tags && (
        <section className="list-filters" aria-label="식당 찾기">
          <TagFilter tags={tags} selected={selectedTags} onChange={setSelectedTags} />
          <PriceBandFilter selected={priceBands} onChange={setPriceBands} />
        </section>
      )}

      <section aria-labelledby="restaurant-list-title">
        <div className="section-heading">
          <h1 id="restaurant-list-title">
            <span aria-hidden="true">📒</span>
            내 식당 목록
            {!isLoading && !loadError && <span className="count-label">{restaurants.length}곳</span>}
          </h1>
          <button className="primary-button" type="button" onClick={() => openForm('new')}>
            + 식당 추가
          </button>
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
            <span className="empty-state-icon" aria-hidden="true">🔍</span>
            <p>조건에 맞는 식당이 없어요.</p>
            <p>음식 종류나 가격대를 바꿔 보세요.</p>
            <button className="secondary-button" type="button" onClick={resetFilters}>
              필터 초기화하기
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">🍽️</span>
            <p>아직 저장한 식당이 없어요.</p>
            <p>오른쪽 위의 "+ 식당 추가"로 첫 식당을 저장해 보세요.</p>
          </div>
        ) : (
          <RestaurantList restaurants={restaurants} onOpen={setDetailTarget} />
        )}
      </section>

      <Modal
        open={formTarget !== null}
        title={formTarget === 'new' ? '식당 추가' : '식당 수정'}
        onClose={() => setFormTarget(null)}
      >
        <RestaurantForm
          key={formTarget ?? 'closed'}
          restaurantId={formTarget === 'new' ? null : formTarget}
          onSaved={handleSaved}
          onCancel={() => setFormTarget(null)}
          onTagDeleted={handleTagDeleted}
        />
      </Modal>

      <Modal
        open={detailTarget !== null}
        title={detailTarget?.name ?? ''}
        onClose={() => setDetailTarget(null)}
        size="small"
      >
        {detailTarget && <RestaurantDetail restaurant={detailTarget} onEdit={openForm} onDelete={openDelete} />}
      </Modal>

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
