export const FOOD_DATABASE = [
  { id: 'tuna', name: '水浸金枪鱼罐头', calories: 97, protein: 21.6, fat: 0.6, carb: 0, fiber: 0, defaultAmount: 100 },
  { id: 'egg', name: '可生食鸡蛋', calories: 140, protein: 12.6, fat: 9.6, carb: 1.0, fiber: 0, defaultAmount: 50 }, 
  { id: 'oats', name: '即食燕麦片', calories: 366, protein: 11.0, fat: 7.0, carb: 65.0, fiber: 10.0, defaultAmount: 30 },
  { id: 'tomato', name: '番茄', calories: 15, protein: 0.8, fat: 0.2, carb: 3.0, fiber: 1.0, defaultAmount: 150 },
  { id: 'wawacai', name: '娃娃菜', calories: 15, protein: 1.2, fat: 0.1, carb: 2.5, fiber: 1.2, defaultAmount: 100 },
  { id: 'chicken_breast', name: '生鸡胸肉', calories: 118, protein: 24.6, fat: 1.9, carb: 0, fiber: 0, defaultAmount: 100 },
  { id: 'shrimp', name: '冷冻虾仁', calories: 48, protein: 10.4, fat: 0.7, carb: 0, fiber: 0, defaultAmount: 100 },
  { id: 'tofu', name: '老豆腐', calories: 112, protein: 11.5, fat: 7.5, carb: 2.5, fiber: 1.5, defaultAmount: 100 },
  { id: 'basha_fish', name: '巴沙鱼柳', calories: 80, protein: 15.0, fat: 1.5, carb: 0, fiber: 0, defaultAmount: 100 },
  { id: 'broccoli', name: '西蓝花', calories: 34, protein: 2.8, fat: 0.4, carb: 4.2, fiber: 2.6, defaultAmount: 100 },
  { id: 'soymilk', name: '无糖纯豆浆', calories: 14, protein: 1.4, fat: 0.64, carb: 0.6, fiber: 0.2, defaultAmount: 250 },
  { id: 'beef_shank', name: '卤牛腱子肉', calories: 122, protein: 21.0, fat: 3.5, carb: 0.5, fiber: 0, defaultAmount: 100 },
  { id: 'garlic', name: '大蒜泥', calories: 166, protein: 6.4, fat: 0.5, carb: 33.0, fiber: 1.5, defaultAmount: 15 }
];

export const RECIPES = [
  {
    id: 'rec_tuna_oats',
    name: '番茄金枪鱼燕麦滑蛋羹',
    tag: '微波炉 / 5分钟',
    desc: '超快手的懒人清晨能量炸弹，番茄和滑蛋完美中和水浸金枪鱼的干柴，燕麦提供持久饱腹慢碳！',
    ingredients: [
      { id: 'tuna', amount: 80 },
      { id: 'egg', amount: 100 },
      { id: 'oats', amount: 25 },
      { id: 'tomato', amount: 100 },
      { id: 'wawacai', amount: 50 }
    ],
    steps: [
      '番茄、娃娃菜切碎打底，无需加水，加盖放入微波炉高火叮 1.5 分钟，逼出浓郁的番茄蔬菜汁。',
      '取出容器，倒入25克即食燕麦片，搅拌均匀吸收碗内的蔬菜汤汁，再次微波高火叮 30 秒。',
      '打入2个可生食鸡蛋，放入80g控干水的金枪鱼肉，撒黑胡椒和一撮盐，彻底搅匀。',
      '高火叮1分钟，边缘微凝固但中心呈半熟滑蛋状态时取出，用筷子略微划散，盖盖用余温焖1分钟。'
    ]
  },
  {
    id: 'rec_shrimp_tofu',
    name: '无油脆皮虾仁烤豆腐',
    tag: '空气炸锅 / 15分钟',
    desc: '外酥里嫩的植物蛋白+动物蛋白双优组合，零额外用油，酥脆治愈，晚餐吃毫无负担。',
    ingredients: [
      { id: 'tofu', amount: 150 },
      { id: 'shrimp', amount: 100 }
    ],
    steps: [
      '老豆腐切成一口大小的方块，用厨房纸巾反复吸干表面水分（这步是豆腐烤出脆皮的关键）。',
      '在豆腐表面撒少许盐、黑胡椒粒，轻拍匀称后平铺在空气炸锅内。',
      '解冻洗净的虾仁同样吸干水分，置于豆腐块之上。',
      '空气炸锅无需刷油，设定 180°C 烤制 12 到 15 分钟（中途可以翻面一次使受热更匀）。',
      '出锅装盘后可根据个人喜好撒上一层0卡椒盐粉或者干辣椒面即可开动。'
    ]
  },
  {
    id: 'rec_basha_fish',
    name: '蒜香嫩烤巴沙鱼柳',
    tag: '空气炸锅 / 18分钟',
    desc: '不加一滴油的“黑科技”蒜香烤鱼，低卡多汁，适合晚上下班后的超级省心快手餐。',
    ingredients: [
      { id: 'basha_fish', amount: 150 },
      { id: 'garlic', amount: 15 }
    ],
    steps: [
      '巴沙鱼柳解冻，必须用厨房纸巾狠狠按压吸干多余水分，防止烤制时严重缩水和释出药水。',
      '大蒜打成细密蒜泥，加入1勺低钠生抽、半勺蚝油、黑胡椒粉，混合后均匀涂抹在鱼肉两面腌制10分钟。',
      '空气炸锅内铺上防粘锡纸，放入腌好的鱼柳，将剩余的蒜蓉汁浇在鱼肉表面。',
      '放入空气炸锅设定 190°C 烤 15 到 18 分钟，烤至表面金黄、蒜香四溢即可出炉。'
    ]
  }
];

export const INITIAL_WEIGHTS = [
  { date: '2026-06-02', weight: 75.8 },
  { date: '2026-06-03', weight: 75.5 },
  { date: '2026-06-04', weight: 75.4 },
  { date: '2026-06-05', weight: 75.1 },
  { date: '2026-06-06', weight: 74.9 },
  { date: '2026-06-07', weight: 74.7 },
  { date: '2026-06-08', weight: 74.5 }
];

export const INITIAL_DIET_LOGS = {
  '2026-06-07': [
    { name: '即食燕麦片', amount: 30, calories: 110, protein: 3.3, fat: 2.1, carb: 19.5, fiber: 3, mealType: 'breakfast' },
    { name: '可生食鸡蛋', amount: 100, calories: 140, protein: 12.6, fat: 9.6, carb: 1, fiber: 0, mealType: 'breakfast' },
    { name: '生鸡胸肉', amount: 150, calories: 177, protein: 36.9, fat: 2.9, carb: 0, fiber: 0, mealType: 'lunch' },
    { name: '西蓝花', amount: 200, calories: 68, protein: 5.6, fat: 0.8, carb: 8.4, fiber: 5.2, mealType: 'lunch' },
    { name: '老豆腐', amount: 150, calories: 168, protein: 17.3, fat: 11.3, carb: 3.8, fiber: 2.3, mealType: 'dinner' },
    { name: '冷冻虾仁', amount: 100, calories: 48, protein: 10.4, fat: 0.7, carb: 0, fiber: 0, mealType: 'dinner' }
  ]
};
