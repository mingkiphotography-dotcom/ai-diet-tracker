import React, { useState } from 'react';
import { Plus, Trash2, Search, X, Camera, Eye, Trash } from 'lucide-react';
import { calculateNutrients, compressImage } from '../utils/helpers';

const DietLog = ({ 
  todayLogs, 
  foodDatabase, 
  onLogFood, 
  onDeleteFood,
  mealPhotos,
  onSaveMealPhoto,
  onDeleteMealPhoto
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState('breakfast');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [customAmount, setCustomAmount] = useState('100');

  // Preview Image State
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Filter logs by meal slot
  const getSlotLogs = (slot) => todayLogs.filter(item => item.mealType === slot);
  
  const getSlotCalories = (slot) => {
    return getSlotLogs(slot).reduce((sum, item) => sum + (item.calories || 0), 0);
  };

  const handleOpenAddModal = (slot) => {
    setSelectedMealSlot(slot);
    setIsAddModalOpen(true);
    setSearchQuery('');
    setSelectedFood(null);
    setCustomAmount('100');
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setCustomAmount(String(food.defaultAmount || 100));
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    const amount = parseFloat(customAmount) || 0;
    if (amount <= 0) return;

    const nutrition = calculateNutrients(selectedFood, amount);
    onLogFood({
      name: selectedFood.name,
      amount: amount,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carb: nutrition.carb,
      fiber: nutrition.fiber,
      mealType: selectedMealSlot
    });

    setIsAddModalOpen(false);
  };

  const handlePhotoUpload = (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use local compression helper to reduce size to ~20-40kb before saving
    compressImage(file, (base64Str) => {
      onSaveMealPhoto(slot, base64Str);
    });
  };

  // Filtered food list for search
  const filteredFoods = foodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mealSlots = [
    { key: 'breakfast', label: '早餐' },
    { key: 'lunch', label: '午餐' },
    { key: 'dinner', label: '晚餐' },
    { key: 'snack', label: '加餐' }
  ];

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
        今日饮食日志
      </h3>

      {mealSlots.map(slot => {
        const logs = getSlotLogs(slot.key);
        const slotCals = getSlotCalories(slot.key);
        const slotPhoto = mealPhotos[slot.key];

        return (
          <div key={slot.key} className="glass-card" style={{ padding: '16px 18px' }}>
            {/* Slot Header */}
            <div className="meal-group-title" style={{ margin: 0, paddingBottom: '12px', borderBottom: '1px solid rgba(0, 0, 0, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700' }}>{slot.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                  {slotCals} kcal
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Photo upload input trigger */}
                {!slotPhoto ? (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-secondary)', margin: 0 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(slot.key, e)} 
                      style={{ display: 'none' }} 
                    />
                    <Camera size={18} className="action-icon-btn" style={{ padding: 0 }} />
                  </label>
                ) : null}
                
                <button 
                  className="action-icon-btn" 
                  style={{ color: 'var(--color-primary)', padding: 0 }}
                  onClick={() => handleOpenAddModal(slot.key)}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Render Meal Photo if exists */}
            {slotPhoto && (
              <div style={{ marginTop: '12px', position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '110px', width: '100%' }}>
                <img 
                  src={slotPhoto} 
                  alt={`${slot.label}打卡照`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {/* Overlay with buttons */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', padding: '8px', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="action-icon-btn" 
                    onClick={() => setPreviewImageUrl(slotPhoto)}
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    type="button" 
                    className="action-icon-btn" 
                    onClick={() => onDeleteMealPhoto(slot.key)}
                    style={{ background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(4px)', color: '#ff6b6b', border: '1px solid rgba(239,68,68,0.3)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Food items logs */}
            <div className="meal-items-list" style={{ marginTop: '12px' }}>
              {logs.map((item, index) => (
                <div key={item.id || index} className="meal-item-card">
                  <div className="meal-item-info">
                    <span className="meal-item-name">{item.name}</span>
                    <span className="meal-item-sub">
                      {item.amount}g/ml · 碳水{item.carb}g · 蛋白{item.protein}g · 脂肪{item.fat}g
                    </span>
                  </div>
                  <div className="meal-item-right">
                    <span className="meal-item-cals">{item.calories} kcal</span>
                    <button 
                      className="action-icon-btn" 
                      onClick={() => onDeleteFood(item)}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {logs.length === 0 && !slotPhoto && (
                <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  暂无记录，可拍照或点击加号添加食物
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 1. Manual Add Food Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '80vh' }}>
            <div className="modal-header">
              <h3 className="modal-title">添加食物 ({mealSlots.find(s => s.key === selectedMealSlot)?.label})</h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}><X size={18} /></button>
            </div>

            {!selectedFood ? (
              <div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入食物名称搜索..."
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    autoFocus
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '34px', color: 'var(--text-muted)' }} />
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                  {filteredFoods.map(food => (
                    <button
                      key={food.id}
                      type="button"
                      className="btn-secondary"
                      style={{ justifyContent: 'flex-start', padding: '12px', textAlign: 'left', border: '1px solid rgba(0,0,0,0.03)' }}
                      onClick={() => handleSelectFood(food)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{food.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            每100g: 碳水{food.carb}g · 蛋白{food.protein}g · 脂肪{food.fat}g
                          </div>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--color-calories)', fontWeight: 'bold' }}>
                          {food.calories} kcal
                        </span>
                      </div>
                    </button>
                  ))}

                  {filteredFoods.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      未找到对应食物，你可以使用主页的 AI 闪电记账进行自动估算
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '10px' }}>
                <div className="glass-card" style={{ padding: '16px', background: '#f8faf9', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedFood.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    每100g/ml基准: {selectedFood.calories} kcal · 碳水{selectedFood.carb}g · 蛋白{selectedFood.protein}g · 脂肪{selectedFood.fat}g
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">分量克数 (g) 或毫升 (ml)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="form-input"
                    placeholder="输入重量克数..."
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedFood(null)}>
                    返回搜索
                  </button>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmAdd}>
                    确认添加
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Photo Lightbox Modal */}
      {previewImageUrl && (
        <div className="modal-overlay" onClick={() => setPreviewImageUrl(null)}>
          <div 
            className="modal-content" 
            style={{ 
              background: 'transparent', 
              boxShadow: 'none', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingBottom: '20px' 
            }}
            onClick={(e) => e.stopPropagation()} // Stop propagation
          >
            <div style={{ alignSelf: 'flex-end', marginBottom: '10px' }}>
              <button 
                type="button" 
                className="close-btn" 
                onClick={() => setPreviewImageUrl(null)}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <X size={18} />
              </button>
            </div>
            <img 
              src={previewImageUrl} 
              alt="餐照大图预览" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', maxHeight: '70vh', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DietLog;
