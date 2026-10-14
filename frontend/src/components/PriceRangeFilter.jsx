import { useId } from 'react'
import './Filters.css'

const PRICE_STEP = 100

function formatWon(value) {
  return `${value.toLocaleString('ko-KR')}원`
}

// value가 null이면 가격 조건 없음, [최저, 최고]면 그 범위의 가격이 있는 식당만 대상이다.
function PriceRangeFilter({ bounds, value, onChange }) {
  const id = useId()
  const hasPrices = bounds && bounds.min_price !== null && bounds.max_price !== null
  const enabled = hasPrices && value !== null
  const low = enabled ? Math.min(Math.max(value[0], bounds.min_price), bounds.max_price) : null
  const high = enabled ? Math.max(Math.min(value[1], bounds.max_price), low) : null
  // 범위 폭이 100원 단위가 아니면 최고가에 닿을 수 있게 1원 단위로 움직인다.
  const step = hasPrices && (bounds.max_price - bounds.min_price) % PRICE_STEP === 0 ? PRICE_STEP : 1

  function toggle(event) {
    onChange(event.target.checked ? [bounds.min_price, bounds.max_price] : null)
  }

  function changeLow(event) {
    const next = Number(event.target.value)
    onChange([next, Math.max(next, high)])
  }

  function changeHigh(event) {
    const next = Number(event.target.value)
    onChange([Math.min(next, low), next])
  }

  return (
    <fieldset className="filter-group">
      <legend>가격 범위</legend>
      {!hasPrices ? (
        <p className="filter-hint">가격이 저장된 식당이 없어 범위를 정할 수 없어요.</p>
      ) : (
        <>
          <label className="filter-toggle">
            <input type="checkbox" checked={enabled} onChange={toggle} />
            가격 범위 정하기
          </label>
          {enabled ? (
            <div className="price-range">
              <p className="price-range-summary" aria-live="polite">
                {formatWon(low)} ~ {formatWon(high)}
              </p>
              <label htmlFor={`${id}-low`}>최저 가격</label>
              <input
                id={`${id}-low`}
                type="range"
                min={bounds.min_price}
                max={bounds.max_price}
                step={step}
                value={low}
                onChange={changeLow}
                aria-valuetext={formatWon(low)}
              />
              <label htmlFor={`${id}-high`}>최고 가격</label>
              <input
                id={`${id}-high`}
                type="range"
                min={bounds.min_price}
                max={bounds.max_price}
                step={step}
                value={high}
                onChange={changeHigh}
                aria-valuetext={formatWon(high)}
              />
              <p className="filter-hint">
                저장된 가격 {formatWon(bounds.min_price)} ~ {formatWon(bounds.max_price)} 사이에서 골라요. 가격이 없는 식당은 빠져요.
              </p>
            </div>
          ) : (
            <p className="filter-hint">정하지 않으면 가격이 없는 식당까지 모두 보여줘요.</p>
          )}
        </>
      )}
    </fieldset>
  )
}

export default PriceRangeFilter
