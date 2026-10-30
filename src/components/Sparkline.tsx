export function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values) - 20
  const max = Math.max(...values) + 20
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${42 - ((value - min) / (max - min)) * 36}`).join(' ')
  return (
    <svg className="sparkline" viewBox="0 0 100 45" preserveAspectRatio="none" aria-label="過去十二小時用電趨勢">
      <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#19bda5" stopOpacity=".32" /><stop offset="1" stopColor="#19bda5" stopOpacity="0" /></linearGradient></defs>
      <path d={`M ${points} L 100,45 L 0,45 Z`} fill="url(#chartFill)" />
      <polyline points={points} fill="none" stroke="#15b89f" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
