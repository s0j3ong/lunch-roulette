import { useEffect, useState } from 'react'
import { getPriceRange, getTags } from '../api/restaurants'
import PriceRangeFilter from '../components/PriceRangeFilter'
import TagFilter from '../components/TagFilter'
import VisitedFilter from '../components/VisitedFilter'
import './RoulettePage.css'

function RoulettePage() {
  const [tags, setTags] = useState([])
  const [priceBounds, setPriceBounds] = useState(null)
  const [optionsError, setOptionsError] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [visited, setVisited] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadOptions() {
      try {
        const [tagList, bounds] = await Promise.all([
          getTags(controller.signal),
          getPriceRange(controller.signal),
        ])
        setTags(tagList)
        setPriceBounds(bounds)
      } catch (error) {
        if (!controller.signal.aborted) {
          setOptionsError(error.message || '조건을 불러오지 못했어요.')
        }
      }
    }

    loadOptions()
    return () => controller.abort()
  }, [])

  return (
    <div className="roulette-page">
      <section className="roulette-conditions" aria-labelledby="conditions-title">
        <h1 id="conditions-title">오늘의 조건</h1>
        <p className="section-description">조건을 고르지 않으면 저장한 모든 식당이 후보예요.</p>
        {optionsError && <p className="error-text" role="alert">{optionsError}</p>}
        <div className="condition-fields">
          <TagFilter tags={tags} selected={selectedTags} onChange={setSelectedTags} />
          <PriceRangeFilter bounds={priceBounds} value={priceRange} onChange={setPriceRange} />
          <VisitedFilter value={visited} onChange={setVisited} />
        </div>
      </section>
    </div>
  )
}

export default RoulettePage
