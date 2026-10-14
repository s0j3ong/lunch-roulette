import { useState } from 'react'
import { recommendTag } from '../api/recommendations'
import { useWheelSpin } from '../hooks/useWheelSpin'
import Wheel from './Wheel'
import './TagRoulette.css'

// 음식 종류부터 정하기 어려울 때 쓰는 태그 룰렛. 당첨 태그는 서버가 정한다.
function TagRoulette({ priceRange, visited, disabled, onSpinningChange }) {
  const [wheel, setWheel] = useState([])
  const [winnerTag, setWinnerTag] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [error, setError] = useState('')
  const { rotation, durationMs, spinTo } = useWheelSpin()

  function setSpinning(value) {
    setIsSpinning(value)
    onSpinningChange(value)
  }

  async function spin() {
    setSpinning(true)
    setError('')
    setWinnerTag(null)
    try {
      const response = await recommendTag({
        tags: [],
        price_min: priceRange?.[0] ?? null,
        price_max: priceRange?.[1] ?? null,
        visited,
        exclude_ids: [],
      })
      const winnerIndex = response.wheel.findIndex((tag) => tag.id === response.winner_tag.id)
      setWheel(response.wheel)
      await spinTo(winnerIndex, response.wheel.length)
      setWinnerTag(response.winner_tag)
    } catch (spinError) {
      setError(
        spinError.code === 'NO_CANDIDATES'
          ? '가격·가본 곳 조건에 맞는 식당이 붙은 음식 종류가 없어요. 조건을 바꾸거나 식당에 음식 종류를 붙여 주세요.'
          : spinError.message || '태그 룰렛을 돌리지 못했어요. 다시 시도해 주세요.',
      )
    } finally {
      setSpinning(false)
    }
  }

  return (
    <section className="tag-roulette" aria-labelledby="tag-roulette-title">
      <h2 id="tag-roulette-title">음식 종류부터 정하기</h2>
      <p className="tag-roulette-description">
        뭘 먹을지 모르겠다면 음식 종류 룰렛을 먼저 돌려 보세요. 가격·가본 곳 조건에 맞는 식당이 있는 종류만 올라가요.
      </p>
      <div className="tag-roulette-body">
        <div className="tag-roulette-wheel">
          <Wheel labels={wheel.map((tag) => tag.name)} rotation={rotation} durationMs={durationMs} />
        </div>
        <div className="tag-roulette-side">
          <div aria-live="polite">
            {winnerTag && (
              <p className="tag-roulette-result">
                오늘은 <strong>{winnerTag.name}</strong> 어때요?
              </p>
            )}
          </div>
          <button
            className="secondary-button tag-spin-button"
            type="button"
            onClick={spin}
            disabled={disabled || isSpinning}
          >
            {isSpinning ? '태그 룰렛이 돌아가고 있어요' : winnerTag ? '태그 룰렛 다시 돌리기' : '태그 룰렛 돌리기'}
          </button>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default TagRoulette
