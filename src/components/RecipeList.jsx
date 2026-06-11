import React, { useState } from 'react';
import { BookOpen, Scale, Utensils, Check, ChevronRight, X } from 'lucide-react';
import { calculateNutrients } from '../utils/helpers';

const RecipeList = ({ recipes, foodDatabase, onLogFood }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [portionScale, setPortionScale] = useState(1);
  const [logMealType, setLogMealType] = useState('lunch');
  const [isLoggedSuccess, setIsLoggedSuccess] = useState(false);

  const handleOpenRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setPortionScale(1);
    setLogMealType('lunch');
    setIsLoggedSuccess(false);
  };

  const handleLogRecipeIngredients = () => {
    if (!selectedRecipe) return;

    selectedRecipe.ingredients.forEach(ing => {
      const food = foodDatabase.find(f => f.id === ing.id);
      if (food) {
        const scaledAmt = Math.round(ing.amount * portionScale);
        const nutrition = calculateNutrients(food, scaledAmt);
        
        onLogFood({
          name: food.name,
          amount: scaledAmt,
          calories: nutrition.calories,
          protein: nutrition.protein,
          fat: nutrition.fat,
          carb: nutrition.carb,
          fiber: nutrition.fiber,
          mealType: logMealType
        });
      }
    });

    setIsLoggedSuccess(true);
    setTimeout(() => {
      setIsLoggedSuccess(false);
      setSelectedRecipe(null);
    }, 1500);
  };

  // Compute total nutrition of a recipe given the scale
  const getRecipeTotalNutrition = (recipe, scale) => {
    return recipe.ingredients.reduce((acc, ing) => {
      const food = foodDatabase.find(f => f.id === ing.id);
      if (food) {
        const scaledAmt = ing.amount * scale;
        const nutr = calculateNutrients(food, scaledAmt);
        acc.calories += nutr.calories;
        acc.protein += nutr.protein;
        acc.fat += nutr.fat;
        acc.carb += nutr.carb;
        acc.fiber += nutr.fiber;
      }
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0 });
  };

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
        AI 推荐减脂食谱
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {recipes.map(recipe => {
          const baseNutrients = getRecipeTotalNutrition(recipe, 1);
          return (
            <div 
              key={recipe.id} 
              className="glass-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleOpenRecipe(recipe)}
            >
              <div className="recipe-tag">{recipe.tag}</div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>{recipe.name}</h4>
              <p className="recipe-desc">{recipe.desc}</p>
              
              <div className="recipe-footer">
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>碳水: {baseNutrients.carb.toFixed(0)}g</span>
                  <span>蛋白: {baseNutrients.protein.toFixed(0)}g</span>
                  <span>脂肪: {baseNutrients.fat.toFixed(0)}g</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-calories)', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>{baseNutrients.calories} kcal</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '85vh' }}>
            <div className="modal-header">
              <div>
                <span className="recipe-tag" style={{ marginBottom: '4px' }}>{selectedRecipe.tag}</span>
                <h3 className="modal-title" style={{ fontSize: '18px' }}>{selectedRecipe.name}</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedRecipe(null)}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              {selectedRecipe.desc}
            </p>

            {/* Scale Slider */}
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>分量比例</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{portionScale} 人份</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.5" 
                value={portionScale}
                onChange={(e) => setPortionScale(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>

            {/* Nutrients Display */}
            {(() => {
              const scaledNutrients = getRecipeTotalNutrition(selectedRecipe, portionScale);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,90,54,0.08)', padding: '8px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>热量</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-calories)', fontFamily: 'var(--font-title)' }}>
                      {scaledNutrients.calories}k
                    </div>
                  </div>
                  <div style={{ background: 'rgba(236,72,153,0.08)', padding: '8px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>碳水</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-carb)', fontFamily: 'var(--font-title)' }}>
                      {scaledNutrients.carb.toFixed(0)}g
                    </div>
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.08)', padding: '8px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>蛋白</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-protein)', fontFamily: 'var(--font-title)' }}>
                      {scaledNutrients.protein.toFixed(0)}g
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.08)', padding: '8px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>脂肪</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-fat)', fontFamily: 'var(--font-title)' }}>
                      {scaledNutrients.fat.toFixed(0)}g
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Ingredients */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={16} /> 食材清单
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedRecipe.ingredients.map(ing => {
                  const food = foodDatabase.find(f => f.id === ing.id);
                  const scaledAmt = Math.round(ing.amount * portionScale);
                  return (
                    <div 
                      key={ing.id} 
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 8px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px' }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{food?.name || ing.id}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{scaledAmt} g/ml</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steps */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> 烹饪步骤
              </h4>
              <ol className="bullet-list" style={{ paddingLeft: '20px' }}>
                {selectedRecipe.steps.map((step, idx) => (
                  <li key={idx} style={{ lineHeight: '1.6', fontSize: '13px' }}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Action Log Box */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>记录到:</span>
                <select 
                  value={logMealType}
                  onChange={(e) => setLogMealType(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="dinner">晚餐</option>
                  <option value="snack">加餐</option>
                </select>
              </div>

              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleLogRecipeIngredients}
                disabled={isLoggedSuccess}
                style={{ background: isLoggedSuccess ? '#10b981' : undefined }}
              >
                {isLoggedSuccess ? (
                  <>
                    <Check size={16} /> 成功记录！
                  </>
                ) : (
                  <>
                    <Utensils size={16} /> 一键记入饮食账单
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;
