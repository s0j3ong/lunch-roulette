import './Filters.css'

function TagFilter({ legend = '음식 종류', tags, selected, onChange }) {
  function toggle(name) {
    onChange(selected.includes(name) ? selected.filter((tag) => tag !== name) : [...selected, name])
  }

  return (
    <fieldset className="filter-group">
      <legend>{legend}</legend>
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
