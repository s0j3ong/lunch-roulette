import { request } from './client'

export function recommendRestaurant(conditions) {
  return request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(conditions),
  })
}

export function recommendTag(conditions) {
  return request('/api/recommendations/tag', {
    method: 'POST',
    body: JSON.stringify(conditions),
  })
}
