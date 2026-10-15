import { useEffect, useRef, useState } from 'react'
import {
  createRestaurant,
  deleteTag,
  getRestaurant,
  getTags,
  updateRestaurant,
} from '../api/restaurants'
import ConfirmDialog from './ConfirmDialog'
import './RestaurantForm.css'

const MEMO_MAX_LENGTH = 100

const emptyForm = {
  name: '',
  tags: [],
  price: '',
  location: '',
  memo: '',
  visited: false,
  rating: '',
}

function RestaurantForm({ restaurantId, onSaved, onCancel, onTagDeleted }) {
  const isEditing = restaurantId !== null
  const [form, setForm] = useState(emptyForm)
  const [tags, setTags] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagToDelete, setTagToDelete] = useState(null)
  const [isDeletingTag, setIsDeletingTag] = useState(false)
  const [deleteTagError, setDeleteTagError] = useState('')
  const addTagButtonRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadForm() {
      setIsLoading(true)
      setError('')
      try {
        const [availableTags, restaurant] = await Promise.all([
          getTags(controller.signal),
          isEditing ? getRestaurant(restaurantId, controller.signal) : Promise.resolve(null),
        ])
        setTags(availableTags)
        if (restaurant) {
          setForm({
            name: restaurant.name,
            tags: restaurant.tags,
            price: restaurant.price ?? '',
            location: restaurant.location ?? '',
            memo: restaurant.memo ?? '',
            visited: restaurant.visited,
            rating: restaurant.rating ?? '',
          })
        } else {
          setForm(emptyForm)
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError.message || '식당 정보를 불러오지 못했어요.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadForm()
    return () => controller.abort()
  }, [isEditing, restaurantId])

  function updateField(event) {
    const { name, value, checked, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setNotice('')
  }

  function toggleTag(name) {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(name)
        ? current.tags.filter((tag) => tag !== name)
        : [...current.tags, name],
    }))
    setNotice('')
  }

  // 입력칸을 닫고 포커스를 "+ 추가" 버튼으로 돌려 키보드 사용자가 위치를 잃지 않게 한다.
  function closeTagInput() {
    setIsAddingTag(false)
    setCustomTag('')
    requestAnimationFrame(() => addTagButtonRef.current?.focus())
  }

  function addCustomTag() {
    const name = customTag.trim()
    if (name) {
      if (!tags.some((tag) => tag.name === name)) {
        // 새 종류는 식당을 저장할 때 서버에 만들어진다.
        setTags((current) => [...current, { id: `custom-${name}`, name, is_default: false, restaurant_count: 0 }])
      }
      setForm((current) => ({
        ...current,
        tags: current.tags.includes(name) ? current.tags : [...current.tags, name],
      }))
      setNotice('')
    }
    closeTagInput()
  }

  function handleTagInputKeyDown(event) {
    if (event.key === 'Enter') {
      // 식당 폼이 제출되지 않게 막고 종류만 추가한다.
      event.preventDefault()
      addCustomTag()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeTagInput()
    }
  }

  function removeTagLocally(name) {
    const remaining = tags.filter((tag) => tag.name !== name)
    setTags(remaining)
    if (!remaining.some((tag) => !tag.is_default)) setIsEditingTags(false)
    setForm((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== name) }))
  }

  function requestDeleteTag(tag) {
    setNotice('')
    // 아직 저장하지 않은 종류는 서버에 없으므로 화면에서만 뺀다.
    if (typeof tag.id !== 'number') {
      removeTagLocally(tag.name)
      return
    }
    setDeleteTagError('')
    setTagToDelete(tag)
  }

  async function confirmDeleteTag() {
    setIsDeletingTag(true)
    setDeleteTagError('')
    try {
      await deleteTag(tagToDelete.id)
      removeTagLocally(tagToDelete.name)
      setNotice(`'${tagToDelete.name}' 종류를 삭제했어요.`)
      onTagDeleted?.(tagToDelete.name)
      setTagToDelete(null)
    } catch (deleteError) {
      setDeleteTagError(deleteError.message || '삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setIsDeletingTag(false)
    }
  }

  async function submitForm(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSaving(true)

    const payload = {
      name: form.name,
      tags: form.tags,
      price: form.price === '' ? null : Number(form.price),
      location: form.location.trim() || null,
      memo: form.memo.trim() || null,
      visited: form.visited,
      rating: form.rating === '' ? null : Number(form.rating),
    }

    try {
      if (isEditing) {
        const saved = await updateRestaurant(restaurantId, payload)
        onSaved(saved, `'${saved.name}' 정보를 수정했어요.`)
      } else {
        const saved = await createRestaurant(payload)
        onSaved(saved, `'${saved.name}'을(를) 저장했어요.`)
      }
    } catch (saveError) {
      setError(saveError.message || '저장하지 못했어요. 입력 내용을 확인해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasCustomTags = tags.some((tag) => !tag.is_default)

  if (isLoading) {
    return <p role="status">식당 정보를 불러오고 있어요.</p>
  }

  // 수정할 식당을 못 불러왔으면 빈 폼 대신 안내와 돌아가기 버튼만 보여준다.
  if (isEditing && error && !form.name) {
    return (
      <div className="restaurant-form-card">
        <p className="form-message error-message" role="alert">
          {error} 목록을 새로 불러온 뒤 다시 골라 주세요.
        </p>
        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            닫기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="restaurant-form-card">
      <form className="restaurant-form" onSubmit={submitForm}>
        <label className="form-field" htmlFor="restaurant-name">
          <span>
            식당 이름 <span className="required-label">필수</span>
          </span>
          <input
            id="restaurant-name"
            name="name"
            value={form.name}
            onChange={updateField}
            maxLength={100}
            required
          />
        </label>

        <fieldset className="tag-field">
          <legend>음식 종류</legend>
          {hasCustomTags && (
            <button
              type="button"
              className="tag-edit-toggle"
              aria-pressed={isEditingTags}
              onClick={() => setIsEditingTags((current) => !current)}
            >
              {isEditingTags ? '편집 끝내기' : '종류 편집하기'}
            </button>
          )}
          {isEditingTags && hasCustomTags && (
            <p className="tag-edit-hint">직접 추가한 종류만 삭제할 수 있어요.</p>
          )}
          <div className="tag-options">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag.id}>
                <label className="tag-option">
                  <input
                    type="checkbox"
                    checked={form.tags.includes(tag.name)}
                    onChange={() => toggleTag(tag.name)}
                  />
                  <span>{tag.name}</span>
                </label>
                {isEditingTags && !tag.is_default && (
                  <button
                    type="button"
                    className="tag-delete-button"
                    aria-label={`${tag.name} 삭제하기`}
                    onClick={() => requestDeleteTag(tag)}
                  >
                    × 삭제
                  </button>
                )}
              </span>
            ))}
            {isAddingTag ? (
              <span className="tag-add-controls">
                <input
                  id="custom-tag"
                  aria-label="추가할 음식 종류"
                  placeholder="예: 분식"
                  value={customTag}
                  onChange={(event) => setCustomTag(event.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  maxLength={100}
                  autoFocus
                />
                <button type="button" className="secondary-button" onClick={addCustomTag}>
                  추가하기
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="tag-add-button"
                ref={addTagButtonRef}
                onClick={() => setIsAddingTag(true)}
              >
                + 추가
              </button>
            )}
          </div>
        </fieldset>

        <label className="form-field" htmlFor="restaurant-price">
          대표 가격(원)
          <input
            id="restaurant-price"
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={updateField}
          />
        </label>

        <label className="form-field" htmlFor="restaurant-location">
          위치
          <input
            id="restaurant-location"
            name="location"
            maxLength={255}
            placeholder="예: 건대입구역 2번 출구"
            value={form.location}
            onChange={updateField}
          />
        </label>

        <div className="form-field">
          <label htmlFor="restaurant-memo">메모</label>
          <textarea
            id="restaurant-memo"
            name="memo"
            maxLength={MEMO_MAX_LENGTH}
            rows={3}
            placeholder="예: 점심엔 웨이팅이 길어요"
            aria-describedby="restaurant-memo-count"
            value={form.memo}
            onChange={updateField}
          />
          <span id="restaurant-memo-count" className="memo-count">
            {form.memo.length}/{MEMO_MAX_LENGTH}자
          </span>
        </div>

        <label className="checkbox-field">
          <input
            name="visited"
            type="checkbox"
            checked={form.visited}
            onChange={updateField}
          />
          가본 곳이에요
        </label>

        <label className="form-field" htmlFor="restaurant-rating">
          별점
          <select
            id="restaurant-rating"
            name="rating"
            value={form.rating}
            onChange={updateField}
          >
            <option value="">별점 없음</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating}점
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-message error-message" role="alert">{error}</p>}
        {notice && <p className="form-message success-message" role="status">{notice}</p>}

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSaving}>
            {isSaving ? '저장 중이에요.' : isEditing ? '수정하기' : '저장하기'}
          </button>
          <button className="secondary-button" type="button" onClick={onCancel}>
            취소하기
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={tagToDelete !== null}
        title="음식 종류를 삭제할까요?"
        message={
          tagToDelete
            ? tagToDelete.restaurant_count > 0
              ? `'${tagToDelete.name}'을(를) 삭제하면 식당 ${tagToDelete.restaurant_count}곳에서도 빠져요. 식당은 남아 있어요.`
              : `'${tagToDelete.name}'을(를) 삭제할게요.`
            : ''
        }
        confirmLabel="삭제하기"
        isWorking={isDeletingTag}
        error={deleteTagError}
        onConfirm={confirmDeleteTag}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  )
}

export default RestaurantForm
