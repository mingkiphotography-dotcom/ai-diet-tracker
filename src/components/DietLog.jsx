import React, { useState } from 'react';
import { Plus, Trash2, Search, X, Camera, Eye, ChevronLeft, ChevronRight, Sparkles, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { calculateNutrients, compressImage, getTodayDateString } from '../utils/helpers';

const DietLog = ({ 
  dietLogs, 
  weightLogs,
  mealPhotos,
  burnedLogs,
  sleepLogs,
  foodDatabase, 
  userProfile,
  onLogFood, 
  onDeleteFood,
  onSaveMealPhoto,
  onDeleteMealPhoto,
  onSaveWeight,
  onDeleteWeight,
  onSaveBurned,
  onDeleteBurned,
  onSaveSleep,
  onDeleteSleep,
  onQueryAi,
  onAiSuccess,
  selectedDate,
  setSelectedDate
}) => {
  const todayStr = getTodayDateString();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState('breakfast');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [customAmount, setCustomAmount] = useState('100');

  // Preview Image State
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // Weight entry state for this date
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [localWeightInput, setLocalWeightInput] = useState('');

  // Burned entry state for this date
  const [isEditingBurned, setIsEditingBurned] = useState(false);
  const [localBurnedInput, setLocalBurnedInput] = useState('');

  // Sleep entry state for this date
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [localSleepInput, setLocalSleepInput] = useState('');

  // AI Flash Log state
  const [inputText, setInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErrorMsg, setAiErrorMsg] = useState('');

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setAiLoading(true);
    setAiErrorMsg('');
    try {
      await onQueryAi(inputText, (data) => {
        onAiSuccess(data, selectedDate);
        setInputText('');
      });
    } catch (err) {
      setAiErrorMsg(err.message || 'AI 智能解析失败，请检查网络或配置');
    } finally {
      setAiLoading(false);
    }
  };

  // Get date specific data
  const dateLogs = dietLogs[selectedDate] || [];
  const datePhotos = mealPhotos[selectedDate] || {};
  const dateWeight = weightLogs.find(w => w.date === selectedDate)?.weight;
  const dateBurned = burnedLogs[selectedDate];
  const dateSleep = sleepLogs[selectedDate];

  // Filter logs by meal slot
  const getSlotLogs = (slot) => dateLogs.filter(item => item.mealType === slot);
  
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
    }, selectedDate);

    setIsAddModalOpen(false);
  };

  const handlePhotoUpload = (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use local compression helper to reduce size before saving
    compressImage(file, (base64Str) => {
      onSaveMealPhoto(slot, base64Str, selectedDate);
    });
  };

  const handleWeightSaveClick = () => {
    const w = parseFloat(localWeightInput);
    if (!w || w <= 0) return;
    onSaveWeight(selectedDate, w);
    setIsEditingWeight(false);
    setLocalWeightInput('');
  };

  const handleWeightDeleteClick = () => {
    if (window.confirm(`确认删除 ${selectedDate} 的体重记录吗？`)) {
      onDeleteWeight(selectedDate);
    }
  };

  const handleBurnedSaveClick = () => {
    const val = parseFloat(localBurnedInput);
    if (isNaN(val) || val < 0) return;
    onSaveBurned(selectedDate, val);
    setIsEditingBurned(false);
    setLocalBurnedInput('');
  };

  const handleBurnedDeleteClick = () => {
    if (window.confirm(`确认删除 ${selectedDate} 的运动消耗记录吗？`)) {
      onDeleteBurned(selectedDate);
    }
  };

  const handleSleepSaveClick = () => {
    const val = parseFloat(localSleepInput);
    if (isNaN(val) || val < 0) return;
    onSaveSleep(selectedDate, val);
    setIsEditingSleep(false);
    setLocalSleepInput('');
  };

  const handleSleepDeleteClick = () => {
    if (window.confirm(`确认删除 ${selectedDate} 的睡眠时长记录吗？`)) {
      onDeleteSleep(selectedDate);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setIsEditingWeight(false);
    setIsEditingBurned(false);
    setIsEditingSleep(false);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    setIsEditingWeight(false);
    setIsEditingBurned(false);
    setIsEditingSleep(false);
  };

  // Filtered food list for search
  const filteredFoods = foodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Nutrition Stats Calculations
  const eatenStats = dateLogs.reduce((acc, item) => {
    acc.calories += item.calories || 0;
    acc.protein += item.protein || 0;
    acc.fat += item.fat || 0;
    acc.carb += item.carb || 0;
    return acc;
  }, { calories: 0, protein: 0, fat: 0, carb: 0 });

  const targetCals = userProfile.targetCalories || 1500;
  const targetProtein = userProfile.targetProtein || 136;
  const targetFat = userProfile.targetFat || 45;
  const targetCarb = userProfile.targetCarb || 140;

  // Macro Energy Ratios (1g Carb=4kcal, 1g Protein=4kcal, 1g Fat=9kcal)
  const carbCal = eatenStats.carb * 4;
  const proteinCal = eatenStats.protein * 4;
  const fatCal = eatenStats.fat * 9;
  const totalMacroCal = carbCal + proteinCal + fatCal;

  const carbRatio = totalMacroCal > 0 ? Math.round((carbCal / totalMacroCal) * 100) : 0;
  const proteinRatio = totalMacroCal > 0 ? Math.round((proteinCal / totalMacroCal) * 100) : 0;
  const fatRatio = totalMacroCal > 0 ? Math.round((fatCal / totalMacroCal) * 100) : 0;

  // Gram Ratios
  const totalMacroGrams = eatenStats.carb + eatenStats.protein + eatenStats.fat;
  const carbGramRatio = totalMacroGrams > 0 ? Math.round((eatenStats.carb / totalMacroGrams) * 100) : 0;
  const proteinGramRatio = totalMacroGrams > 0 ? Math.round((eatenStats.protein / totalMacroGrams) * 100) : 0;
  const fatGramRatio = totalMacroGrams > 0 ? Math.round((eatenStats.fat / totalMacroGrams) * 100) : 0;

  const mealSlots = [
    { key: 'breakfast', label: '早餐' },
    { key: 'lunch', label: '午餐' },
    { key: 'dinner', label: '晚餐' },
    { key: 'snack', label: '加餐' }
  ];

  return (
    <div>
      {/* Date Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
        <button 
          className="btn-secondary" 
          style={{ padding: '8px 10px', minWidth: 'unset', display: 'flex', alignItems: 'center', margin: 0 }} 
          onClick={handlePrevDay}
        >
          <ChevronLeft size={16} />
        </button>
        
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setIsEditingWeight(false);
          }} 
          style={{ 
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)', 
            borderRadius: '10px', 
            padding: '8px 12px', 
            color: 'var(--text-primary)', 
            fontSize: '14px',
            textAlign: 'center',
            fontFamily: 'inherit',
            fontWeight: '600',
            outline: 'none',
            flex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }} 
        />
        
        <button 
          className="btn-secondary" 
          style={{ padding: '8px 10px', minWidth: 'unset', display: 'flex', alignItems: 'center', margin: 0 }} 
          onClick={handleNextDay}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {selectedDate !== todayStr && (
        <button 
          className="btn-secondary" 
          style={{ fontSize: '11px', padding: '4px 8px', minWidth: 'unset', width: '100%', marginBottom: '12px', borderRadius: '6px' }}
          onClick={() => {
            setSelectedDate(todayStr);
            setIsEditingWeight(false);
          }}
        >
          返回今天
        </button>
      )}

      {/* 3-Column Daily Health Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {/* 1. Weight Item */}
        <div className="glass-card" style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px', margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>⚖️ 体重</span>
          {isEditingWeight ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <input 
                type="number" 
                step="0.1" 
                value={localWeightInput} 
                onChange={(e) => setLocalWeightInput(e.target.value)} 
                placeholder="kg"
                style={{ width: '100%', padding: '4px', border: '1px solid var(--color-primary)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'center', outline: 'none' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button className="btn-primary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={handleWeightSaveClick}>存</button>
                <button className="btn-secondary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={() => setIsEditingWeight(false)}>x</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: dateWeight ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {dateWeight ? `${dateWeight} kg` : '未录入'}
              </div>
              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {dateWeight ? (
                  <button 
                    onClick={handleWeightDeleteClick}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '9px', padding: 0 }}
                  >
                    删除
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsEditingWeight(true);
                      setLocalWeightInput('');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '9px', fontWeight: 'bold', padding: 0 }}
                  >
                    + 录入
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Active Burn Item */}
        <div className="glass-card" style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px', margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>🔥 运动消耗</span>
          {isEditingBurned ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <input 
                type="number" 
                value={localBurnedInput} 
                onChange={(e) => setLocalBurnedInput(e.target.value)} 
                placeholder="kcal"
                style={{ width: '100%', padding: '4px', border: '1px solid var(--color-primary)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'center', outline: 'none' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button className="btn-primary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={handleBurnedSaveClick}>存</button>
                <button className="btn-secondary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={() => setIsEditingBurned(false)}>x</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: dateBurned !== undefined ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {dateBurned !== undefined ? `${dateBurned} kcal` : '未录入'}
              </div>
              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {dateBurned !== undefined ? (
                  <button 
                    onClick={handleBurnedDeleteClick}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '9px', padding: 0 }}
                  >
                    删除
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsEditingBurned(true);
                      setLocalBurnedInput('');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '9px', fontWeight: 'bold', padding: 0 }}
                  >
                    + 录入
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Sleep Item */}
        <div className="glass-card" style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80px', margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>😴 睡眠时长</span>
          {isEditingSleep ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <input 
                type="number" 
                step="0.1"
                value={localSleepInput} 
                onChange={(e) => setLocalSleepInput(e.target.value)} 
                placeholder="小时"
                style={{ width: '100%', padding: '4px', border: '1px solid var(--color-primary)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '11px', textAlign: 'center', outline: 'none' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button className="btn-primary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={handleSleepSaveClick}>存</button>
                <button className="btn-secondary" style={{ padding: '2px 4px', minWidth: 'unset', fontSize: '9px', flex: 1, margin: 0 }} onClick={() => setIsEditingSleep(false)}>x</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: dateSleep !== undefined ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {dateSleep !== undefined ? `${dateSleep} 小时` : '未录入'}
              </div>
              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {dateSleep !== undefined ? (
                  <button 
                    onClick={handleSleepDeleteClick}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '9px', padding: 0 }}
                  >
                    删除
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsEditingSleep(true);
                      setLocalSleepInput('');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '9px', fontWeight: 'bold', padding: 0 }}
                  >
                    + 录入
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Nutrition Summary Card */}
      <div className="glass-card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📊 营养摄入概览</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: eatenStats.calories > targetCals ? '#ef4444' : 'var(--text-secondary)' }}>
            热量: {eatenStats.calories} / {targetCals} kcal
          </span>
        </div>
        
        {/* Progress Bar for Calories */}
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (eatenStats.calories / targetCals) * 100)}%`, background: eatenStats.calories > targetCals ? '#ef4444' : 'var(--color-primary)', borderRadius: '3px' }}></div>
        </div>

        {/* Macros Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '12px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>碳水</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{Math.round(eatenStats.carb)}g / {targetCarb}g</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>蛋白</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{Math.round(eatenStats.protein)}g / {targetProtein}g</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>脂肪</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{Math.round(eatenStats.fat)}g / {targetFat}g</div>
          </div>
        </div>

        {/* Macro Energy / Gram Ratios (碳氮比) */}
        <div style={{ marginTop: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🔥 热量占比 (碳水:蛋白:脂肪):</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {carbRatio}% : {proteinRatio}% : {fatRatio}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>⚖️ 克数占比 (碳水:蛋白:脂肪):</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {carbGramRatio}% : {proteinGramRatio}% : {fatGramRatio}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Magic Box for the selected date */}
      <div className="glass-card ai-magic-box" style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <div className="ai-magic-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Sparkles size={18} style={{ color: '#c084fc' }} />
          <span style={{ color: 'var(--text-primary)' }}>AI 闪电智能记账 ({selectedDate === todayStr ? '今天' : selectedDate})</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          支持口语化输入，AI 自动拆分克数和卡路里，并将记录写入当前选中的日期。
        </p>

        <form onSubmit={handleAiSubmit} className="ai-input-wrapper" style={{ marginTop: '12px' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`输入当前日期所吃的食物，例如：\n“早上吃了两个煮鸡蛋，午餐吃了150克生鸡胸肉加一盘西蓝花”`}
            className="ai-textarea"
            disabled={aiLoading}
          />
          <button 
            type="submit" 
            className="ai-submit-btn" 
            disabled={aiLoading || !inputText.trim()}
          >
            {aiLoading ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
          </button>
        </form>

        {aiLoading && (
          <div className="ai-loading-state" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-primary)', marginTop: '8px' }}>
            <Loader2 size={14} className="spin" />
            <span>AI 正在匹配食物库并计算热量...</span>
          </div>
        )}

        {aiErrorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '11px', marginTop: '10px', background: 'rgba(239, 68, 68, 0.06)', padding: '8px 12px', borderRadius: '8px' }}>
            <AlertCircle size={14} />
            <span>{aiErrorMsg}</span>
          </div>
        )}
      </div>

      <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>
        {selectedDate === todayStr ? '今日饮食日志' : `${selectedDate} 饮食日志`}
      </h3>

      {mealSlots.map(slot => {
        const logs = getSlotLogs(slot.key);
        const slotCals = getSlotCalories(slot.key);
        const slotPhoto = datePhotos[slot.key];

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
                    onClick={() => onDeleteMealPhoto(slot.key, selectedDate)}
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
                      onClick={() => onDeleteFood(item, selectedDate)}
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
                <div className="glass-card" style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' }}>{selectedFood.name}</div>
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
            onClick={(e) => e.stopPropagation()}
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
