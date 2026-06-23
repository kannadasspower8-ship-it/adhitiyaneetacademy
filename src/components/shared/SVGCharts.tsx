import React from "react"

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface ChartProps {
  data: ChartDataPoint[]
  maxVal?: number
  height?: number
}

// 1. LINE CHART COMPONENT
export function LineChart({ data, maxVal = 720, height = 240, strokeColor = "#2563EB" }: {
  data: {
    label: string
    value: number
    score?: number
    maxMarks?: number
    percentage?: number
    date?: string
  }[]
  maxVal?: number
  height?: number
  strokeColor?: string
}) {
  const [hoveredPoint, setHoveredPoint] = React.useState<any | null>(null)

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 font-semibold">No test records to plot</div>
  }

  const padding = 45
  const chartHeight = height - padding * 2
  const chartWidth = 500

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2)
    const y = height - padding - (d.value / maxVal) * chartHeight
    return { x, y, ...d }
  })

  // Generate SVG path string
  let pathD = ""
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} `
    for (let i = 1; i < points.length; i++) {
      pathD += `L ${points[i].x} ${points[i].y} `
    }
  }

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding + pct * chartHeight
          const labelVal = Math.round(maxVal * (1 - pct))
          return (
            <g key={i} className="opacity-40">
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text x={padding - 10} y={y + 4} fill="#64748B" className="text-[10px] font-bold" textAnchor="end">
                {labelVal}
              </text>
            </g>
          )
        })}

        {/* The line path */}
        {points.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_8px_rgba(37,99,235,0.2)]"
          />
        )}

        {/* Data points */}
        {points.map((pt, idx) => (
          <g
            key={idx}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint(pt)}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => setHoveredPoint(pt)}
          >
            {/* Larger transparent hover target */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={12}
              fill="transparent"
            />
            {/* Visual dot */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={pt.value === hoveredPoint?.value && pt.label === hoveredPoint?.label ? 7 : 4.5}
              fill={strokeColor}
              stroke="#FFFFFF"
              strokeWidth={2.5}
              className="transition-all duration-150"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((pt, idx) => (
          <text
            key={idx}
            x={pt.x}
            y={height - padding + 20}
            fill="#64748B"
            className="text-[9px] font-bold"
            textAnchor="middle"
          >
            {pt.date || pt.label}
          </text>
        ))}
      </svg>

      {/* Floating Tooltip HTML Overlay */}
      {hoveredPoint && (
        <div
          className="absolute bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-slate-750 pointer-events-none text-[11px] space-y-1.5 z-50 transition-all duration-150 min-w-[150px]"
          style={{
            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: "translate(-50%, -115%)"
          }}
        >
          <p className="font-extrabold text-slate-100 border-b border-slate-800 pb-1 truncate max-w-[180px]">
            {hoveredPoint.label}
          </p>
          <p className="text-slate-400 font-semibold">
            Date: <span className="text-white">{hoveredPoint.date || "N/A"}</span>
          </p>
          <p className="text-slate-400 font-semibold">
            Score: <span className="text-blue-400 font-bold">{hoveredPoint.score ?? hoveredPoint.value} / {hoveredPoint.maxMarks ?? maxVal}</span>
          </p>
          <p className="text-slate-400 font-semibold">
            Percentage: <span className="text-amber-400 font-bold">{hoveredPoint.percentage ?? Math.round((hoveredPoint.value / maxVal) * 100)}%</span>
          </p>
        </div>
      )}
    </div>
  )
}

// 2. BAR CHART COMPONENT
export function BarChart({ data, maxVal = 200, height = 240 }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 font-semibold">No data available</div>
  }

  const padding = 40
  const chartHeight = height - padding * 2
  const chartWidth = 400
  const barWidth = 32
  const barGap = 40

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding + pct * chartHeight
          const labelVal = Math.round(maxVal * (1 - pct))
          return (
            <g key={i} className="opacity-45">
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={1}
              />
              <text x={padding - 10} y={y + 4} fill="#64748B" className="text-[10px] font-bold" textAnchor="end">
                {labelVal}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const x = padding + barGap + index * (barWidth + barGap)
          const barHeight = (d.value / maxVal) * chartHeight
          const y = height - padding - barHeight
          const barColor = d.color || "#2563EB"

          return (
            <g key={index} className="group cursor-pointer">
              {/* Rounded top rect */}
              <path
                d={`
                  M ${x} ${y + 6}
                  A 6 6 0 0 1 ${x + barWidth} ${y + 6}
                  L ${x + barWidth} ${height - padding}
                  L ${x} ${height - padding}
                  Z
                `}
                fill={barColor}
                className="transition-all duration-300 hover:brightness-90"
              />
              {/* Tooltip */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                fill="#0F172A"
                className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                textAnchor="middle"
              >
                {d.value}
              </text>
              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 18}
                fill="#64748B"
                className="text-[10px] font-bold"
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// 3. AREA CHART COMPONENT
export function AreaChart({ data, maxVal = 720, height = 240 }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 font-semibold">No records found</div>
  }

  const padding = 40
  const chartHeight = height - padding * 2
  const chartWidth = 500

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2)
    const y = padding + chartHeight - (d.value / maxVal) * chartHeight
    return { x, y, ...d }
  })

  // Generate Area SVG path
  let areaPathD = ""
  let linePathD = ""
  if (points.length > 0) {
    linePathD = `M ${points[0].x} ${points[0].y} `
    areaPathD = `M ${points[0].x} ${height - padding} L ${points[0].x} ${points[0].y} `

    for (let i = 1; i < points.length; i++) {
      linePathD += `L ${points[i].x} ${points[i].y} `
      areaPathD += `L ${points[i].x} ${points[i].y} `
    }

    areaPathD += `L ${points[points.length - 1].x} ${height - padding} Z`
  }

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding + pct * chartHeight
          const labelVal = Math.round(maxVal * (1 - pct))
          return (
            <g key={i} className="opacity-40">
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#E2E8F0" />
              <text x={padding - 10} y={y + 4} fill="#64748B" className="text-[10px] font-bold" textAnchor="end">
                {labelVal}
              </text>
            </g>
          )
        })}

        {/* The shaded area fill */}
        {points.length > 1 && <path d={areaPathD} fill="url(#areaGrad)" />}

        {/* The stroke line */}
        {points.length > 1 && (
          <path
            d={linePathD}
            fill="none"
            stroke="#2563EB"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={pt.x}
              cy={pt.y}
              r={4.5}
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            {/* Tooltip */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect x={pt.x - 35} y={pt.y - 30} width={70} height={20} rx={4} fill="#0F172A" />
              <text x={pt.x} y={pt.y - 16} fill="#FFFFFF" className="text-[9px] font-bold" textAnchor="middle">
                {pt.value}
              </text>
            </g>
          </g>
        ))}

        {/* X labels */}
        {points.map((pt, idx) => (
          <text
            key={idx}
            x={pt.x}
            y={height - padding + 18}
            fill="#64748B"
            className="text-[9px] font-bold"
            textAnchor="middle"
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

// 4. DONUT CHART COMPONENT
export function DonutChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  const size = 160
  const radius = 60
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Dashed arcs */}
          {total > 0 &&
            data.map((d, i) => {
              const percentage = d.value / total
              const strokeLength = percentage * circumference
              const strokeOffset = circumference - strokeLength + currentOffset
              currentOffset -= strokeLength

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={d.color || "#2563EB"}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )
            })}
        </svg>
        {/* Core text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Items</span>
          <span className="text-xl font-extrabold text-slate-800">{total}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((d, i) => {
          const pctVal = total > 0 ? ((d.value / total) * 100).toFixed(0) : "0"
          return (
            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color || "#2563EB" }}></span>
                <span className="text-xs font-semibold text-slate-600">{d.label}</span>
              </div>
              <span className="text-xs font-bold text-slate-800">
                {d.value} <span className="text-slate-400 font-medium">({pctVal}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
