import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { getDietDiagnosis } from '../utils/aiService';

const WeightChart = ({ 
  data, 
  dietLogs, 
  userProfile,
  diagnosisResult,
  setDiagnosisResult
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '120px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        暂无体重数据，请在下方打卡记录
      </div>
    );
  }

  // Sort weight records by date ascending
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sortedData.slice(-7); // Last 7 records for the chart
  
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

  // --- STATS CALCULATIONS ---
  // 1. 7-Day Average Weight
  const last7Weights = sortedData.slice(-7).map(d => d.weight);
  const avgWeight = (last7Weights.reduce((sum, w) => sum + w, 0) / last7Weights.length).toFixed(1);

  // 2. Weight Change Rate
  let weightChangeText = '数据累计中';
  let weightChangeVal = 0;
  let isDown = false;

  if (sortedData.length >= 2) {
    const oldest = sortedData[Math.max(0, sortedData.length - 7)].weight;
    const newest = sortedData[sortedData.length - 1].weight;
    weightChangeVal = Number((newest - oldest).toFixed(1));
    isDown = weightChangeVal < 0;
    
    if (weightChangeVal === 0) {
      weightChangeText = '体重持平';
    } else {
      weightChangeText = isDown 
        ? `较上周下降了 ${Math.abs(weightChangeVal)} kg` 
        : `较上周上升了 ${weightChangeVal} kg`;
    }
  }

  // --- AI DIAGNOSIS HANDLER ---
  const handleGetDiagnosis = async () => {
    if (!userProfile.apiKey) {
      setErrorMsg('请先在“设置”中配置 Gemini API Key');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setDiagnosisResult(null);

    try {
      const result = await getDietDiagnosis(
        sortedData, 
        dietLogs, 
        userProfile.targetCalories || 1500,
        {
          carb: userProfile.targetCarb || 140,
          protein: userProfile.targetProtein || 136,
          fat: userProfile.targetFat || 45
        },
        userProfile.apiKey
      );
      setDiagnosisResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'AI 诊断报告生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 1. Weight Line Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="weight-chart-container" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="weight-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
          <linearGradient id="weight-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
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
            <line 
              x1={p.x} 
              y1={p.y} 
              x2={p.x} 
              y2={height - paddingBottom} 
              stroke="rgba(0, 0, 0, 0.02)" 
              strokeDasharray="2 2"
            />
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
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              className="weight-dot" 
            />
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

      {/* 2. Weight Stats Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', marginTop: '16px' }}>
        <div style={{ background: '#f8faf9', border: '1px solid var(--card-border)', padding: '12px 14px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>7日平均体重</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
            {avgWeight} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>kg</span>
          </div>
        </div>

        <div style={{ background: '#f8faf9', border: '1px solid var(--card-border)', padding: '12px 14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>近期减重速率</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '13px', fontWeight: 'bold', color: weightChangeVal === 0 ? 'var(--text-primary)' : isDown ? '#10b981' : '#ff6b6b' }}>
            {weightChangeVal === 0 ? null : isDown ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            <span>{weightChangeText}</span>
          </div>
        </div>
      </div>

      {/* 3. AI Diet & Weight Diagnosis Panel */}
      <div className="glass-card" style={{ marginTop: '16px', padding: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(78, 168, 222, 0.05))', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          AI 减脂状态诊断周报
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>
          结合你最近的体重走势和每天的食物成分，由 AI 医生诊断你减肥停滞或下降的原因并提供优化方案。
        </p>

        {/* Action Button */}
        {!diagnosisResult && !loading && (
          <button 
            type="button" 
            className="btn-primary" 
            style={{ fontSize: '13px', padding: '10px' }}
            onClick={handleGetDiagnosis}
          >
            一键生成 AI 减脂深度诊断
          </button>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-primary)', padding: '12px 0', fontSize: '12px', fontWeight: '500' }}>
            <Loader2 size={16} className="spin" />
            AI 医生正在深度比对体重历史与食物营养素结构...
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b', fontSize: '11px', marginTop: '10px', background: 'rgba(255,107,107,0.06)', padding: '8px 12px', borderRadius: '8px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Diagnosis Results */}
        {diagnosisResult && !loading && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Status summary */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>体重走势</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857', marginTop: '2px' }}>{diagnosisResult.weightTrend}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(78,168,222,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(78,168,222,0.15)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>最近累计减重</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                  {diagnosisResult.weightChangeKg > 0 ? `-${diagnosisResult.weightChangeKg} kg` : diagnosisResult.weightChangeKg === 0 ? '0 kg' : `+${Math.abs(diagnosisResult.weightChangeKg)} kg`}
                </div>
              </div>
            </div>

            {/* Macro Analysis */}
            <div>
              <h5 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>🥑 营养摄入评估：</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {diagnosisResult.macroAnalysis}
              </p>
            </div>

            {/* Diagnosis Report */}
            <div>
              <h5 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>🩺 AI 深度诊疗意见：</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {diagnosisResult.diagnosisReport}
              </p>
            </div>

            {/* Action plan */}
            <div style={{ borderTop: '1px dashed var(--card-border-focus)', paddingTop: '10px' }}>
              <h5 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '6px' }}>📝 下阶段优化执行指南：</h5>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {diagnosisResult.actionPlan.map((action, idx) => (
                  <li key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              style={{ fontSize: '11px', padding: '6px', width: '100%', marginTop: '4px' }}
              onClick={handleGetDiagnosis}
            >
              刷新诊断报告
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightChart;
