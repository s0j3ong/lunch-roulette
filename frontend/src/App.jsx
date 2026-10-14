import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [healthMessage, setHealthMessage] = useState('백엔드에 연결하고 있어요.')

  useEffect(() => {
    const controller = new AbortController()

    async function checkBackend() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Health request failed with status ${response.status}`)
        }

        const result = await response.json()
        if (result.status !== 'ok') {
          throw new Error('Unexpected health response')
        }
        setHealthMessage('백엔드 응답이 정상이에요.')
      } catch {
        if (!controller.signal.aborted) {
          setHealthMessage('백엔드에 연결할 수 없어요. 백엔드 서버가 실행 중인지 확인해 주세요.')
        }
      }
    }

    checkBackend()
    return () => controller.abort()
  }, [])

  return (
    <main>
      <h1>오늘 뭐 먹지?</h1>
      <p aria-live="polite">{healthMessage}</p>
    </main>
  )
}

export default App
