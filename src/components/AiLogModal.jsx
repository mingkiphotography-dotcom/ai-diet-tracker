import React, { useState, useEffect } from 'react';
import { Trash2, Check, X, Flame } from 'lucide-react';

const AiLogModal = ({ isOpen, onClose, aiData, onConfirm }) => {
  const [items, setItems] = useState([]);
  const [mealType, setMealType] = useState('breakfast');

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
          isEstimated: item.isEstimated
        };
      });
      setItems(itemsWithPerGram);

      // Smart guess mealType based on local time
      const hour = new Date().getHours();
      if (hour < 10) setMealType('breakfast');
      else if (hour < 14) setMealType('lunch');
      else if (hour < 19) setMealType('dinner');
      else setMealType('snack');
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
      mealType: mealType
    }));
    onConfirm(finalItems);
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

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', fontStyle: 'italic' }}>
          “{aiData.dietSummary || '分析完毕，请核对食物信息并保存记录'}”
        </p>

        {/* Meal Type Selection */}
        <div className="form-group">
          <label className="form-label">记录到哪个餐段？</label>
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
                  padding: '8px',
                  fontSize: '12px',
                  background: mealType === m.val ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                  borderColor: mealType === m.val ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                  color: mealType === m.val ? 'white' : 'var(--text-primary)'
                }}
                onClick={() => setMealType(m.val)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview List */}
        <div className="ai-preview-list">
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>分量:</span>
                  <input
                    type="number"
                    value={item.amount || ''}
                    className="form-input"
                    style={{ padding: '4px 8px', width: '70px', height: '28px', textAlign: 'center' }}
                    onChange={(e) => handleAmountChange(item.id, e.target.value)}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>g/ml</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-calories)' }}>
                  <Flame size={14} />
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '14px' }}>
                    {item.calories} <span style={{ fontSize: '10px', fontWeight: '400' }}>kcal</span>
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
        <div style={{ marginTop: '20px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>本次AI提取总热量</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '20px', fontWeight: '800', color: 'var(--color-calories)' }}>
              {totalCals} <span style={{ fontSize: '12px', fontWeight: '500' }}>kcal</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              取消
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1 }} 
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
