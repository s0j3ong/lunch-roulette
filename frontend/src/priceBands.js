// 가격대 구간. 서버의 services/filters.py와 같은 경계를 쓴다.
export const PRICE_BANDS = [
  { value: 'under_10k', label: '1만원 이하' },
  { value: '10k_20k', label: '1~2만원' },
  { value: 'over_20k', label: '2만원 이상' },
]

export function priceBandLabel(price) {
  if (price === null) return null
  if (price <= 10000) return '1만원 이하'
  if (price < 20000) return '1~2만원'
  return '2만원 이상'
}

export function formatPrice(price) {
  return price === null ? '가격 미정' : `${price.toLocaleString('ko-KR')}원`
}

// 예: "1~2만원 · 12,000원", 가격이 없으면 "가격 미정"
export function priceText(price) {
  const band = priceBandLabel(price)
  return band ? `${band} · ${formatPrice(price)}` : formatPrice(price)
}
