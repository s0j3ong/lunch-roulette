import { useEffect, useRef, useState } from 'react'
import { recommendTag } from '../api/recommendations'
import { useWheelSpin } from '../hooks/useWheelSpin'
import Wheel from './Wheel'
import './TagRoulette.css'

// "랜덤 정하기" 팝업 안의 음식 종류 룰렛. 팝업이 열리면 바로 돌고, 당첨 종류는 서버가 정한다.
function TagRoulette({ onSpinningChange, onResult, onClose }) {
  const [wheel, setWheel] = useState([])
  const [winnerTag, setWinnerTag] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [error, setError] = useState('')
  const { rotation, durationMs, spinTo } = useWheelSpin()
  const started = useRef(false)

  function setSpinning(value) {
    setIsSpinning(value)
    onSpinningChange(value)
  }

  async function spin() {
    setSpinning(true)
    setError('')
    setWinnerTag(null)
    try {
      const response = await recommendTag()
      const winnerIndex = response.wheel.findIndex((tag) => tag.id === response.winner_tag.id)
      setWheel(response.wheel)
      await spinTo(winnerIndex, response.wheel.length)
      setWinnerTag(response.winner_tag)
      onResult(response.winner_tag.name)
    } catch (spinError) {
      setError(spinError.message || '음식 종류 룰렛을 돌리지 못했어요. 다시 시도해 주세요.')
    } finally {
      setSpinning(false)
    }
  }

  useEffect(() => {
    // 개발 모드의 effect 두 번 실행에도 한 번만 돌게 한다.
    if (started.current) return
    started.current = true
    spin()
    // 팝업이 열릴 때 한 번만 돌린다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tag-roulette">
      <p className="tag-roulette-description">
        저장된 음식 종류 중에서 골라요. 8개보다 많으면 무작위 8개만 올라가요.
      </p>
      <div className="tag-roulette-wheel">
        <Wheel labels={wheel.map((tag) => tag.name)} rotation={rotation} durationMs={durationMs} />
      </div>
      <div aria-live="polite">
        {isSpinning && <p className="tag-roulette-status">룰렛이 돌아가고 있어요.</p>}
        {winnerTag && (
          <p className="tag-roulette-result">
            오늘은 <strong>{winnerTag.name}</strong> 어때요?
            <span className="tag-roulette-note">식당 룰렛의 음식 종류 조건에 넣었어요. 조건에서 바꿀 수 있어요.</span>
          </p>
        )}
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="tag-roulette-actions">
        <button className="secondary-button" type="button" onClick={spin} disabled={isSpinning}>
          다시 돌리기
        </button>
        <button className="primary-button" type="button" onClick={onClose} disabled={isSpinning}>
          {winnerTag ? '이 종류로 정하기' : '닫기'}
        </button>
      </div>
    </div>
  )
}

export default TagRoulette
