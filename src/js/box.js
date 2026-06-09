import MealAPI from "./api.mjs";
import UI from "./ui.mjs";
import RecipeBox from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const api = new MealAPI();
  const storage = new RecipeBox();

  // DOM Elements
  const savedGrid = document.getElementById("saved-grid");
  const emptyState = document.getElementById("empty-state");

  function renderSavedRecipes() {
    const recipes = storage.getSavedRecipes();

    if (recipes.length === 0) {
      emptyState.classList.remove("hidden");
      savedGrid.innerHTML = "";
      return;
    }

    emptyState.classList.add("hidden");
    savedGrid.innerHTML = recipes
      .map((recipe) => UI.createRecipeCard(recipe))
      .join("");
  }

  renderSavedRecipes();

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
    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }, 300);
  }

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  savedGrid.addEventListener("click", async (e) => {
    const viewBtn = e.target.closest(".view-recipe-btn");
    if (viewBtn) {
      const recipeId = viewBtn.getAttribute("data-id");
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
      if (recipeDetails) {
        modalBody.innerHTML = UI.generateModalContent(recipeDetails);
      }
      return;
    }

    const saveBtn = e.target.closest(".save-recipe-btn");
    if (saveBtn) {
      e.stopPropagation();
      const recipeId = saveBtn.getAttribute("data-id");

      storage.removeRecipe(recipeId);

      const cardElement = saveBtn.closest(".group");

      cardElement.classList.add("opacity-0", "scale-95");
      setTimeout(() => {
        cardElement.remove();

        if (savedGrid.children.length === 0) {
          emptyState.classList.remove("hidden");
        }
      }, 300);
    }
  });
});
