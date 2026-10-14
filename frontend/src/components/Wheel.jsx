import './Wheel.css'

const RADIUS = 100
const PLACEHOLDER_SLOTS = 8
const MAX_LABEL_LENGTH = 7

// 각도는 12시 방향을 0도로 하고 시계 방향으로 잰다.
function pointAt(angle, radius) {
  const radian = (angle * Math.PI) / 180
  return [radius * Math.sin(radian), -radius * Math.cos(radian)]
}

function slicePath(start, end) {
  const [x0, y0] = pointAt(start, RADIUS)
  const [x1, y1] = pointAt(end, RADIUS)
  const largeArc = end - start > 180 ? 1 : 0
  return `M 0 0 L ${x0} ${y0} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x1} ${y1} Z`
}

function shortLabel(label) {
  return label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH - 1)}…` : label
}

function Wheel({ labels, rotation, durationMs }) {
  const isPlaceholder = labels.length === 0
  const count = isPlaceholder ? PLACEHOLDER_SLOTS : labels.length
  const slice = 360 / count
  const fontSize = count <= 4 ? 13 : count <= 6 ? 11.5 : 10

  return (
    <div
      className="wheel"
      role="img"
      aria-label={isPlaceholder ? '아직 돌리지 않은 룰렛' : `룰렛 칸: ${labels.join(', ')}`}
    >
      <svg className="wheel-pointer" viewBox="0 0 40 36" aria-hidden="true">
        <path d="M 4 2 L 36 2 L 20 32 Z" />
      </svg>
      <svg
        className="wheel-disc"
        viewBox="-102 -102 204 204"
        aria-hidden="true"
        style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${durationMs}ms` }}
      >
        {Array.from({ length: count }, (_, index) => {
          const start = index * slice
          const center = start + slice / 2
          const fill = { fill: `var(--wheel-${(index % 8) + 1})` }
          return (
            <g key={index}>
              {count === 1 ? (
                <circle className="wheel-slice" r={RADIUS} style={fill} />
              ) : (
                <path className="wheel-slice" d={slicePath(start, start + slice)} style={fill} />
              )}
              {!isPlaceholder &&
                (count === 1 ? (
                  // 한 칸이면 180도 돌아 멈추므로, 멈췄을 때 포인터 아래에서 바로 읽히게 뒤집어 둔다.
                  <text className="wheel-label" x="0" y="55" fontSize={16} transform="rotate(180 0 55)">
                    {shortLabel(labels[index])}
                  </text>
                ) : (
                  <text
                    className="wheel-label"
                    x="60"
                    y="0"
                    fontSize={fontSize}
                    transform={`rotate(${center - 90})`}
                  >
                    {shortLabel(labels[index])}
                  </text>
                ))}
            </g>
          )
        })}
        <circle className="wheel-hub" r="14" />
      </svg>
    </div>
  )
}

export default Wheel
