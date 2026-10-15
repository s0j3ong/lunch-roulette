import { priceText } from '../priceBands'
import './RestaurantList.css'
import './RestaurantDetail.css'

// 식당 카드를 누르면 뜨는 상세 내용. 메모 전문을 보여준다.
function RestaurantDetail({ restaurant, onEdit, onDelete }) {
  return (
    <div className="restaurant-detail">
      {restaurant.tags.length > 0 && (
        <ul className="restaurant-tags" aria-label="음식 종류">
          {restaurant.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <dl className="detail-list">
        <div>
          <dt>가격대</dt>
          <dd>{priceText(restaurant.price)}</dd>
        </div>
        <div>
          <dt>위치</dt>
          <dd>{restaurant.location || '없음'}</dd>
        </div>
        <div>
          <dt>방문</dt>
          <dd>{restaurant.visited ? '가본 곳' : '가고 싶은 곳'}</dd>
        </div>
        <div>
          <dt>별점</dt>
          <dd>{restaurant.rating === null ? '없음' : `★ ${restaurant.rating}점`}</dd>
        </div>
        <div className="detail-memo">
          <dt>메모</dt>
          <dd>{restaurant.memo || '없음'}</dd>
        </div>
      </dl>
      <div className="detail-actions">
        <button className="secondary-button" type="button" onClick={() => onEdit(restaurant.id)}>
          수정하기
        </button>
        <button className="danger-outline-button" type="button" onClick={() => onDelete(restaurant)}>
          삭제하기
        </button>
      </div>
    </div>
  )
}

export default RestaurantDetail
