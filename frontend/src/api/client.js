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

  if (!response.ok) {
    let message = `요청을 처리하지 못했어요. (${response.status})`
    let code = null
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((error) => error.msg).join(', ')
      } else if (body.detail?.message) {
        message = body.detail.message
        code = body.detail.code ?? null
      }
    } catch {
      message = `요청을 처리하지 못했어요. (${response.status})`
    }
    const error = new Error(message)
    error.code = code
    throw error
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}
