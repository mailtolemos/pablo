interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export function Sparkline({ data, width = 80, height = 24, positive = true }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const sampled = data.length > 30
    ? data.filter((_, i) => i % Math.ceil(data.length / 30) === 0)
    : data;

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;

  const points = sampled.map((val, i) => {
    const x = (i / (sampled.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');

  const color = positive ? '#00D084' : '#ef4444';

  // Create gradient fill
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="sparkline-mini">
      <defs>
        <linearGradient id={`grad-${positive ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#grad-${positive ? 'g' : 'r'})`}
        points={fillPoints}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
