// 1. 复制以下整段代码
const importedData = {"weights": [{"date": "2026-05-31", "weight": 78.32}, {"date": "2026-06-01", "weight": 78.05}, {"date": "2026-06-02", "weight": 78.05}, {"date": "2026-06-03", "weight": 78.6}, {"date": "2026-06-05", "weight": 78.05}, {"date": "2026-06-06", "weight": 76.97}, {"date": "2026-06-07", "weight": 77.25}, {"date": "2026-06-08", "weight": 77.25}, {"date": "2026-06-09", "weight": 76.85}, {"date": "2026-06-10", "weight": 76.85}, {"date": "2026-06-11", "weight": 77.38}, {"date": "2026-06-12", "weight": 76.9}, {"date": "2026-06-13", "weight": 76.9}, {"date": "2026-06-14", "weight": 76.45}, {"date": "2026-06-15", "weight": 77.2}, {"date": "2026-06-16", "weight": 77.2}, {"date": "2026-06-17", "weight": 77.2}, {"date": "2026-06-18", "weight": 77.2}, {"date": "2026-06-19", "weight": 76.9}, {"date": "2026-06-20", "weight": 76.9}], "sleep": {"2026-05-30": 5.81, "2026-05-31": 4.35, "2026-06-01": 4.34, "2026-06-02": 5.75, "2026-06-03": 4.93, "2026-06-04": 2.73, "2026-06-05": 0.1, "2026-06-06": 5.87, "2026-06-07": 5.93, "2026-06-08": 7.19, "2026-06-09": 4.3, "2026-06-10": 7.07, "2026-06-11": 7.84, "2026-06-12": 7.72, "2026-06-13": 6.57, "2026-06-14": 6.98, "2026-06-15": 7.64, "2026-06-16": 8.57, "2026-06-17": 7.06, "2026-06-18": 5.66, "2026-06-19": 7.29, "2026-06-20": 6.89}, "burned": {"2026-05-30": 852, "2026-05-31": 365, "2026-06-01": 566, "2026-06-02": 287, "2026-06-03": 561, "2026-06-04": 316, "2026-06-05": 213, "2026-06-06": 848, "2026-06-07": 911, "2026-06-08": 518, "2026-06-09": 455, "2026-06-10": 594, "2026-06-11": 567, "2026-06-12": 514, "2026-06-13": 1058, "2026-06-14": 654, "2026-06-15": 442, "2026-06-16": 211, "2026-06-17": 491, "2026-06-18": 750, "2026-06-19": 540, "2026-06-20": 868}, "dietLogs": {"2026-06-11": [{"name": "健康数据导入", "amount": 100, "calories": 300, "carb": 116.6, "protein": 140.9, "fat": 47.1, "fiber": 0.0, "mealType": "lunch"}], "2026-06-10": [{"name": "健康数据导入", "amount": 100, "calories": 93, "carb": 137.7, "protein": 117.3, "fat": 80.3, "fiber": 0.0, "mealType": "lunch"}], "2026-06-09": [{"name": "健康数据导入", "amount": 100, "calories": 444, "carb": 136.3, "protein": 110.1, "fat": 54.0, "fiber": 0.0, "mealType": "lunch"}], "2026-06-13": [{"name": "健康数据导入", "amount": 100, "calories": 524, "carb": 166.4, "protein": 127.4, "fat": 53.0, "fiber": 0.0, "mealType": "lunch"}], "2026-06-14": [{"name": "健康数据导入", "amount": 100, "calories": 262, "carb": 204.6, "protein": 125.0, "fat": 80.7, "fiber": 0.0, "mealType": "lunch"}], "2026-06-15": [{"name": "健康数据导入", "amount": 100, "calories": 467, "carb": 142.9, "protein": 145.8, "fat": 44.9, "fiber": 0.0, "mealType": "lunch"}], "2026-06-16": [{"name": "健康数据导入", "amount": 100, "calories": 529, "carb": 142.9, "protein": 137.5, "fat": 48.9, "fiber": 0.0, "mealType": "lunch"}], "2026-05-30": [{"name": "健康数据导入", "amount": 100, "calories": 105, "carb": 120.7, "protein": 135.3, "fat": 59.5, "fiber": 0.0, "mealType": "lunch"}], "2026-05-31": [{"name": "健康数据导入", "amount": 100, "calories": 87, "carb": 149.2, "protein": 101.4, "fat": 31.1, "fiber": 0.0, "mealType": "lunch"}], "2026-06-01": [{"name": "健康数据导入", "amount": 100, "calories": 3, "carb": 132.1, "protein": 55.0, "fat": 51.1, "fiber": 0.0, "mealType": "lunch"}], "2026-06-02": [{"name": "健康数据导入", "amount": 100, "calories": 82, "carb": 183.5, "protein": 79.4, "fat": 45.8, "fiber": 0.0, "mealType": "lunch"}], "2026-06-03": [{"name": "健康数据导入", "amount": 100, "calories": 498, "carb": 124.7, "protein": 128.7, "fat": 59.3, "fiber": 0.0, "mealType": "lunch"}], "2026-06-04": [{"name": "健康数据导入", "amount": 100, "calories": 526, "carb": 201.9, "protein": 110.3, "fat": 63.8, "fiber": 0.0, "mealType": "lunch"}], "2026-06-05": [{"name": "健康数据导入", "amount": 100, "calories": 500, "carb": 88.6, "protein": 129.8, "fat": 44.0, "fiber": 0.0, "mealType": "lunch"}], "2026-06-06": [{"name": "健康数据导入", "amount": 100, "calories": 35, "carb": 136.2, "protein": 158.0, "fat": 43.6, "fiber": 0.0, "mealType": "lunch"}], "2026-06-07": [{"name": "健康数据导入", "amount": 100, "calories": 302, "carb": 137.8, "protein": 111.4, "fat": 65.1, "fiber": 0.0, "mealType": "lunch"}], "2026-06-08": [{"name": "健康数据导入", "amount": 100, "calories": 380, "carb": 104.5, "protein": 128.3, "fat": 35.6, "fiber": 0.0, "mealType": "lunch"}], "2026-06-12": [{"name": "健康数据导入", "amount": 100, "calories": 500, "carb": 115.0, "protein": 132.8, "fat": 40.9, "fiber": 0.0, "mealType": "lunch"}], "2026-06-17": [{"name": "健康数据导入", "amount": 100, "calories": 680, "carb": 151.2, "protein": 151.4, "fat": 63.0, "fiber": 0.0, "mealType": "lunch"}], "2026-06-18": [{"name": "健康数据导入", "amount": 100, "calories": 500, "carb": 138.2, "protein": 138.8, "fat": 43.5, "fiber": 0.0, "mealType": "lunch"}], "2026-06-20": [{"name": "健康数据导入", "amount": 100, "calories": 408, "carb": 79.2, "protein": 51.8, "fat": 41.8, "fiber": 0.0, "mealType": "lunch"}], "2026-06-19": [{"name": "健康数据导入", "amount": 100, "calories": 750, "carb": 127.2, "protein": 69.3, "fat": 56.5, "fiber": 0.0, "mealType": "lunch"}]}};

