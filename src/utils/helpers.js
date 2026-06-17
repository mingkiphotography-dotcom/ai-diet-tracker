export const safeStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
};

export const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str) ?? fallback;
  } catch (error) {
    console.warn(`JSON 解析发生异常，采用降级数据。Error: ${error.message}`);
    return fallback;
  }
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const cleanJsonString = (rawText) => {
  if (!rawText) return "";
  let clean = rawText.trim();
  // Remove markdown code block quotes
  const match = clean.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : clean;
};

export const calculateNutrients = (food, amount) => {
  if (!food) return { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0 };
  const ratio = amount / 100;
  return {
    calories: Math.round(food.calories * ratio),
    protein: Number((food.protein * ratio).toFixed(1)),
    fat: Number((food.fat * ratio).toFixed(1)),
    carb: Number((food.carb * ratio).toFixed(1)),
    fiber: Number((food.fiber * ratio).toFixed(1)),
  };
};

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// New: Client-side Image Compression Helper
export const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max_size = 400; // Limit dimensions to 400px
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Export as compressed JPEG (70% quality)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedDataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// New: Export diet and weight data to CSV (UTF-8 BOM to prevent Excel garbled text)
export const exportToCsv = (dietLogs, weightLogs, userProfile) => {
  // 1. Gather all dates from diet logs and weight logs
  const dietDates = Object.keys(dietLogs);
  const weightDates = weightLogs.map(w => w.date);
  const allDatesSet = new Set([...dietDates, ...weightDates]);
  const sortedDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

  // 2. Prepare headers
  const headers = ['日期', '当前体重(kg)', '今日热量上限(kcal)', '今日总摄入(kcal)', '碳水化合物(g)', '蛋白质(g)', '脂肪(g)', '膳食明细'];
  let csvRows = [headers.join(',')];

  // 3. Populate rows
  sortedDates.forEach(date => {
    // Find weight for the day
    const wRecord = weightLogs.find(w => w.date === date);
    const weightVal = wRecord ? wRecord.weight : '';

    // Calculate daily diet totals
    const dayFoods = dietLogs[date] || [];
    const totals = dayFoods.reduce((acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.fat += item.fat || 0;
      acc.carb += item.carb || 0;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carb: 0 });

    // Format meal descriptions
    const mealText = dayFoods.map(item => {
      const slotName = item.mealType === 'breakfast' ? '早餐' :
                       item.mealType === 'lunch' ? '午餐' :
                       item.mealType === 'dinner' ? '晚餐' : '加餐';
      return `[${slotName}]${item.name}(${item.amount}g/ml:${item.calories}kcal)`;
    }).join('; ');

    // Safely wrap fields containing commas or quotes
    const escapeCsv = (str) => {
      if (!str) return '';
      let clean = String(str).replace(/"/g, '""');
      if (clean.includes(',') || clean.includes('\n') || clean.includes('"')) {
        return `"${clean}"`;
      }
      return clean;
    };

    const row = [
      date,
      weightVal,
      userProfile.targetCalories || 1500,
      totals.calories,
      totals.carb.toFixed(1),
      totals.protein.toFixed(1),
      totals.fat.toFixed(1),
      escapeCsv(mealText)
    ];

    csvRows.push(row.join(','));
  });

  // 4. Create and trigger download
  const csvContent = '\uFEFF' + csvRows.join('\n'); // Prepend UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = `AI减脂数据导出_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
