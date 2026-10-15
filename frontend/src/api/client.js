export const AUTH_REQUIRED_EVENT = 'auth:required'

export async function request(path, options = {}) {
  let response
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new Error('백엔드에 연결할 수 없어요. 서버가 실행 중인지 확인해 주세요.')
  }

  // 로그인이 풀렸으면 앱이 로그인 화면으로 돌아가도록 알린다.
  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT))
  }

  if (!response.ok) {
    const fallback =
      response.status >= 500
        ? `서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요. (${response.status})`
        : `요청을 처리하지 못했어요. 입력 내용을 확인해 주세요. (${response.status})`
    let message = fallback
    let code = null
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        // Pydantic 검증 메시지의 "Value error, " 접두어는 떼고 보여준다.
        message = body.detail.map((error) => error.msg.replace(/^Value error, /, '')).join(', ')
      } else if (body.detail?.message) {
        message = body.detail.message
        code = body.detail.code ?? null
      }
    } catch {
      message = fallback
    }
    const error = new Error(message)
    error.code = code
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}
