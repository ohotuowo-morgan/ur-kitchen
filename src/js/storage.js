export default class RecipeBox {
  constructor() {
    this.storageKey = "urKitchen_saved_recipes";
  }

  getSavedRecipes() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  isSaved(idMeal) {
    const recipes = this.getSavedRecipes();
    return recipes.some((recipe) => recipe.idMeal === idMeal);
  }

  saveRecipe(recipe) {
    const recipes = this.getSavedRecipes();

    if (!this.isSaved(recipe.idMeal)) {
      recipes.push(recipe);
      localStorage.setItem(this.storageKey, JSON.stringify(recipes));
      return true;
    }
    return false;
  }

  removeRecipe(idMeal) {
    let recipes = this.getSavedRecipes();
    recipes = recipes.filter((recipe) => recipe.idMeal !== idMeal);
    localStorage.setItem(this.storageKey, JSON.stringify(recipes));
  }

  toggleRecipe(recipe) {
    if (this.isSaved(recipe.idMeal)) {
      this.removeRecipe(recipe.idMeal);
      return false;
    } else {
      this.saveRecipe(recipe);
      return true;
    }
  }
}
