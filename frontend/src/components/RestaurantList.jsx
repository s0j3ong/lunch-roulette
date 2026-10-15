import { priceText } from '../priceBands'
import './RestaurantList.css'

// 카드에서는 메모를 이 길이까지만 보여주고, 전문은 상세 창에서 본다.
const MEMO_PREVIEW_LENGTH = 40

function previewMemo(memo) {
  return memo.length > MEMO_PREVIEW_LENGTH ? `${memo.slice(0, MEMO_PREVIEW_LENGTH)}…` : memo
}

function RestaurantList({ restaurants, onOpen }) {
  return (
    <ul className="restaurant-grid">
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <button
            type="button"
            className="restaurant-card"
            onClick={() => onOpen(restaurant)}
            aria-label={`${restaurant.name} 자세히 보기`}
          >
            <span className="restaurant-card-header">
              <span className="restaurant-card-name">{restaurant.name}</span>
              <span className={restaurant.visited ? 'visit-badge visited' : 'visit-badge'}>
                {restaurant.visited ? '가본 곳' : '가고 싶은 곳'}
              </span>
            </span>
            {restaurant.tags.length > 0 && (
              <span className="restaurant-tags">
                {restaurant.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            )}
            <span className="restaurant-card-meta">
              <span>
                <span className="meta-label">가격대</span> {priceText(restaurant.price)}
              </span>
              <span>
                <span className="meta-label">위치</span> {restaurant.location || '없음'}
              </span>
            </span>
            {restaurant.memo && <span className="restaurant-card-memo">{previewMemo(restaurant.memo)}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default RestaurantList
