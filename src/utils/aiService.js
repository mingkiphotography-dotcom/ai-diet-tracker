import { cleanJsonString, safeJsonParse } from './helpers';

// 1. Existing Diet Query API
export const queryGeminiForDiet = async (inputText, apiKey, foodDatabase) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 Gemini API Key');
  }

  const foodDbList = foodDatabase.map(f => 
    `${f.name} (每100g: 热量 ${f.calories}kcal, 蛋白质 ${f.protein}g, 脂肪 ${f.fat}g, 碳水 ${f.carb}g, 纤维 ${f.fiber}g)`
  ).join('\n');

  const systemPrompt = `你是一个专业的营养学专家。你的任务是分析用户输入的饮食描述，提取出其中的食物项、各自克数，并计算热量（卡路里）和营养成分。

请按照以下规则处理：
1. 分析用户吃的内容和估算的量（如果用户没说分量，你根据常识给出一个合理的估算，比如一个鸡蛋估算为50g，一碗饭估算为150g，一杯牛奶估算为250ml）。
2. 在计算营养参数时，优先匹配内置的常见食物数据库（下面会给出列表）。如果匹配成功，请按照数据库的 100g 比例，乘以上面估算的克数来计算热量及营养成分。
3. 如果在内置食物库中找不到对应的食物，请利用你的营养学常识，给出一个合理公允的估算值，并将 'isEstimated' 标记为 true。
4. 重要规则：【绝对优先使用用户提供的数据】。如果用户输入中明确写明了某项食物的热量卡路里（卡）、克数、或者营养比例（例如：“煮鸡蛋 149 卡”、“自制沙拉 250卡”），你提取时【必须直接使用用户写明的数据】，绝对不能被数据库里的默认值覆盖或重新推算。例如，用户输入“煮鸡蛋 149 卡”，该项食物的 calories 属性必须直接填为 149，不要强行修改为默认的单蛋热量，你只需给出一个符合该卡路里的合理估算重量即可。这种直接采用用户提供的数据的项，其 isEstimated 应标记为 false。
5. 返回的结果必须是一个标准的 JSON 对象，且符合指定的 JSON Schema 格式。

内置食物数据库列表：
${foodDbList}

不要输出任何 markdown 格式的标记，直接返回 JSON 纯文本。`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: `用户输入的饮食内容: "${inputText}"` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          items: {
            type: "ARRAY",
            description: "提取出的食物明细列表",
            items: {
              type: "OBJECT",
              properties: {
                foodName: { type: "STRING", description: "食物中文名称" },
                amount: { type: "NUMBER", description: "估算重量/容量 (单位: g或ml)" },
                calories: { type: "NUMBER", description: "该重量下的总热量 (kcal)" },
                protein: { type: "NUMBER", description: "该重量下的蛋白质含量 (g)" },
                fat: { type: "NUMBER", description: "该重量下的脂肪含量 (g)" },
                carb: { type: "NUMBER", description: "该重量下的碳水化合物含量 (g)" },
                fiber: { type: "NUMBER", description: "该重量下的膳食纤维含量 (g)" },
                isEstimated: { type: "BOOLEAN", description: "是否为 AI 凭借经验估算（若匹配内置数据库则为 false）" }
              },
              required: ["foodName", "amount", "calories", "protein", "fat", "carb", "fiber", "isEstimated"]
            }
          },
          totalCalories: { type: "NUMBER", description: "本次饮食的总热量 (kcal)" },
          dietSummary: { type: "STRING", description: "简短一句话的膳食结构点评与建议" }
        },
        required: ["items", "totalCalories", "dietSummary"]
      }
    }
  };

  return callGeminiAPI(apiKey, requestBody);
};

