import MealAPI from "./api.mjs";
import UI from "./ui.mjs";
import RecipeBox from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const api = new MealAPI();

  const storage = new RecipeBox();
  let currentRecipes = [];

  // DOM Elements
  const searchBtn = document.getElementById("search-btn");
  const ingredientInput = document.getElementById("ingredient-input");
  const recipeGrid = document.getElementById("recipe-grid");
  const searchStatus = document.getElementById("search-status");

  searchBtn.addEventListener("click", async () => {
    const query = ingredientInput.value.trim();

    if (!query) {
      searchStatus.innerHTML = `<p class="text-red-500 font-medium">Please enter a main ingredient.</p>`;
      return;
    }

    recipeGrid.innerHTML = ""; // Clear previous cards
    searchStatus.innerHTML = `
            <div class="flex flex-col items-center justify-center py-4">
                <svg class="animate-spin h-10 w-10 text-olio-gold mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-truffle font-medium animate-pulse">Searching the pantry for "${query}"...</p>
            </div>
        `;

    //  Call the API
    currentRecipes = await api.searchByIngredient(query);
    const recipes = currentRecipes; // map to local variable for ease

    // Handle Empty Results
    if (recipes.length === 0) {
      searchStatus.innerHTML = `<p class="text-truffle font-medium">No recipes found using "${query}". Try a different ingredient!</p>`;
      return;
    }

    searchStatus.innerHTML = `<p class="text-olio-gold font-bold">Found ${recipes.length} delicious matches!</p>`;

    const cardsHTML = recipes
      .map((recipe) => UI.createRecipeCard(recipe))
      .join("");
    recipeGrid.innerHTML = cardsHTML;
  });

  const modal = document.getElementById("recipe-modal");
  const modalBody = document.getElementById("modal-body");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const modalContentContainer = document.getElementById(
    "modal-content-container",
  );

  function openModal() {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modalContentContainer.classList.remove("scale-95");
      modalContentContainer.classList.add("scale-100");
    }, 10);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.add("opacity-0");
    modalContentContainer.classList.remove("scale-100");
    modalContentContainer.classList.add("scale-95");
    // Wait for the 300ms transition to finish before hiding
    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto"; // Restores background scrolling
    }, 300);
  }

  // Close events
  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  recipeGrid.addEventListener("click", async (e) => {
    const btn = e.target.closest(".view-recipe-btn");
    if (!btn) return;

    const recipeId = btn.getAttribute("data-id");

    modalBody.innerHTML = `
            <div class="p-20 text-center flex flex-col items-center justify-center h-96">
                <svg class="animate-spin h-12 w-12 text-olio-gold mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-truffle font-heading font-bold text-lg animate-pulse">Prepping the kitchen...</p>
            </div>
        `;
    openModal();

    const recipeDetails = await api.getRecipeDetails(recipeId);

    if (!recipeDetails) {
      modalBody.innerHTML = `<div class="p-20 text-center text-red-500 font-bold">Whoops! Could not load this recipe.</div>`;
      return;
    }

    modalBody.innerHTML = UI.generateModalContent(recipeDetails);
  });

  recipeGrid.addEventListener("click", (e) => {
    const saveBtn = e.target.closest(".save-recipe-btn");
    if (!saveBtn) return;

    // Prevent the click from opening the modal if it bubbles up
    e.stopPropagation();

    const recipeId = saveBtn.getAttribute("data-id");

    // Find the full recipe object from our current session data
    const recipeToSave = currentRecipes.find((r) => r.idMeal === recipeId);

    if (recipeToSave) {
      // Toggle it in storage
      const isNowSaved = storage.toggleRecipe(recipeToSave);

      // Instantly update the UI heart colors
      if (isNowSaved) {
        saveBtn.classList.remove("text-truffle/30", "hover:text-red-500");
        saveBtn.classList.add("text-red-500", "fill-current");
      } else {
        saveBtn.classList.remove("text-red-500", "fill-current");
        saveBtn.classList.add("text-truffle/30", "hover:text-red-500");
      }
    }
  });

  ingredientInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });
});
