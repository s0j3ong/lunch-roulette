async function request(path, options = {}) {
  let response
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    if (options.signal?.aborted) throw error
    throw new Error('백엔드에 연결할 수 없어요. 서버가 실행 중인지 확인해 주세요.')
  }

  if (!response.ok) {
    let message = `요청을 처리하지 못했어요. (${response.status})`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((error) => error.msg).join(', ')
      }
    } catch {
      message = `요청을 처리하지 못했어요. (${response.status})`
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}

export function getTags(signal) {
  return request('/api/tags', { signal })
}

export function getRestaurant(id, signal) {
  return request(`/api/restaurants/${id}`, { signal })
}

export function createRestaurant(restaurant) {
  return request('/api/restaurants', {
    method: 'POST',
    body: JSON.stringify(restaurant),
  })
}

export function updateRestaurant(id, restaurant) {
  return request(`/api/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(restaurant),
  })
}
