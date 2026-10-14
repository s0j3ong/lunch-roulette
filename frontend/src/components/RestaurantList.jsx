import './RestaurantList.css'

function formatPrice(price) {
  return price === null ? '가격 미정' : `${price.toLocaleString('ko-KR')}원`
}

function RestaurantList({ restaurants, onEdit, onDelete }) {
  return (
    <ul className="restaurant-list">
      {restaurants.map((restaurant) => (
        <li className="restaurant-item" key={restaurant.id}>
          <div className="restaurant-item-header">
            <h3>{restaurant.name}</h3>
            <span className={restaurant.visited ? 'visit-badge visited' : 'visit-badge'}>
              {restaurant.visited ? '가본 곳' : '가고 싶은 곳'}
            </span>
          </div>
          {restaurant.tags.length > 0 && (
            <ul className="restaurant-tags" aria-label="음식 종류">
              {restaurant.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          <dl className="restaurant-meta">
            <div>
              <dt>가격</dt>
              <dd>{formatPrice(restaurant.price)}</dd>
            </div>
            <div>
              <dt>별점</dt>
              <dd>{restaurant.rating === null ? '없음' : `★ ${restaurant.rating}점`}</dd>
            </div>
            {restaurant.memo && (
              <div className="restaurant-memo">
                <dt>메모</dt>
                <dd>{restaurant.memo}</dd>
              </div>
            )}
          </dl>
          <div className="restaurant-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onEdit(restaurant.id)}
              aria-label={`${restaurant.name} 수정하기`}
            >
              수정하기
            </button>
            <button
              className="danger-outline-button"
              type="button"
              onClick={() => onDelete(restaurant)}
              aria-label={`${restaurant.name} 삭제하기`}
            >
              삭제하기
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default RestaurantList
