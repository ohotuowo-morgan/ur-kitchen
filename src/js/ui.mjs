import RecipeBox from "./storage.js";
const storage = new RecipeBox();

export default class UI {

    static createRecipeCard(recipe) {
        const isSaved = storage.isSaved(recipe.idMeal);

        const heartColorClass = isSaved ? 'text-red-500 fill-current' : 'text-truffle/30 hover:text-red-500';
        return `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-truffle/10 overflow-hidden group">
                
                <div class="relative h-48 overflow-hidden bg-pasta">
                    <img 
                        src="${recipe.strMealThumb}" 
                        alt="${recipe.strMeal}" 
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    >
                </div>
                
                <div class="p-6 flex flex-col grow">
                    <h3 class="text-xl font-heading font-bold text-truffle mb-2 line-clamp-2">
                        ${recipe.strMeal}
                    </h3>
                    
                    <div class="mt-auto pt-4 flex flex-nowrap justify-between items-center border-t border-truffle/10">
                        <button data-id="${recipe.idMeal}" class="view-recipe-btn shrink-0 text-olio-gold font-bold hover:text-truffle transition-colors text-xs sm:text-sm uppercase tracking-wider">
                            View Recipe
                        </button>
                        
                        <button data-id="${recipe.idMeal}" class="save-recipe-btn shrink-0 transition-colors ${heartColorClass}" title="Save to Recipe Box">
                            <svg class="w-5 h-5 sm:w-7 sm:h-7" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }


    // 1. ADD THE NUTRITION PARAMETER HERE
    static generateModalContent(recipe, nutritionData = null) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
            }
        }

        const ingredientsList = ingredients.map(ing => 
            `<li class="flex items-start gap-2 mb-2">
                <svg class="w-5 h-5 text-olio-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>${ing}</span>
            </li>`
        ).join('');

        const instructions = recipe.strInstructions
            .split('\n')
            .filter(paragraph => paragraph.trim() !== '')
            .map(paragraph => `<p class="mb-4">${paragraph}</p>`)
            .join('');

        const youtubeBtn = recipe.strYoutube ? `
            <div class="mt-8 pt-6 border-t border-truffle/10">
                <a href="${recipe.strYoutube}" target="_blank" class="inline-flex items-center gap-2 bg-[#FF0000] text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold tracking-wide">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
                    Watch Tutorial
                </a>
            </div>
        ` : '';


        // 2. ADD THE MACRO CALCULATION BLOCK
        let macrosHtml = '';
        if (nutritionData && nutritionData.length > 0) {
            let totalCarb = 0, totalFat = 0, totalSugar = 0;

            nutritionData.forEach(item => {
                totalCarb += (typeof item.carbohydrates_total_g === 'number') ? item.carbohydrates_total_g : 0;
                totalFat += (typeof item.fat_total_g === 'number') ? item.fat_total_g : 0;
                totalSugar += (typeof item.sugar_g === 'number') ? item.sugar_g : 0;
            });

            const carbDisplay = totalCarb.toFixed(0) + 'g';
            const fatDisplay = totalFat.toFixed(1) + 'g'; 
            const sugarDisplay = totalSugar.toFixed(0) + 'g';

            macrosHtml = `
                <div class="flex gap-4 mb-8 bg-olio-gold/10 p-4 rounded-lg border border-olio-gold/30">
                    <div class="text-center w-1/3 border-r border-olio-gold/30">
                        <span class="block text-xl font-bold text-olio-gold">${carbDisplay}</span>
                        <span class="text-xs text-truffle uppercase tracking-wider">Carbs</span>
                    </div>
                    <div class="text-center w-1/3 border-r border-olio-gold/30">
                        <span class="block text-xl font-bold text-olio-gold">${fatDisplay}</span>
                        <span class="text-xs text-truffle uppercase tracking-wider">Fat</span>
                    </div>
                    <div class="text-center w-1/3">
                        <span class="block text-xl font-bold text-olio-gold">${sugarDisplay}</span>
                        <span class="text-xs text-truffle uppercase tracking-wider">Sugar</span>
                    </div>
                </div>
            `;
        }

        // 3. INJECT ${macrosHtml} INTO THE LAYOUT
        return `
            <div class="flex flex-col md:flex-row min-h-125">
                <div class="w-full md:w-2/5 bg-pasta relative">
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="w-full h-64 md:h-full object-cover">
                </div>
                <div class="w-full md:w-3/5 p-8 md:p-10">
                    <h2 class="text-3xl md:text-4xl font-heading font-bold text-truffle mb-2">${recipe.strMeal}</h2>
                    <p class="text-truffle/60 uppercase tracking-widest text-sm font-bold mb-8">${recipe.strCategory} | ${recipe.strArea}</p>
                    
                    ${macrosHtml}
                    
                    <div class="flex flex-col gap-8">
                        <div>
                            <h4 class="text-xl font-heading font-bold text-truffle mb-4 pb-2 border-b border-truffle/10">Ingredients</h4>
                            <ul class="text-truffle font-medium">
                                ${ingredientsList}
                            </ul>
                        </div>
                        <div>
                            <h4 class="text-xl font-heading font-bold text-truffle mb-4 pb-2 border-b border-truffle/10">Instructions</h4>
                            <div class="text-truffle max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                                ${instructions}
                            </div>
                        </div>
                    </div>
                    ${youtubeBtn}
                </div>
            </div>
        `;
    }
}