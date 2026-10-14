import { useId } from 'react'
import './Filters.css'

const OPTIONS = [
  { label: '모두', value: null },
  { label: '가본 곳', value: true },
  { label: '가고 싶은 곳', value: false },
]

function VisitedFilter({ value, onChange }) {
  const name = useId()

  return (
    <fieldset className="filter-group">
      <legend>가본 곳 / 가고 싶은 곳</legend>
      <div className="filter-chips">
        {OPTIONS.map((option) => (
          <label className="filter-chip" key={option.label}>
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default VisitedFilter
