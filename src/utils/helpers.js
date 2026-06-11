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
  // Returns 'YYYY-MM-DD' in local time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
