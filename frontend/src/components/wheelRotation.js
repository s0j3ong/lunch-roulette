// 각도는 12시 방향을 0도로 하고 시계 방향으로 잰다.
// 포인터(12시)가 index번째 칸 안쪽에 오도록 하는 다음 회전 각도를 구한다.
export function nextRotation(current, index, count, spins = 6) {
  const slice = 360 / count
  const jitter = count === 1 ? 0 : (Math.random() - 0.5) * slice * 0.6
  const target = (360 - ((index + 0.5) * slice + jitter)) % 360
  const currentAngle = ((current % 360) + 360) % 360
  const delta = (target - currentAngle + 360) % 360
  return current + spins * 360 + delta
}
