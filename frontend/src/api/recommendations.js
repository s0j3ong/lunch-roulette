import { request } from './client'

export function recommendRestaurant(conditions) {
  return request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(conditions),
  })
}

// 저장된 음식 종류 전체에서 고른다. 조건은 보내지 않는다.
export function recommendTag() {
  return request('/api/recommendations/tag', { method: 'POST' })
}
