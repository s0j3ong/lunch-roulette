import { PRICE_BANDS } from '../priceBands'
import './Filters.css'

// 여러 가격대를 고를 수 있다. 고르지 않으면 가격이 없는 식당까지 모두 대상이다.
function PriceBandFilter({ selected, onChange }) {
  function toggle(value) {
    onChange(selected.includes(value) ? selected.filter((band) => band !== value) : [...selected, value])
  }

  return (
    <fieldset className="filter-group">
      <legend>가격대</legend>
      <div className="filter-chips">
        {PRICE_BANDS.map((band) => (
          <label className="filter-chip" key={band.value}>
            <input type="checkbox" checked={selected.includes(band.value)} onChange={() => toggle(band.value)} />
            <span>{band.label}</span>
          </label>
        ))}
      </div>
      <p className="filter-hint">
        {selected.length === 0 ? '고르지 않으면 가격이 없는 식당까지 모두 보여줘요.' : '가격이 없는 식당은 빠져요.'}
      </p>
    </fieldset>
  )
}

export default PriceBandFilter
