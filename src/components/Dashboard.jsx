import React, { useState } from 'react';
import { Flame, Sparkles, Wand2, Loader2, AlertCircle, Plus } from 'lucide-react';

const Dashboard = ({ 
  todayLogs, 
  userProfile, 
  todayBurned,
  onAiSuccess, 
  onQueryAi,
  onAddQuickLog 
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Calculate today's intake
  const eatenStats = todayLogs.reduce((acc, item) => {
    acc.calories += item.calories || 0;
    acc.protein += item.protein || 0;
    acc.fat += item.fat || 0;
    acc.carb += item.carb || 0;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carb: 0 });

  const targetCals = userProfile.targetCalories || 1500;
  const burnedCals = todayBurned;
  
  // Remaining = Target - Eaten + Burned
  const remainingCals = Math.max(0, targetCals - eatenStats.calories + burnedCals);
  
  // Circle SVG calculations
  const r = 55;
  const circumference = 2 * Math.PI * r;
  const percent = Math.min(100, (eatenStats.calories / targetCals) * 100);
  const offset = circumference - (percent / 100) * circumference;

  // Macros Targets
  const targetProtein = userProfile.targetProtein || 120;
  const targetFat = userProfile.targetFat || 50;
  const targetCarb = userProfile.targetCarb || 200;

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await onQueryAi(inputText, (data) => {
        onAiSuccess(data);
        setInputText('');
      });
    } catch (err) {
      setErrorMsg(err.message || 'AI 智能解析失败，请检查网络或配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 1. Calorie Circle Gauge */}
      <div className="glass-card" style={{ padding: '24px 20px' }}>
        <div className="dashboard-summary">
          <div className="cal-circle-container">
            <svg width="140" height="140" className="cal-circle-svg">
              <circle cx="70" cy="70" r={r} className="circle-bg" />
              <circle 
                cx="70" 
                cy="70" 
                r={r} 
                className="circle-progress"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="cal-circle-text">
              <span className="cal-circle-number">{remainingCals}</span>
              <span className="cal-circle-label">剩余可用 (kcal)</span>
            </div>
          </div>

          <div className="cal-detail-list">
            <div className="cal-detail-item">
              <span className="cal-detail-label">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-calories)' }}></span>
                今日目标
              </span>
              <span className="cal-detail-value">{targetCals} <span style={{ fontSize: '10px', fontWeight: '400' }}>kcal</span></span>
            </div>
            <div className="cal-detail-item">
              <span className="cal-detail-label">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7' }}></span>
                已摄入
              </span>
              <span className="cal-detail-value" style={{ color: 'var(--text-primary)' }}>
                {eatenStats.calories} <span style={{ fontSize: '10px', fontWeight: '400' }}>kcal</span>
              </span>
            </div>
            <div className="cal-detail-item">
              <span className="cal-detail-label">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                运动消耗
              </span>
              <span className="cal-detail-value" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                +{burnedCals} <span style={{ fontSize: '10px', fontWeight: '400' }}>kcal</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Macro bars */}
        <div className="macros-grid">
          {/* Carbs */}
          <div className="macro-capsule">
            <span className="macro-name">碳水化合物</span>
            <div className="macro-progress-wrapper">
              <div 
                className="macro-progress-bar carb" 
                style={{ width: `${Math.min(100, (eatenStats.carb / targetCarb) * 100)}%` }}
              ></div>
            </div>
            <span className="macro-value">{Math.round(eatenStats.carb)}g</span>
            <span className="macro-target">目标 {targetCarb}g</span>
          </div>

          {/* Protein */}
          <div className="macro-capsule">
            <span className="macro-name">蛋白质</span>
            <div className="macro-progress-wrapper">
              <div 
                className="macro-progress-bar protein" 
                style={{ width: `${Math.min(100, (eatenStats.protein / targetProtein) * 100)}%` }}
              ></div>
            </div>
            <span className="macro-value">{Math.round(eatenStats.protein)}g</span>
            <span className="macro-target">目标 {targetProtein}g</span>
          </div>

          {/* Fat */}
          <div className="macro-capsule">
            <span className="macro-name">脂肪</span>
            <div className="macro-progress-wrapper">
              <div 
                className="macro-progress-bar fat" 
                style={{ width: `${Math.min(100, (eatenStats.fat / targetFat) * 100)}%` }}
              ></div>
            </div>
            <span className="macro-value">{Math.round(eatenStats.fat)}g</span>
            <span className="macro-target">目标 {targetFat}g</span>
          </div>
        </div>
      </div>

      {/* 3. AI Magic Box */}
      <div className="glass-card ai-magic-box">
        <div className="ai-magic-title">
          <Sparkles size={18} style={{ color: '#c084fc' }} />
          <span>AI 闪电智能记账</span>
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          支持自然语言口语化记录，AI自动拆分克数并计算卡路里！
        </p>

        <form onSubmit={handleAiSubmit} className="ai-input-wrapper">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="告诉我你今天吃了什么，例如：&#10;“早上吃了两个煮鸡蛋，午餐吃了150克生鸡胸肉加一盘西蓝花”"
            className="ai-textarea"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="ai-submit-btn" 
            disabled={loading || !inputText.trim()}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
          </button>
        </form>

        {loading && (
          <div className="ai-loading-state">
            <Loader2 size={14} className="spin" />
            <span>AI正在帮您智能匹配食物库并计算热量...</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '11px', marginTop: '10px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 4. Tips & Quick Actions */}
      <div className="glass-card">
        <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>💡 小建议</h4>
        <ul className="bullet-list">
          <li>记得去<strong>“设置”</strong>配置你的 <strong>Gemini API Key</strong>，开启强大的 AI 记账功能。</li>
          <li>如果大模型返回信息不准，可以在记账预览窗内<strong>直接修改克数</strong>，系统会自动重算。</li>
          <li>在<strong>“食谱”</strong>页面可以挑选减脂食谱，支持一键把配料表记录进今天的账单！</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
