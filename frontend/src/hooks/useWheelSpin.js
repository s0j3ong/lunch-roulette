import { useEffect, useRef, useState } from 'react'
import { nextRotation } from '../components/wheelRotation'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// 룰렛 회전 각도와 시간을 관리한다. spinTo는 회전이 끝나면 완료되는 Promise를 돌려준다.
export function useWheelSpin() {
  const reduceMotion = usePrefersReducedMotion()
  // "동작 줄이기"를 켰으면 짧게 한 바퀴만 돌고 멈춘다.
  const durationMs = reduceMotion ? 600 : 4000
  const turns = reduceMotion ? 1 : 6
  const [rotation, setRotation] = useState(0)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function spinTo(index, count) {
    setRotation((current) => nextRotation(current, index, count, turns))
    return new Promise((resolve) => {
      timer.current = setTimeout(resolve, durationMs)
    })
  }

  return { rotation, durationMs, spinTo }
}
