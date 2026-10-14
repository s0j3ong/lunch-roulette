import { useEffect, useRef, useState } from 'react'
import { recommendRestaurant } from '../api/recommendations'
import { getPriceRange, getTags } from '../api/restaurants'
import PriceRangeFilter from '../components/PriceRangeFilter'
import TagFilter from '../components/TagFilter'
import VisitedFilter from '../components/VisitedFilter'
import Wheel from '../components/Wheel'
import { nextRotation } from '../components/wheelRotation'
import './RoulettePage.css'

function RoulettePage() {
  const [tags, setTags] = useState([])
  const [priceBounds, setPriceBounds] = useState(null)
  const [optionsError, setOptionsError] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [visited, setVisited] = useState(null)
  const [wheel, setWheel] = useState([])
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinError, setSpinError] = useState('')
  const spinTimer = useRef(null)
  const spinDuration = 4000

  useEffect(() => () => clearTimeout(spinTimer.current), [])

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

  async function spin() {
    setIsSpinning(true)
    setSpinError('')
    try {
      const result = await recommendRestaurant({
        tags: selectedTags,
        price_min: priceRange?.[0] ?? null,
        price_max: priceRange?.[1] ?? null,
        visited,
        exclude_ids: [],
      })
      // 당첨은 서버가 정한다. 화면은 wheel에서 winner의 칸을 찾아 그 칸에서 멈춘다.
      const winnerIndex = result.wheel.findIndex((item) => item.id === result.winner.id)
      setWheel(result.wheel)
      setRotation((current) => nextRotation(current, winnerIndex, result.wheel.length))
      spinTimer.current = setTimeout(() => setIsSpinning(false), spinDuration)
    } catch (error) {
      setSpinError(error.message || '룰렛을 돌리지 못했어요. 다시 시도해 주세요.')
      setIsSpinning(false)
    }
  }

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

      <section className="roulette-stage" aria-labelledby="wheel-title">
        <h2 id="wheel-title">식당 룰렛</h2>
        <Wheel labels={wheel.map((item) => item.name)} rotation={rotation} durationMs={spinDuration} />
        <button className="primary-button spin-button" type="button" onClick={spin} disabled={isSpinning}>
          {isSpinning ? '룰렛이 돌아가고 있어요' : '룰렛 돌리기'}
        </button>
        {spinError && <p className="error-text" role="alert">{spinError}</p>}
      </section>
    </div>
  )
}

export default RoulettePage
