import React from 'react';

const WeightChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        暂无体重数据，请在下方打卡记录
      </div>
    );
  }

  // Take last 7 records for display
  const chartData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);
  
  const width = 400;
  const height = 150;
  const paddingLeft = 30;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights) - 0.5;
  const maxWeight = Math.max(...weights) + 0.5;
  const weightRange = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;

  const getX = (index) => {
    if (chartData.length <= 1) return width / 2;
    const steps = chartData.length - 1;
    const innerWidth = width - paddingLeft - paddingRight;
    return paddingLeft + (index / steps) * innerWidth;
  };

  const getY = (weight) => {
    const innerHeight = height - paddingTop - paddingBottom;
    const ratio = (weight - minWeight) / weightRange;
    return height - paddingBottom - ratio * innerHeight;
  };

  // Build points path
  const points = chartData.map((d, i) => ({
    x: getX(i),
    y: getY(d.weight),
    weight: d.weight,
    date: d.date.substring(5) // MM-DD
  }));

  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="weight-chart-container" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="weight-line-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-secondary)" />
        </linearGradient>
        <linearGradient id="weight-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const yVal = minWeight + ratio * weightRange;
        const yCoord = getY(yVal);
        return (
          <g key={i}>
            <line 
              x1={paddingLeft} 
              y1={yCoord} 
              x2={width - paddingRight} 
              y2={yCoord} 
              className="weight-grid-line" 
            />
            <text 
              x={paddingLeft - 8} 
              y={yCoord + 3} 
              fill="var(--text-muted)" 
              fontSize="9" 
              textAnchor="end"
            >
              {yVal.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Area path */}
      {points.length > 0 && <path d={areaD} className="weight-area" />}

      {/* Line path */}
      {points.length > 0 && <path d={pathD} className="weight-line" />}

      {/* Points & Labels */}
      {points.map((p, i) => (
        <g key={i}>
          {/* Vertical guide line on dot hover (subtle) */}
          <line 
            x1={p.x} 
            y1={p.y} 
            x2={p.x} 
            y2={height - paddingBottom} 
            stroke="rgba(255, 255, 255, 0.05)" 
            strokeDasharray="2 2"
          />
          {/* Weight label above dot */}
          <text 
            x={p.x} 
            y={p.y - 8} 
            fill="var(--text-primary)" 
            fontSize="10" 
            fontWeight="bold"
            textAnchor="middle"
          >
            {p.weight}
          </text>
          {/* Dot */}
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            className="weight-dot" 
          />
          {/* Date Label on X axis */}
          <text 
            x={p.x} 
            y={height - 8} 
            fill="var(--text-secondary)" 
            fontSize="9" 
            textAnchor="middle"
          >
            {p.date}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default WeightChart;
