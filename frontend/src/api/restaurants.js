import { request } from './client'

export function getTags(signal) {
  return request('/api/tags', { signal })
}

export function getRestaurants(filters = {}, signal) {
  const params = new URLSearchParams()
  for (const tag of filters.tags ?? []) params.append('tag', tag)
  if (filters.priceMin != null) params.set('price_min', filters.priceMin)
  if (filters.priceMax != null) params.set('price_max', filters.priceMax)
  if (filters.visited != null) params.set('visited', filters.visited)
  const query = params.toString()
  return request(`/api/restaurants${query ? `?${query}` : ''}`, { signal })
}

export function getPriceRange(signal) {
  return request('/api/price-range', { signal })
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
