export default class MealAPI {
    constructor() {
        this.baseUrl = import.meta.env.VITE_MEALDB_API_URL;
        this.nutritionBaseUrl = import.meta.env.VITE_NINJAS_API_URL;
        this.ninjasKey = import.meta.env.VITE_NINJAS_API_KEY;
    }


    async searchByIngredient(ingredientString) {
        try {
            const ingredientsArray = ingredientString.split(',');
            const primaryIngredient = ingredientsArray[0].trim();

            if (!primaryIngredient) {
                return null;
            }

            // Build the API URL
            const url = `${this.baseUrl}/filter.php?i=${primaryIngredient}`;

            // Fetch the data
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Return the array of meals
            return data.meals || [];

        } catch (error) {
            console.error("MealAPI Error: Could not fetch ingredients.", error);
            // Return an empty array so the UI doesn't crash, it just shows "no results"
            return [];
        }
    }

    async searchByName(nameQuery) {
        try {
            const safeQuery = encodeURIComponent(nameQuery.trim());
            const url = `${this.baseUrl}/search.php?s=${safeQuery}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.meals || [];
        } catch (error) {
            console.error("MealAPI Error: Could not fetch by name.", error);
            return [];
        }
    }


    async getRecipeDetails(id) {
        try {
            const url = `${this.baseUrl}/lookup.php?i=${id}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Return the single recipe object, or null if something went wrong
            return data.meals ? data.meals[0] : null;

        } catch (error) {
            console.error("MealAPI Error: Could not fetch recipe details.", error);
            return null;
        }
    }

    async getNutrition(query) {
        try {
            const safeQuery = encodeURIComponent(query.trim());
            const response = await fetch(`${this.nutritionBaseUrl}?query=${safeQuery}`, {
                headers: { 'X-Api-Key': this.ninjasKey }
            });
            
            if (!response.ok) throw new Error(`Nutrition API error!`);
            return await response.json(); 
        } catch (error) {
            console.error("Nutrition API Error:", error);
            return null;
        }
    }
}