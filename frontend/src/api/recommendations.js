import { request } from './client'

export function recommendRestaurant(conditions) {
  return request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(conditions),
  })
}
