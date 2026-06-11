import { cleanJsonString, safeJsonParse } from './helpers';

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
4. 返回的结果必须是一个标准的 JSON 对象，且符合指定的 JSON Schema 格式。

内置食物数据库列表：
${foodDbList}

不要输出任何 markdown 格式的标记（如 \`\`\`json ），直接返回 JSON 纯文本。`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `用户输入的饮食内容: "${inputText}"`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: systemPrompt
        }
      ]
    },
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

  try {
    // We try to call Gemini 2.5 Flash, if that is not available, we can fallback to gemini-1.5-flash
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
    if (!parsedData || !parsedData.items) {
      throw new Error('解析 AI 响应的 JSON 数据失败');
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini API 调用出错:', error);
    throw error;
  }
};