// 2. New: Import History from Text API (薄荷健康一键导入)
export const importHistoryFromText = async (rawText, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 Gemini API Key');
  }

  const systemPrompt = `你是一个减脂数据迁移助手。用户的输入是他们从别的饮食软件（如薄荷健康）中复制的历史记录文本，或者是口语化的减肥日志。
你的任务是将这些凌乱的文本进行结构化提取，分析出每天的：
1. 体重记录 (kg)
2. 饮食记录（食物名称、克数/分量、卡路里、碳水、蛋白质、脂肪）

规则说明：
1. 日期格式必须统一为 'YYYY-MM-DD'（如果原始文本只有月日如'6月1日'，假设年份为当前年份2026年，如 '2026-06-01'）。
2. 食物分量：如果文本提到了具体的食物但没有写热量和克数，请根据常识做出合理的估算（例如，一碗米饭估算为150g/180kcal，一个苹果估算为150g/80kcal，煎鸡蛋估算为50g/80kcal）。
3. 尽量从乱序文本中把日期对齐。每天的饮食需归类为 breakfast (早餐), lunch (午餐), dinner (晚餐), snack (加餐) 之一。若文本没说明餐段，默认分类为 lunch 或 dinner。
4. 返回标准的 JSON 格式。`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: `历史记录文本内容:\n"${rawText}"` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          weights: {
            type: "ARRAY",
            description: "提取出的体重打卡历史记录",
            items: {
              type: "OBJECT",
              properties: {
                date: { type: "STRING", description: "日期，格式为 YYYY-MM-DD" },
                weight: { type: "NUMBER", description: "体重数值 (单位: kg)" }
              },
              required: ["date", "weight"]
            }
          },
          dietLogs: {
            type: "ARRAY",
            description: "提取出的历史饮食日志列表",
            items: {
              type: "OBJECT",
              properties: {
                date: { type: "STRING", description: "该记录的日期，格式为 YYYY-MM-DD" },
                name: { type: "STRING", description: "食物中文名" },
                amount: { type: "NUMBER", description: "食物分量 (g或ml)" },
                calories: { type: "NUMBER", description: "热量 (kcal)" },
                protein: { type: "NUMBER", description: "蛋白质 (g)" },
                fat: { type: "NUMBER", description: "脂肪 (g)" },
                carb: { type: "NUMBER", description: "碳水化合物 (g)" },
                fiber: { type: "NUMBER", description: "膳食纤维 (g)" },
                mealType: { type: "STRING", description: "餐段类型：'breakfast', 'lunch', 'dinner', 'snack'" }
              },
              required: ["date", "name", "amount", "calories", "protein", "fat", "carb", "fiber", "mealType"]
            }
          }
        },
        required: ["weights", "dietLogs"]
      }
    }
  };

  return callGeminiAPI(apiKey, requestBody);
};

// 3. New: AI Smart Meal Composer API (自动食材搭配)
export const generateSmartMeal = async (selectedFoods, remainingMacros, cookingMethod, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 Gemini API Key');
  }

  const foodList = selectedFoods.map(f => 
    `${f.name} (每100g: 热量 ${f.calories}kcal, 蛋白质 ${f.protein}g, 脂肪 ${f.fat}g, 碳水 ${f.carb}g, 纤维 ${f.fiber}g)`
  ).join('\n');

  const methodInstruction = cookingMethod === 'any' 
    ? '不限，可以混合使用微波炉、空气炸锅、煎、煮、烤等最省时健康的制作方式。'
    : `主要使用指定的烹饪工具/方式：【${cookingMethod}】进行制作。所有的烹饪步骤和做法说明必须是适配该烹饪工具的（例如：若是微波炉，则应使用微波容器加热、加盖高火叮几分钟等步骤；若是空气炸锅，则应说明铺纸锡纸、设定烘烤温度和具体时间等步骤）。`;

  const systemPrompt = `你是一个减脂期AI智能配餐顾问。
用户今天接下来这一餐（或这一天）需要补充的目标缺口营养素为：
- 剩余碳水：${remainingMacros.carb} 克
- 剩余蛋白质：${remainingMacros.protein} 克
- 剩余脂肪：${remainingMacros.fat} 克
- 剩余卡路里限制：${remainingMacros.calories} kcal

用户挑选的备选食材列表如下：
${foodList}

任务目标：
1. 仅限使用用户给出的备选食材。自动调整并计算出每种所选食材的精准克数（amount，单位g），使得这顿饭的总碳水、总蛋白质、总脂肪极其接近用户的剩余缺口。
2. 必须保证所有食材的克数为正数，单种食物克数一般在 10g 到 300g 之间，且重量要符合正常烹饪习惯（如鸡蛋一般按50g的倍数，肉类按20g/50g倍数等）。
3. 绝对不能超过用户的剩余卡路里上限。
4. 给这顿搭配出的减脂餐起一个美味的名字。
5. 给出这顿饭的具体“烹饪步骤”和“控油控钠调味建议”。${methodInstruction}调味必须写清楚具体放几克盐、多少毫升低钠酱油、黑胡椒等，强调少油少盐防长水肿。
6. 返回标准的 JSON 格式。`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: `请进行智能配餐并生成烹饪步骤与调味建议。` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          recipeName: { type: "STRING", description: "搭配出的减脂餐菜品名称" },
          ingredients: {
            type: "ARRAY",
            description: "计算出的各项食材克数明细",
            items: {
              type: "OBJECT",
              properties: {
                foodName: { type: "STRING", description: "食物中文名" },
                amount: { type: "NUMBER", description: "分配的克数 (g或ml)" },
                calories: { type: "NUMBER", description: "此克数下的热量 (kcal)" },
                protein: { type: "NUMBER", description: "此克数下的蛋白质 (g)" },
                fat: { type: "NUMBER", description: "此克数下的脂肪 (g)" },
                carb: { type: "NUMBER", description: "此克数下的碳水化合物 (g)" },
                fiber: { type: "NUMBER", description: "此克数下的膳食纤维 (g)" }
              },
              required: ["foodName", "amount", "calories", "protein", "fat", "carb", "fiber"]
            }
          },
          totalNutrients: {
            type: "OBJECT",
            properties: {
              calories: { type: "NUMBER", description: "配餐总热量" },
              carb: { type: "NUMBER", description: "配餐总碳水" },
              protein: { type: "NUMBER", description: "配餐总蛋白" },
              fat: { type: "NUMBER", description: "配餐总脂肪" }
            },
            required: ["calories", "carb", "protein", "fat"]
          },
          cookingSteps: {
            type: "ARRAY",
            description: "具体的无油/低油少烟烹饪步骤",
            items: { type: "STRING" }
          },
          seasoningTips: { type: "STRING", description: "精准的低钠低油调味指南" }
        },
        required: ["recipeName", "ingredients", "totalNutrients", "cookingSteps", "seasoningTips"]
      }
    }
  };

  return callGeminiAPI(apiKey, requestBody);
};