console.log("开始合并导入您的健康历史数据...");

// --- 合并体重记录 ---
const weights = JSON.parse(localStorage.getItem('ai_diet_weights') || '[]');
const weightMap = new Map(weights.map(w => [w.date, w.weight]));
importedData.weights.forEach(w => {
    if (w && w.date && w.weight > 0) {
        weightMap.set(w.date, w.weight);
    }
});
const finalWeights = Array.from(weightMap.entries())
    .map(([date, weight]) => ({ date, weight }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
localStorage.setItem('ai_diet_weights', JSON.stringify(finalWeights));
console.log(`✓ 成功合并体重记录，共 ${finalWeights.length} 条。`);

// --- 合并睡眠时长 ---
const sleep = JSON.parse(localStorage.getItem('ai_diet_sleep') || '{}');
Object.assign(sleep, importedData.sleep);
localStorage.setItem('ai_diet_sleep', JSON.stringify(sleep));
console.log(`✓ 成功合并睡眠记录，共 ${Object.keys(sleep).length} 条。`);

// --- 合并运动消耗 ---
const burned = JSON.parse(localStorage.getItem('ai_diet_burned') || '{}');
Object.assign(burned, importedData.burned);
localStorage.setItem('ai_diet_burned', JSON.stringify(burned));
console.log(`✓ 成功合并运动消耗记录，共 ${Object.keys(burned).length} 条。`);

// --- 合并饮食日志 ---
const dietLogs = JSON.parse(localStorage.getItem('ai_diet_logs') || '{}');
let totalDietLogsMerged = 0;
Object.keys(importedData.dietLogs).forEach(date => {
    const existing = dietLogs[date] || [];
    // 过滤避免重复导入相同的一键导入数据
    const hasImported = existing.some(item => item.name === '健康数据导入');
    if (!hasImported) {
        const imports = importedData.dietLogs[date].map(item => ({
            ...item,
            id: 'imported_' + Math.random().toString(36).substring(2, 9),
            timestamp: Date.now()
        }));
        dietLogs[date] = [...existing, ...imports];
        totalDietLogsMerged += imports.length;
    }
});
localStorage.setItem('ai_diet_logs', JSON.stringify(dietLogs));
console.log(`✓ 成功合并饮食日志，本次新导入 ${totalDietLogsMerged} 天的数据。`);

alert("🎉 恭喜！您所有的历史健康数据（体重、睡眠、健身运动消耗、饮食日记）已成功安全导入合并！\n请刷新网页查看变化！");
