import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, Flame } from 'lucide-react';

const AiLogModal = ({ isOpen, onClose, aiData, onConfirm }) => {
  const [items, setItems] = useState([]);

  // Load items from AI data when opened
  useEffect(() => {
    if (aiData && aiData.items) {
      // Calculate per-gram metrics to scale easily
      const itemsWithPerGram = aiData.items.map(item => {
        const amt = item.amount || 100;
        return {
          id: Math.random().toString(36).substring(2, 9),
          name: item.foodName,
          amount: amt,
          perGram: {
            calories: item.calories / amt,
            protein: item.protein / amt,
            fat: item.fat / amt,
            carb: item.carb / amt,
            fiber: item.fiber / amt,
          },
          // Current scaled values
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          carb: item.carb,
          fiber: item.fiber,
          mealType: item.mealType || 'lunch', // Default to AI parsed mealType
          isEstimated: item.isEstimated
        };
      });
      setItems(itemsWithPerGram);
    }
  }, [aiData]);

  if (!isOpen || !aiData) return null;

  const handleAmountChange = (id, newAmtStr) => {
    const newAmt = parseFloat(newAmtStr) || 0;
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          amount: newAmt,
          calories: Math.round(item.perGram.calories * newAmt),
          protein: Number((item.perGram.protein * newAmt).toFixed(1)),
          fat: Number((item.perGram.fat * newAmt).toFixed(1)),
          carb: Number((item.perGram.carb * newAmt).toFixed(1)),
          fiber: Number((item.perGram.fiber * newAmt).toFixed(1)),
        };
      }
      return item;
    }));
  };

  const handleItemMealTypeChange = (id, newMealType) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, mealType: newMealType };
      }
      return item;
    }));
  };

  const handleBulkMealTypeChange = (newMealType) => {
    setItems(prev => prev.map(item => ({ ...item, mealType: newMealType })));
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (items.length === 0) return;
    const finalItems = items.map(item => ({
      name: item.name,
      amount: item.amount,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carb: item.carb,
      fiber: item.fiber,
      mealType: item.mealType
    }));
    // Pass finalItems, parsed date and weight back
    onConfirm(finalItems, aiData.date, aiData.weight);
    onClose();
  };

  const totalCals = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#c084fc' }}>✨ AI 识别结果</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>
          “{aiData.dietSummary || '分析完毕，请核对食物信息并保存记录'}”
        </p>

        {/* Date & Weight parsed banner */}
        {(aiData.date || aiData.weight) && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '12px', 
            marginBottom: '16px', 
            background: 'rgba(16,185,129,0.06)', 
            padding: '10px 14px', 
            borderRadius: '10px', 
            fontSize: '12px', 
            color: 'var(--text-primary)', 
            border: '1px solid rgba(16,185,129,0.12)' 
          }}>
            {aiData.date && (
              <div>📅 识别日期: <strong style={{ color: 'var(--color-primary)' }}>{aiData.date}</strong></div>
            )}
            {aiData.weight && (
              <div>⚖️ 识别体重: <strong style={{ color: 'var(--color-primary)' }}>{aiData.weight} kg</strong></div>
            )}
          </div>
        )}

        {/* Bulk Meal Type Selection */}
        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label">批量修改全部餐段为：</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { val: 'breakfast', label: '早餐' },
              { val: 'lunch', label: '午餐' },
              { val: 'dinner', label: '晚餐' },
              { val: 'snack', label: '加餐' }
            ].map(m => (
              <button
                key={m.val}
                type="button"
                className="btn-secondary"
                style={{
                  padding: '6px 4px',
                  fontSize: '11px',
                  margin: 0
                }}
                onClick={() => handleBulkMealTypeChange(m.val)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview List */}
        <div className="ai-preview-list" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
          {items.map(item => (
            <div key={item.id} className="ai-preview-card">
              <div className="ai-preview-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</span>
                  {item.isEstimated && <span className="ai-preview-tag">AI估算</span>}
                </div>
                <button className="action-icon-btn" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                {/* Amount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>分量:</span>
                  <input
                    type="number"
                    value={item.amount || ''}
                    className="form-input"
                    style={{ padding: '4px 8px', width: '60px', height: '26px', textAlign: 'center', margin: 0 }}
                    onChange={(e) => handleAmountChange(item.id, e.target.value)}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>g/ml</span>
                </div>

                {/* Individual Meal Type Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>餐段:</span>
                  <select 
                    value={item.mealType} 
                    onChange={(e) => handleItemMealTypeChange(item.id, e.target.value)}
                    style={{ 
                      padding: '2px 4px', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px', 
                      background: 'var(--card-bg)', 
                      color: 'var(--text-primary)', 
                      fontSize: '11px',
                      outline: 'none',
                      height: '26px'
                    }}
                  >
                    <option value="breakfast">早餐</option>
                    <option value="lunch">午餐</option>
                    <option value="dinner">晚餐</option>
                    <option value="snack">加餐</option>
                  </select>
                </div>

                {/* Calorie display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-calories)', marginLeft: 'auto' }}>
                  <Flame size={14} />
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '13px' }}>
                    {item.calories} <span style={{ fontSize: '9px', fontWeight: '400' }}>kcal</span>
                  </span>
                </div>
              </div>

              {/* Nutrition breakdown */}
              <div className="ai-preview-grid">
                <div>碳水: {item.carb}g</div>
                <div>蛋白: {item.protein}g</div>
                <div>脂肪: {item.fat}g</div>
                <div>纤维: {item.fiber}g</div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              未提取到任何有效食物项，请关闭重试
            </div>
          )}
        </div>

        {/* Total stats & buttons */}
        <div style={{ marginTop: '20px', padding: '16px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>本次AI提取总热量</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: '800', color: 'var(--color-calories)' }}>
              {totalCals} <span style={{ fontSize: '12px', fontWeight: '500' }}>kcal</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" style={{ flex: 1, margin: 0 }} onClick={onClose}>
              取消
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, margin: 0 }} 
              onClick={handleSave}
              disabled={items.length === 0}
            >
              <Check size={16} /> 确认并记入日志
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiLogModal;