// 4. New: AI Weekly Report & Diet Diagnosis API (体重与饮食诊断)
export const getDietDiagnosis = async (weightLogs, dietLogs, targetCalories, targetMacros, apiKey) => {
  if (!apiKey) {
    throw new Error('请先在设置中配置 Gemini API Key');
  }

  const weightStr = weightLogs.map(w => `${w.date}: ${w.weight}kg`).join('\n');
  
  // Calculate average daily intake and macros
  const dates = Object.keys(dietLogs);
  let dietSummaryList = [];
  dates.slice(-7).forEach(date => {
    const logs = dietLogs[date] || [];
    const totals = logs.reduce((acc, item) => {
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.fat += item.fat || 0;
      acc.carb += item.carb || 0;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carb: 0 });
    dietSummaryList.push(`${date}: 摄入 ${totals.calories}kcal (碳水 ${totals.carb.toFixed(0)}g, 蛋白 ${totals.protein.toFixed(0)}g, 脂肪 ${totals.fat.toFixed(0)}g)`);
  });

  const systemPrompt = `你是一个资深的减脂临床营养学家。用户的目标是每天摄入 ${targetCalories} kcal，三大营养素比例为：碳水 ${targetMacros.carb}g, 蛋白质 ${targetMacros.protein}g, 脂肪 ${targetMacros.fat}g。
这里是用户最近的体重记录：
${weightStr}

这是用户最近的饮食摄入记录：
${dietSummaryList.join('\n')}

你的任务是：
1. 分析用户的体重趋势（如：处于平稳期、稳定下降、快速下降还是出现波动反弹），计算最近的净减重量。
2. 分析用户的饮食摄入结构。对比其每日目标，指出他们摄入的卡路里或某种营养素是否经常超标或不足（例如：“经常蛋白质摄入不足，脂肪超标”）。
3. 给出科学、易懂的诊断反馈，分析体重变化的潜在生物学原因（如“近期体重平稳可能是由于碳水偏高导致水分滞留，且实际热量赤字仅200大卡”）。
4. 给出接下来一到两周的具体改进计划（Action Plan，如“1. 将每日精制碳水更换为燕麦和红薯；2. 增加蛋清的比例补足蛋白缺口”）。
5. 返回标准的 JSON 格式。`;

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: `请分析我的减脂数据并给出诊断意见。` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          weightTrend: { type: "STRING", description: "体重趋势，如'稳定下降'、'平台期波动'等" },
          weightChangeKg: { type: "NUMBER", description: "最近这段时间累计减重公斤数 (kg，下降为正数，上升为负数)" },
          macroAnalysis: { type: "STRING", description: "三大营养素比例分析" },
          diagnosisReport: { type: "STRING", description: "详细多段落的诊断分析报告" },
          actionPlan: {
            type: "ARRAY",
            description: "接下来具体的改进步骤",
            items: { type: "STRING" }
          }
        },
        required: ["weightTrend", "weightChangeKg", "macroAnalysis", "diagnosisReport", "actionPlan"]
      }
    }
  };

  return callGeminiAPI(apiKey, requestBody);
};

// Common helper to request Gemini API
const callGeminiAPI = async (apiKey, requestBody) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API 请求失败，HTTP 状态码: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('AI 返回数据为空');
    }

    const cleanedText = cleanJsonString(textContent);
    const parsedData = safeJsonParse(cleanedText, null);
    if (!parsedData) {
      throw new Error('解析 AI 响应的 JSON 数据失败');
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini API 调用出错:', error);
    throw error;
  }
};
