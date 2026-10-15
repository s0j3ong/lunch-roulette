import { useId } from 'react'
import './Filters.css'

function TagFilter({ legend = '음식 종류', tags, selected, onChange, action = null }) {
  function toggle(name) {
    onChange(selected.includes(name) ? selected.filter((tag) => tag !== name) : [...selected, name])
  }

  const legendId = useId()

  // 제목 옆에 버튼(action)을 두면 legend 대신 aria-labelledby로 그룹 이름을 붙인다.
  return (
    <fieldset className="filter-group" aria-labelledby={action ? legendId : undefined}>
      {action ? (
        <div className="filter-group-header">
          <span id={legendId} className="filter-group-title">
            {legend}
          </span>
          {action}
        </div>
      ) : (
        <legend>{legend}</legend>
      )}
      {tags.length === 0 ? (
        <p className="filter-hint">아직 태그가 없어요.</p>
      ) : (
        <div className="filter-chips">
          {tags.map((tag) => (
            <label className="filter-chip" key={tag.id}>
              <input
                type="checkbox"
                checked={selected.includes(tag.name)}
                onChange={() => toggle(tag.name)}
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
      )}
      <p className="filter-hint">
        {selected.length === 0 ? '고르지 않으면 모든 종류를 보여줘요.' : '고른 종류 중 하나라도 해당하면 보여줘요.'}
      </p>
    </fieldset>
  )
}

export default TagFilter
