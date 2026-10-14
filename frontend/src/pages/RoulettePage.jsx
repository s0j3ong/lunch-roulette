import { useEffect, useState } from 'react'
import { recommendRestaurant } from '../api/recommendations'
import { getPriceRange, getRestaurants, getTags } from '../api/restaurants'
import PriceRangeFilter from '../components/PriceRangeFilter'
import TagFilter from '../components/TagFilter'
import VisitedFilter from '../components/VisitedFilter'
import Wheel from '../components/Wheel'
import TagRoulette from '../components/TagRoulette'
import { useWheelSpin } from '../hooks/useWheelSpin'
import './RoulettePage.css'

function formatPrice(price) {
  return price === null ? '가격 미정' : `${price.toLocaleString('ko-KR')}원`
}

function ResultCard({ result, isConfirmed }) {
  const { winner } = result
  return (
    <article className={isConfirmed ? 'result-card confirmed' : 'result-card'}>
      <p className="result-eyebrow">{isConfirmed ? '오늘은 여기서 먹어요!' : '오늘의 식당'}</p>
      <h3>{winner.name}</h3>
      <p className="result-meta">
        {[
          winner.tags.join(', ') || '종류 없음',
          formatPrice(winner.price),
          winner.visited ? '가본 곳' : '가고 싶은 곳',
          winner.rating ? `★ ${winner.rating}점` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {winner.memo && <p className="result-memo">{winner.memo}</p>}
    </article>
  )
}

function RoulettePage() {
  const [tags, setTags] = useState([])
  const [priceBounds, setPriceBounds] = useState(null)
  const [optionsError, setOptionsError] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [visited, setVisited] = useState(null)
  const [wheel, setWheel] = useState([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinError, setSpinError] = useState('')
  const [excludeIds, setExcludeIds] = useState([])
  const [result, setResult] = useState(null)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [restaurantCount, setRestaurantCount] = useState(null)
  const [noCandidates, setNoCandidates] = useState(false)
  const [isTagSpinning, setIsTagSpinning] = useState(false)
  const { rotation, durationMs: spinDuration, spinTo } = useWheelSpin()

  useEffect(() => {
    const controller = new AbortController()

    async function loadOptions() {
      try {
        const [tagList, bounds, restaurants] = await Promise.all([
          getTags(controller.signal),
          getPriceRange(controller.signal),
          getRestaurants({}, controller.signal),
        ])
        setTags(tagList)
        setPriceBounds(bounds)
        setRestaurantCount(restaurants.length)
      } catch (error) {
        if (!controller.signal.aborted) {
          setOptionsError(error.message || '조건을 불러오지 못했어요.')
        }
      }
    }

    loadOptions()
    return () => controller.abort()
  }, [])

  // 조건을 새로 고르면 이번 라운드의 제외 목록과 결과를 비운다.
  function resetRound() {
    setExcludeIds([])
    setResult(null)
    setIsConfirmed(false)
    setSpinError('')
    setNoCandidates(false)
  }

  function resetConditions() {
    setSelectedTags([])
    setPriceRange(null)
    setVisited(null)
    resetRound()
  }

  function changeCondition(setter) {
    return (value) => {
      setter(value)
      resetRound()
    }
  }

  async function spin(nextExcludeIds) {
    setIsSpinning(true)
    setSpinError('')
    setNoCandidates(false)
    setResult(null)
    setIsConfirmed(false)
    try {
      const response = await recommendRestaurant({
        tags: selectedTags,
        price_min: priceRange?.[0] ?? null,
        price_max: priceRange?.[1] ?? null,
        visited,
        exclude_ids: nextExcludeIds,
      })
      // 당첨은 서버가 정한다. 화면은 wheel에서 winner의 칸을 찾아 그 칸에서 멈춘다.
      const winnerIndex = response.wheel.findIndex((item) => item.id === response.winner.id)
      setWheel(response.wheel)
      setExcludeIds(nextExcludeIds)
      await spinTo(winnerIndex, response.wheel.length)
      setIsSpinning(false)
      setResult(response)
    } catch (error) {
      if (error.code === 'NO_CANDIDATES') {
        setNoCandidates(true)
      } else {
        setSpinError(error.message || '룰렛을 돌리지 못했어요. 다시 시도해 주세요.')
      }
      setIsSpinning(false)
    }
  }

  return (
    <div className="roulette-page">
      <section className="roulette-conditions" aria-labelledby="conditions-title">
        <h1 id="conditions-title">오늘의 조건</h1>
        <p className="section-description">조건을 고르지 않으면 저장한 모든 식당이 후보예요.</p>
        {optionsError && <p className="error-text" role="alert">{optionsError}</p>}
        {!priceBounds && !optionsError && <p role="status">조건을 불러오고 있어요.</p>}
        {priceBounds && (
          <fieldset className="condition-fields" disabled={isSpinning || isTagSpinning}>
            <TagFilter tags={tags} selected={selectedTags} onChange={changeCondition(setSelectedTags)} />
            <PriceRangeFilter bounds={priceBounds} value={priceRange} onChange={changeCondition(setPriceRange)} />
            <VisitedFilter value={visited} onChange={changeCondition(setVisited)} />
          </fieldset>
        )}
        {restaurantCount !== 0 && (
          <TagRoulette
            priceRange={priceRange}
            visited={visited}
            disabled={isSpinning}
            onSpinningChange={setIsTagSpinning}
            onResult={(tagName) => changeCondition(setSelectedTags)([tagName])}
          />
        )}
      </section>

      <section className="roulette-stage" aria-labelledby="wheel-title">
        <h2 id="wheel-title">식당 룰렛</h2>
        {restaurantCount === 0 ? (
          <div className="empty-state">
            <p>아직 저장한 식당이 없어요.</p>
            <p>식당을 먼저 등록하면 룰렛을 돌릴 수 있어요.</p>
            <a className="primary-button link-button" href="#restaurants">
              식당 등록하러 가기
            </a>
          </div>
        ) : (
          <>
            <Wheel labels={wheel.map((item) => item.name)} rotation={rotation} durationMs={spinDuration} />

            <div className="roulette-result" aria-live="polite">
              {result && <ResultCard result={result} isConfirmed={isConfirmed} />}
              {noCandidates && (
                <div className="empty-state">
                  <p>조건에 맞는 식당이 없어요.</p>
                  <p>음식 종류, 가격 범위, 가본 곳 조건을 바꿔 보세요.</p>
                  <button className="secondary-button" type="button" onClick={resetConditions}>
                    조건 초기화하기
                  </button>
                </div>
              )}
            </div>

            <div className="spin-actions">
              {result && !isConfirmed && result.remaining > 0 ? (
                <>
                  <button
                    className="primary-button spin-button"
                    type="button"
                    onClick={() => spin([...excludeIds, result.winner.id])}
                    disabled={isTagSpinning}
                  >
                    다시 돌리기
                  </button>
                  <button className="secondary-button" type="button" onClick={() => setIsConfirmed(true)}>
                    여기로 정하기
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="primary-button spin-button"
                    type="button"
                    onClick={() => {
                      resetRound()
                      spin([])
                    }}
                    disabled={isSpinning || isTagSpinning || noCandidates}
                  >
                    {isSpinning ? '룰렛이 돌아가고 있어요' : result ? '처음부터 다시 돌리기' : '룰렛 돌리기'}
                  </button>
                  {result && !isConfirmed && (
                    <button className="secondary-button" type="button" onClick={() => setIsConfirmed(true)}>
                      여기로 정하기
                    </button>
                  )}
                </>
              )}
            </div>
            {result && !isConfirmed && result.remaining > 0 && (
              <p className="spin-hint">다시 돌리면 지금까지 나온 식당 {excludeIds.length + 1}곳을 빼고 돌려요.</p>
            )}
            {result && !isConfirmed && result.remaining === 0 && (
              <p className="spin-hint last-candidate" role="status">
                마지막 후보예요. 더 돌릴 식당이 없어서 다시 돌리기를 할 수 없어요. 조건을 바꾸거나 처음부터 다시 돌려 보세요.
              </p>
            )}
            {spinError && <p className="error-text" role="alert">{spinError}</p>}
          </>
        )}
      </section>
    </div>
  )
}

export default RoulettePage
