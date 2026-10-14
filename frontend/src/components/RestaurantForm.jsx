import { useEffect, useState } from 'react'
import {
  createRestaurant,
  getRestaurant,
  getTags,
  updateRestaurant,
} from '../api/restaurants'
import './RestaurantForm.css'

const emptyForm = {
  name: '',
  tags: [],
  price: '',
  memo: '',
  visited: false,
  rating: '',
}

function RestaurantForm({ restaurantId, onSaved, onCancel }) {
  const isEditing = restaurantId !== null
  const [form, setForm] = useState(emptyForm)
  const [tags, setTags] = useState([])
  const [customTag, setCustomTag] = useState('')
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

  function addCustomTag(event) {
    event.preventDefault()
    const name = customTag.trim()
    if (!name) return
    if (!tags.some((tag) => tag.name === name)) {
      setTags((current) => [...current, { id: `custom-${name}`, name, is_default: false }])
    }
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(name) ? current.tags : [...current.tags, name],
    }))
    setCustomTag('')
    setNotice('')
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
      memo: form.memo || null,
      visited: form.visited,
      rating: form.rating === '' ? null : Number(form.rating),
    }

    try {
      if (isEditing) {
        const saved = await updateRestaurant(restaurantId, payload)
        onSaved(saved, `'${saved.name}' 정보를 수정했어요.`)
      } else {
        const saved = await createRestaurant(payload)
        setForm(emptyForm)
        setNotice('식당을 저장했어요.')
        onSaved(saved)
      }
    } catch (saveError) {
      setError(saveError.message || '저장하지 못했어요. 입력 내용을 확인해 주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p role="status">식당 정보를 불러오고 있어요.</p>
  }

  return (
    <section className="restaurant-form-card">
      <h1>{isEditing ? '식당 수정' : '식당 등록'}</h1>
      <p className="form-description">식당 정보를 입력해 맛집 목록에 저장해요.</p>

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
          <div className="tag-options">
            {tags.map((tag) => (
              <label className="tag-option" key={tag.id}>
                <input
                  type="checkbox"
                  checked={form.tags.includes(tag.name)}
                  onChange={() => toggleTag(tag.name)}
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
          <div className="custom-tag-field">
            <label htmlFor="custom-tag">직접 입력</label>
            <div className="custom-tag-controls">
              <input
                id="custom-tag"
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                maxLength={100}
              />
              <button type="button" className="secondary-button" onClick={addCustomTag}>
                태그 추가
              </button>
            </div>
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

        <label className="form-field" htmlFor="restaurant-memo">
          위치 메모
          <textarea
            id="restaurant-memo"
            name="memo"
            maxLength={255}
            rows={3}
            value={form.memo}
            onChange={updateField}
          />
        </label>

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
          {isEditing && (
            <button className="secondary-button" type="button" onClick={onCancel}>
              수정 취소하기
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default RestaurantForm
