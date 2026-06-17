import React, { useState, useEffect } from 'react';
import { 
  Flame, Utensils, Sparkles, Scale, User, 
  Check, Info, AlertCircle 
} from 'lucide-react';

// Subcomponents
import Dashboard from './components/Dashboard';
import DietLog from './components/DietLog';
import AiComposer from './components/AiComposer';
import WeightChart from './components/WeightChart';
import Settings from './components/Settings';
import AiLogModal from './components/AiLogModal';

// Utilities & Initial Data
import { 
  safeStorage, 
  safeJsonParse, 
  getTodayDateString, 
  generateId 
} from './utils/helpers';
import { 
  FOOD_DATABASE, 
  RECIPES, 
  INITIAL_WEIGHTS, 
  INITIAL_DIET_LOGS 
} from './constants/initialData';
import { queryGeminiForDiet } from './utils/aiService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 1. Local Storage Hydration
  const [apiKey, setApiKey] = useState(() => {
    return safeStorage.getItem('ai_diet_api_key') || '';
  });

  const [userProfile, setUserProfile] = useState(() => {
    const defaultProfile = {
      apiKey: '',
      targetCalories: 1500, // Updated target base
      targetProtein: 136,   // Updated target base
      targetFat: 45,        // Updated target base
      targetCarb: 140,      // Updated target base
      targetExercise: 300
    };
    const saved = safeJsonParse(safeStorage.getItem('ai_diet_profile'), defaultProfile);
    saved.apiKey = apiKey; // align key
    return saved;
  });

  const [customFoods, setCustomFoods] = useState(() => {
    return safeJsonParse(safeStorage.getItem('ai_diet_custom_foods'), []);
  });

  const [dietLogs, setDietLogs] = useState(() => {
    const saved = safeStorage.getItem('ai_diet_logs');
    return saved ? safeJsonParse(saved, {}) : INITIAL_DIET_LOGS;
  });

  const [weightLogs, setWeightLogs] = useState(() => {
    const saved = safeStorage.getItem('ai_diet_weights');
    return saved ? safeJsonParse(saved, []) : INITIAL_WEIGHTS;
  });

  // PWA Photo logging states
  const [mealPhotos, setMealPhotos] = useState(() => {
    return safeJsonParse(safeStorage.getItem('ai_diet_photos'), {});
  });

  // AI progress report diagnosis persistence
  const [diagnosisResult, setDiagnosisResult] = useState(() => {
    return safeJsonParse(safeStorage.getItem('ai_diet_diagnosis'), null);
  });

  // Today's context
  const todayStr = getTodayDateString();
  const todayLogs = dietLogs[todayStr] || [];
  const todayPhotos = mealPhotos[todayStr] || {};

  // Active Food Database (Built-in + Custom)
  const fullFoodDatabase = [...FOOD_DATABASE, ...customFoods];

  // AI Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiParsedResult, setAiParsedResult] = useState(null);

  // New weight input state
  const [weightInput, setWeightInput] = useState('');

  // 2. Local Storage Syncing
  useEffect(() => {
    safeStorage.setItem('ai_diet_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_custom_foods', JSON.stringify(customFoods));
  }, [customFoods]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_logs', JSON.stringify(dietLogs));
  }, [dietLogs]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_weights', JSON.stringify(weightLogs));
  }, [weightLogs]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_photos', JSON.stringify(mealPhotos));
  }, [mealPhotos]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_diagnosis', JSON.stringify(diagnosisResult));
  }, [diagnosisResult]);

  useEffect(() => {
    safeStorage.setItem('ai_diet_api_key', apiKey);
    setUserProfile(prev => ({ ...prev, apiKey: apiKey }));
  }, [apiKey]);

  // 3. Actions
  const handleLogFood = (foodItem) => {
    const logItem = {
      ...foodItem,
      id: generateId(),
      timestamp: Date.now()
    };
    
    setDietLogs(prev => {
      const todayLogs = prev[todayStr] || [];
      return {
        ...prev,
        [todayStr]: [...todayLogs, logItem]
      };
    });
  };

  const handleDeleteFood = (foodItem) => {
    setDietLogs(prev => {
      const todayLogs = prev[todayStr] || [];
      return {
        ...prev,
        [todayStr]: todayLogs.filter(item => item.id !== foodItem.id)
      };
    });
  };

  const handleAddCustomFood = (newFood) => {
    setCustomFoods(prev => [newFood, ...prev]);
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;

    setWeightLogs(prev => {
      const filtered = prev.filter(item => item.date !== todayStr);
      return [...filtered, { date: todayStr, weight: w }].sort((a,b) => new Date(a.date) - new Date(b.date));
    });

    setWeightInput('');
    alert('今日体重记录已更新！');
  };

  const handleSaveProfile = (newProfile) => {
    setApiKey(newProfile.apiKey);
    setUserProfile(newProfile);
  };

  const handleClearData = () => {
    safeStorage.setItem('ai_diet_api_key', '');
    safeStorage.setItem('ai_diet_profile', '');
    safeStorage.setItem('ai_diet_custom_foods', '');
    safeStorage.setItem('ai_diet_logs', '');
    safeStorage.setItem('ai_diet_weights', '');
    safeStorage.setItem('ai_diet_photos', '');
    safeStorage.setItem('ai_diet_diagnosis', '');
    
    setApiKey('');
    setUserProfile({
      apiKey: '',
      targetCalories: 1500,
      targetProtein: 136,
      targetFat: 45,
      targetCarb: 140,
      targetExercise: 300
    });
    setCustomFoods([]);
    setDietLogs({});
    setWeightLogs([]);
    setMealPhotos({});
    setDiagnosisResult(null);
    setActiveTab('dashboard');
    alert('本地数据已全部清空，恢复初始状态！');
  };

  // AI Handler
  const handleQueryAi = async (text, onSuccess) => {
    const result = await queryGeminiForDiet(text, apiKey, fullFoodDatabase);
    onSuccess(result);
  };

  const handleAiModalConfirm = (loggedItems) => {
    loggedItems.forEach(item => {
      handleLogFood(item);
    });
    setActiveTab('diary');
  };

  // PWA Photo Handlers
  const handleSaveMealPhoto = (mealType, base64Image) => {
    setMealPhotos(prev => {
      const dayPhotos = prev[todayStr] || {};
      return {
        ...prev,
        [todayStr]: {
          ...dayPhotos,
          [mealType]: base64Image
        }
      };
    });
  };

  const handleDeleteMealPhoto = (mealType) => {
    setMealPhotos(prev => {
      const dayPhotos = prev[todayStr] || {};
      const newDayPhotos = { ...dayPhotos };
      delete newDayPhotos[mealType];
      return {
        ...prev,
        [todayStr]: newDayPhotos
      };
    });
  };

  // Boohee Health Import Data Merger
  const handleImportHistoryData = (parsedData) => {
    // 1. Merge Weights (dates are unique)
    setWeightLogs(prev => {
      const weightMap = new Map(prev.map(item => [item.date, item.weight]));
      parsedData.weights.forEach(w => {
        weightMap.set(w.date, w.weight);
      });
      return Array.from(weightMap.entries())
        .map(([date, weight]) => ({ date, weight }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // 2. Merge Diet Logs (dates are keys in object)
    setDietLogs(prev => {
      const updatedLogs = { ...prev };
      
      // Group the parsed list of dietLogs by date
      const groupedImports = parsedData.dietLogs.reduce((acc, item) => {
        const { date, ...food } = item;
        const logFood = {
          ...food,
          id: generateId(),
          timestamp: Date.now()
        };
        if (!acc[date]) acc[date] = [];
        acc[date].push(logFood);
        return acc;
      }, {});

      // Merge grouped imports into existing logs
      Object.keys(groupedImports).forEach(date => {
        const existing = updatedLogs[date] || [];
        updatedLogs[date] = [...existing, ...groupedImports[date]];
      });

      return updatedLogs;
    });
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <Flame size={24} className="logo-icon" />
          <span className="logo-text">AI 减脂健康助手</span>
        </div>
        <div className="header-badge">
          <Sparkles size={12} />
          <span>H5 PWA App</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            todayLogs={todayLogs}
            userProfile={userProfile}
            onQueryAi={handleQueryAi}
            onAiSuccess={(data) => {
              setAiParsedResult(data);
              setIsAiModalOpen(true);
            }}
          />
        )}

        {activeTab === 'diary' && (
          <DietLog 
            todayLogs={todayLogs}
            foodDatabase={fullFoodDatabase}
            onLogFood={handleLogFood}
            onDeleteFood={handleDeleteFood}
            mealPhotos={todayPhotos}
            onSaveMealPhoto={handleSaveMealPhoto}
            onDeleteMealPhoto={handleDeleteMealPhoto}
          />
        )}

        {activeTab === 'composer' && (
          <AiComposer 
            foodDatabase={fullFoodDatabase}
            todayLogs={todayLogs}
            userProfile={userProfile}
            onLogFood={handleLogFood}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'weight' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
              体重管理中心
            </h3>

            <div className="glass-card">
              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>体重与减脂趋势</h4>
              <WeightChart 
                data={weightLogs} 
                dietLogs={dietLogs}
                userProfile={userProfile}
                diagnosisResult={diagnosisResult}
                setDiagnosisResult={setDiagnosisResult}
              />
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>添加今日体重记录</h4>
              <form onSubmit={handleWeightSubmit}>
                <div className="form-group">
                  <label className="form-label">当前体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="form-input"
                    placeholder="输入今日体重（如 74.5）..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">保存记录</button>
              </form>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>打卡历史</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {[...weightLogs].reverse().map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '13px', 
                      padding: '10px 14px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.04)' 
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>{item.date}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.weight} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <Settings 
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onAddCustomFood={handleAddCustomFood}
            onClearData={handleClearData}
            weightLogs={weightLogs}
            dietLogs={dietLogs}
            onImportHistoryData={handleImportHistoryData}
          />
        )}
      </main>

      {/* Sticky Bottom Tab Bar */}
      <nav className="nav-bar">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Flame size={20} />
          <span>主页</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          <Utensils size={20} />
          <span>日志</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'composer' ? 'active' : ''}`}
          onClick={() => setActiveTab('composer')}
        >
          <Sparkles size={20} />
          <span>配餐</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveTab('weight')}
        >
          <Scale size={20} />
          <span>体重</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <User size={20} />
          <span>设置</span>
        </button>
      </nav>

      {/* AI Log Preview Modal */}
      <AiLogModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiData={aiParsedResult}
        onConfirm={handleAiModalConfirm}
      />
    </div>
  );
}

export default App;
