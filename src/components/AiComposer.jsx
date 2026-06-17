import React, { useState } from 'react';
import { Sparkles, Utensils, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { generateSmartMeal } from '../utils/aiService';

const AiComposer = ({ 
  foodDatabase, 
  todayLogs, 
  userProfile, 
  onLogFood, 
  setActiveTab 
}) => {
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [mealSlot, setMealSlot] = useState('lunch');
  const [logSuccess, setLogSuccess] = useState(false);

  // 1. Calculate today's eaten totals
  const eatenStats = todayLogs.reduce((acc, item) => {
    acc.calories += item.calories || 0;
    acc.protein += item.protein || 0;
    acc.fat += item.fat || 0;
    acc.carb += item.carb || 0;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carb: 0 });

  // 2. Compute remaining targets (1500kcal, 140g C, 136g P, 45g F as base if profile empty)
  const targetCals = userProfile.targetCalories || 1500;
  const targetProt = userProfile.targetProtein || 136;
  const targetFat = userProfile.targetFat || 45;
  const targetCarb = userProfile.targetCarb || 140;

  const remaining = {
    calories: Math.max(0, targetCals - eatenStats.calories),
    carb: Math.max(0, (targetCarb - eatenStats.carb).toFixed(1)),
    protein: Math.max(0, (targetProt - eatenStats.protein).toFixed(1)),
    fat: Math.max(0, (targetFat - eatenStats.fat).toFixed(1)),
  };

  const handleSelectFood = (id) => {
    setSelectedFoodIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerateMeal = async () => {
    if (selectedFoodIds.length === 0) {
      setErrorMsg('请至少选择一种食材进行搭配！');
      return;
    }
    if (!userProfile.apiKey) {
      setErrorMsg('请先在“设置”中配置 Gemini API Key');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setGeneratedRecipe(null);

    const selectedFoods = foodDatabase.filter(f => selectedFoodIds.includes(f.id));

    try {
      const result = await generateSmartMeal(selectedFoods, remaining, userProfile.apiKey);
      setGeneratedRecipe(result);
    } catch (err) {
      setErrorMsg(err.message || 'AI 智能配餐生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogIngredients = () => {
    if (!generatedRecipe) return;
    
    generatedRecipe.ingredients.forEach(item => {
      onLogFood({
        name: item.foodName,
        amount: item.amount,
        calories: item.calories,
        protein: item.protein,
        fat: item.fat,
        carb: item.carb,
        fiber: item.fiber || 0,
        mealType: mealSlot
      });
    });

    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setGeneratedRecipe(null);
      setSelectedFoodIds([]);
      setActiveTab('diary'); // Redirect to Diary page
    }, 1500);
  };

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
        AI 智能配餐助手
      </h3>

      {/* 1. Remaining Target Display */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 'bold' }}>
          🍴 本餐/今日待补足营养素缺口：
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,107,107,0.06)', padding: '8px 4px', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>热量缺口</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-calories)', fontFamily: 'var(--font-title)', marginTop: '2px' }}>
              {remaining.calories}k
            </div>
          </div>
          <div style={{ background: 'rgba(255,159,28,0.06)', padding: '8px 4px', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>碳水缺口</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-carb)', fontFamily: 'var(--font-title)', marginTop: '2px' }}>
              {remaining.carb}g
            </div>
          </div>
          <div style={{ background: 'rgba(78,168,222,0.06)', padding: '8px 4px', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>蛋白缺口</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-protein)', fontFamily: 'var(--font-title)', marginTop: '2px' }}>
              {remaining.protein}g
            </div>
          </div>
          <div style={{ background: 'rgba(170,204,0,0.06)', padding: '8px 4px', borderRadius: '10px' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>脂肪缺口</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-fat)', fontFamily: 'var(--font-title)', marginTop: '2px' }}>
              {remaining.fat}g
            </div>
          </div>
        </div>
      </div>

      {!generatedRecipe ? (
        <>
          {/* 2. Select Ingredients Grid */}
          <div className="glass-card">
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
              选择可供搭配的食材
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              勾选你想加入这顿减脂餐的食材，AI 会自动计算各食材克数，凑齐上面的缺口！
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {foodDatabase.map(food => {
                const isSelected = selectedFoodIds.includes(food.id);
                return (
                  <button
                    key={food.id}
                    type="button"
                    className="btn-secondary"
                    style={{
                      padding: '10px 8px',
                      fontSize: '12px',
                      justifyContent: 'flex-start',
                      background: isSelected ? 'rgba(16,185,129,0.08)' : undefined,
                      borderColor: isSelected ? 'var(--color-primary)' : undefined,
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                      borderWidth: '1.5px'
                    }}
                    onClick={() => handleSelectFood(food.id)}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left', width: '100%' }}>
                      <strong>{food.name}</strong>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        C:{food.carb}g · P:{food.protein}g · F:{food.fat}g
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b', fontSize: '11px', marginTop: '14px', background: 'rgba(255,107,107,0.06)', padding: '8px 12px', borderRadius: '8px' }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="button" 
              className="btn-primary" 
              style={{ marginTop: '18px' }}
              onClick={handleGenerateMeal}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  AI 正在精密计算食材克数与调味方案...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> 一键智能配餐并生成烹饪建议
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        /* 3. Generated Recipe Details */
        <div className="glass-card" style={{ border: '1.5px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span className="recipe-tag">✨ AI 配餐方案已生成</span>
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginTop: '6px' }}>{generatedRecipe.recipeName}</h4>
            </div>
            <button 
              className="action-icon-btn" 
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setGeneratedRecipe(null)}
            >
              <RefreshCw size={16} /> 重新配餐
            </button>
          </div>

          {/* Scaled Ingredients weight */}
          <div style={{ marginBottom: '18px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
              ⚖️ 食材精准称量表：
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {generatedRecipe.ingredients.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', background: 'var(--circle-bg-stroke)', borderRadius: '8px' }}
                >
                  <span style={{ fontWeight: '600' }}>{item.foodName}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    {item.amount} <span style={{ fontSize: '9px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>g/ml</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrient Comparison table */}
          <div style={{ marginBottom: '20px', background: 'var(--bg-gradient-start)', padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
              📊 配餐营养匹配度：
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>总热量</div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-calories)', fontSize: '13px' }}>{generatedRecipe.totalNutrients.calories}k</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>限 {remaining.calories}k</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>碳水</div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-carb)', fontSize: '13px' }}>{generatedRecipe.totalNutrients.carb.toFixed(0)}g</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>需 {remaining.carb}g</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>蛋白质</div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-protein)', fontSize: '13px' }}>{generatedRecipe.totalNutrients.protein.toFixed(0)}g</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>需 {remaining.protein}g</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>脂肪</div>
                <div style={{ fontWeight: 'bold', color: 'var(--color-fat)', fontSize: '13px' }}>{generatedRecipe.totalNutrients.fat.toFixed(0)}g</div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>需 {remaining.fat}g</div>
              </div>
            </div>
          </div>

          {/* Cooking steps */}
          <div style={{ marginBottom: '18px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>🍳 烹饪制作步骤：</h5>
            <ol className="bullet-list" style={{ paddingLeft: '18px', margin: 0 }}>
              {generatedRecipe.cookingSteps.map((step, idx) => (
                <li key={idx} style={{ fontSize: '12px', marginBottom: '6px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Seasoning advice */}
          <div style={{ marginBottom: '22px', background: 'rgba(16,185,129,0.03)', border: '1px dashed var(--card-border-focus)', padding: '12px', borderRadius: '10px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '4px' }}>
              🧂 控油低钠调味建议：
            </h5>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {generatedRecipe.seasoningTips}
            </p>
          </div>

          {/* Log Actions Box */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>记录至餐段：</span>
              <select 
                value={mealSlot}
                onChange={(e) => setMealSlot(e.target.value)}
                className="form-input"
                style={{ padding: '6px 10px', width: '90px', fontSize: '12px', background: 'var(--input-bg)' }}
              >
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </select>
            </div>

            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleLogIngredients}
              disabled={logSuccess}
              style={{ background: logSuccess ? '#10b981' : undefined }}
            >
              {logSuccess ? (
                <>
                  <Check size={16} /> 记账成功！即将跳转饮食日志
                </>
              ) : (
                <>
                  <Utensils size={16} /> 我做好了，一键记入今日日志
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiComposer;
