import { request } from './client'

export function getTags(signal) {
  return request('/api/tags', { signal })
}

export function deleteTag(id) {
  return request(`/api/tags/${id}`, { method: 'DELETE' })
}

export function getRestaurants(filters = {}, signal) {
  const params = new URLSearchParams()
  for (const tag of filters.tags ?? []) params.append('tag', tag)
  for (const band of filters.priceBands ?? []) params.append('price_band', band)
  if (filters.visited != null) params.set('visited', filters.visited)
  const query = params.toString()
  return request(`/api/restaurants${query ? `?${query}` : ''}`, { signal })
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

export function deleteRestaurant(id) {
  return request(`/api/restaurants/${id}`, { method: 'DELETE' })
}
