import React, { useState } from 'react';
import { User, Zap, PlusCircle, Check, Info } from 'lucide-react';

const Settings = ({ 
  userProfile, 
  onSaveProfile, 
  onAddCustomFood,
  onClearData
}) => {
  const [apiKey, setApiKey] = useState(userProfile.apiKey || '');
  const [targetCals, setTargetCals] = useState(String(userProfile.targetCalories || 2000));
  const [targetProt, setTargetProt] = useState(String(userProfile.targetProtein || 120));
  const [targetFat, setTargetFat] = useState(String(userProfile.targetFat || 50));
  const [targetCarb, setTargetCarb] = useState(String(userProfile.targetCarb || 200));

  // BMR Calc state
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('1.375'); // Lightly active
  const [bmrResult, setBmrResult] = useState(null);

  // Custom Food Form
  const [foodName, setFoodName] = useState('');
  const [foodCals, setFoodCals] = useState('');
  const [foodProt, setFoodProt] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodCarb, setFoodCarb] = useState('');
  const [foodFiber, setFoodFiber] = useState('');
  const [foodSuccess, setFoodSuccess] = useState(false);

  const handleSaveProfile = () => {
    onSaveProfile({
      apiKey: apiKey.trim(),
      targetCalories: parseInt(targetCals) || 2000,
      targetProtein: parseInt(targetProt) || 120,
      targetFat: parseInt(targetFat) || 50,
      targetCarb: parseInt(targetCarb) || 200
    });
    alert('设置已成功保存！');
  };

  const handleCalculateBmr = (e) => {
    e.preventDefault();
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w) return;

    // Harris-Benedict Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    const tdee = bmr * parseFloat(activity);
    const bmrRound = Math.round(bmr);
    const tdeeRound = Math.round(tdee);
    
    // Suggest target: cut 300-500 kcal for weight loss
    const suggestCals = Math.round(tdeeRound - 350);

    setBmrResult({
      bmr: bmrRound,
      tdee: tdeeRound,
      suggest: suggestCals
    });
  };

  const handleApplySuggestion = () => {
    if (!bmrResult) return;
    setTargetCals(String(bmrResult.suggest));
    // Rule of thumb macros: Protein = 1.8g per kg bodyweight
    const w = parseFloat(weight) || 70;
    const proteinG = Math.round(w * 1.8);
    setTargetProt(String(proteinG));
    // Fat = 25% of calories / 9
    const fatG = Math.round((bmrResult.suggest * 0.25) / 9);
    setTargetFat(String(fatG));
    // Carbs = Rest of calories / 4
    const restCals = bmrResult.suggest - (proteinG * 4) - (fatG * 9);
    const carbG = Math.round(Math.max(50, restCals / 4));
    setTargetCarb(String(carbG));
  };

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodName) return;

    onAddCustomFood({
      id: 'custom_' + Date.now(),
      name: foodName,
      calories: parseInt(foodCals) || 0,
      protein: parseFloat(foodProt) || 0,
      fat: parseFloat(foodFat) || 0,
      carb: parseFloat(foodCarb) || 0,
      fiber: parseFloat(foodFiber) || 0,
      defaultAmount: 100
    });

    setFoodName('');
    setFoodCals('');
    setFoodProt('');
    setFoodFat('');
    setFoodCarb('');
    setFoodFiber('');
    
    setFoodSuccess(true);
    setTimeout(() => setFoodSuccess(false), 2000);
  };

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
        系统与个人设置
      </h3>

      {/* 1. API Keys & Target */}
      <div className="glass-card">
        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} style={{ color: 'var(--color-secondary)' }} /> AI 服务与目标设置
        </h4>

        <div className="form-group">
          <label className="form-label">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI智能解析必须配置此 API Key"
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">每日目标卡路里 (kcal)</label>
            <input
              type="number"
              value={targetCals}
              onChange={(e) => setTargetCals(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">蛋白质目标 (g)</label>
            <input
              type="number"
              value={targetProt}
              onChange={(e) => setTargetProt(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">碳水化合物目标 (g)</label>
            <input
              type="number"
              value={targetCarb}
              onChange={(e) => setTargetCarb(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">脂肪目标 (g)</label>
            <input
              type="number"
              value={targetFat}
              onChange={(e) => setTargetFat(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <button className="btn-primary" style={{ marginTop: '10px' }} onClick={handleSaveProfile}>
          保存设置
        </button>
      </div>

      {/* 2. BMR/TDEE Calculator */}
      <div className="glass-card">
        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} style={{ color: 'var(--color-primary)' }} /> 科学代谢计算器 (BMR / TDEE)
        </h4>

        <form onSubmit={handleCalculateBmr}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div className="form-group">
              <label className="form-label">性别</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="form-input"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">年龄</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                placeholder="岁" 
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">身高 (cm)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                placeholder="cm" 
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">体重 (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg" 
                className="form-input" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">日常运动活跃度</label>
            <select 
              value={activity} 
              onChange={(e) => setActivity(e.target.value)}
              className="form-input"
            >
              <option value="1.2">久坐无运动</option>
              <option value="1.375">轻度活动（每周运动1-3天）</option>
              <option value="1.55">中度活动（每周运动3-5天）</option>
              <option value="1.725">重度活动（每周运动6-7天）</option>
            </select>
          </div>

          <button type="submit" className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
            计算今日消耗
          </button>
        </form>

        {bmrResult && (
          <div style={{ marginTop: '16px', background: '#f8faf9', border: '1px solid rgba(16, 185, 129, 0.08)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>基础代谢率 (BMR):</span>
              <span style={{ fontWeight: 'bold' }}>{bmrResult.bmr} kcal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>日总消耗 (TDEE):</span>
              <span style={{ fontWeight: 'bold' }}>{bmrResult.tdee} kcal</span>
            </div>
            
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.12)', fontSize: '12px', color: '#065f46', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                根据您的TDEE，减脂期合理日摄入热量推荐为：<strong>{bmrResult.suggest} kcal</strong>（已赤字约 350 kcal）。
              </div>
            </div>

            <button 
              type="button" 
              className="btn-primary" 
              style={{ fontSize: '12px', padding: '8px' }}
              onClick={handleApplySuggestion}
            >
              一键应用此热量与宏量目标
            </button>
          </div>
        )}
      </div>

      {/* 3. Custom Food Creator */}
      <div className="glass-card">
        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={16} style={{ color: 'var(--color-fat)' }} /> 添加自定义食物
        </h4>

        <form onSubmit={handleAddFood}>
          <div className="form-group">
            <label className="form-label">食物名称</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="例如：冷榨椰子油"
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">热量 (kcal/100g)</label>
              <input
                type="number"
                value={foodCals}
                onChange={(e) => setFoodCals(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">蛋白质 (g/100g)</label>
              <input
                type="number"
                step="0.1"
                value={foodProt}
                onChange={(e) => setFoodProt(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">碳水 (g/100g)</label>
              <input
                type="number"
                step="0.1"
                value={foodCarb}
                onChange={(e) => setFoodCarb(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">脂肪 (g/100g)</label>
              <input
                type="number"
                step="0.1"
                value={foodFat}
                onChange={(e) => setFoodFat(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '10px', background: foodSuccess ? '#10b981' : undefined }}
            disabled={foodSuccess}
          >
            {foodSuccess ? (
              <>
                <Check size={16} /> 成功加入本地食物库！
              </>
            ) : (
              '确认加入食物库'
            )}
          </button>
        </form>
      </div>

      {/* 4. Danger Zone */}
      <div className="glass-card" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px', color: '#ef4444' }}>危险区域</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          清除所有本地数据（今日日志、体重记录、设置），恢复到出厂默认状态。该操作不可逆！
        </p>
        <button 
          className="btn-secondary" 
          style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
          onClick={() => {
            if (window.confirm('确认清除所有本地记录吗？')) {
              onClearData();
            }
          }}
        >
          恢复出厂默认值
        </button>
      </div>
    </div>
  );
};

export default Settings;
