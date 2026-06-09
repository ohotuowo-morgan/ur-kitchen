import MealAPI from "./api.mjs";
import UI from "./ui.mjs";
import RecipeBox from "./storage.js";

function parseFractions(str) {
  if (!str) return "";

  const unicodeMap = {
    "½": "1/2",
    "⅓": "1/3",
    "⅔": "2/3",
    "¼": "1/4",
    "¾": "3/4",
    "⅕": "1/5",
    "⅖": "2/5",
    "⅗": "3/5",
    "⅘": "4/5",
    "⅙": "1/6",
    "⅚": "5/6",
    "⅛": "1/8",
    "⅜": "3/8",
    "⅝": "5/8",
    "⅞": "7/8",
  };
  let parsedStr = str;
  for (let [unicode, text] of Object.entries(unicodeMap)) {
    parsedStr = parsedStr.replace(new RegExp(unicode, "g"), ` ${text} `);
  }

  parsedStr = parsedStr.replace(
    /(?:(\d+)\s+)?(\d+)\/(\d+)/g,
    (match, whole, num, den) => {
      const w = whole ? parseInt(whole.trim(), 10) : 0;
      const n = parseInt(num, 10);
      const d = parseInt(den, 10);
      if (d === 0) return match;
      return (w + n / d).toFixed(2);
    },
  );

  return parsedStr.replace(/\s+/g, " ").trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const api = new MealAPI();
  const storage = new RecipeBox();
  let currentRecipes = [];

  const searchBtn = document.getElementById("search-btn");
  const browseInput = document.getElementById("browse-input");
  const recipeGrid = document.getElementById("recipe-grid");
  const searchStatus = document.getElementById("search-status");

  performSearch("");

  searchBtn.addEventListener("click", () => {
    performSearch(browseInput.value.trim());
  });

  browseInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(browseInput.value.trim());
  });

  async function performSearch(query) {
    recipeGrid.innerHTML = "";
    searchStatus.innerHTML = `<p class="text-olio-gold animate-pulse">Loading recipes...</p>`;

    currentRecipes = await api.searchByName(query);

    if (currentRecipes.length === 0) {
      searchStatus.innerHTML = `<p class="text-red-500 font-medium">No recipes found for "${query}".</p>`;
      return;
    }

    searchStatus.innerHTML = `<p class="text-truffle font-bold">Showing ${currentRecipes.length} recipes</p>`;
    recipeGrid.innerHTML = currentRecipes
      .map((recipe) => UI.createRecipeCard(recipe))
      .join("");
  }

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

  recipeGrid.addEventListener("click", async (e) => {
    const viewBtn = e.target.closest(".view-recipe-btn");
    if (viewBtn) {
      const recipeId = viewBtn.getAttribute("data-id");
      modalBody.innerHTML = `<div class="p-20 text-center"><p class="animate-pulse font-bold text-lg text-olio-gold">Loading recipe & nutrition data...</p></div>`;
      openModal();

      const recipeDetails = await api.getRecipeDetails(recipeId);
      if (!recipeDetails) return;

      let validIngredients = [];
      for (let i = 1; i <= 20; i++) {
        let ingredient = recipeDetails[`strIngredient${i}`];
        let measure = recipeDetails[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
          ingredient = ingredient.trim();
          measure = measure ? measure.trim() : "";

          let combinedString = `${measure} ${ingredient}`;

          // STRIP PARENTHESES
          combinedString = combinedString.replace(/\(.*?\)/g, "").trim();

          // TRANSLATE UNICODE/TEXT FRACTIONS TO DECIMALS
          combinedString = parseFractions(combinedString);

          const lowerString = combinedString.toLowerCase();

          // Filter out zero-calorie troublemakers AND "to taste"
          if (
            lowerString.includes("pinch") ||
            lowerString.includes("handful") ||
            lowerString.includes("dash") ||
            lowerString.includes("spice") ||
            lowerString.includes("to taste") ||
            ingredient.toLowerCase() === "water"
          ) {
            continue;
          }

          if (combinedString) {
            validIngredients.push(combinedString);
          }
        }
      }

      console.log(validIngredients);

      let nutritionData = [];

      try {
        const apiPromises = validIngredients.map((ingredient) =>
          api.getNutrition(ingredient),
        );

        const results = await Promise.all(apiPromises);

        results.forEach((res) => {
          if (res && res.length > 0) {
            nutritionData.push(...res);
          }
        });

        console.log("COMBINED DATA SUCCESSFULLY RECEIVED:");
        console.log(nutritionData);

        if (nutritionData.length === 0) {
          console.warn(
            "WARNING: API Ninjas couldn't understand any of the ingredients.",
          );
        }
      } catch (error) {
        console.error("ERROR FETCHING NUTRITION BATCH:", error);
        nutritionData = [];
      }
      modalBody.innerHTML = UI.generateModalContent(
        recipeDetails,
        nutritionData,
      );
      return;
    }

    const saveBtn = e.target.closest(".save-recipe-btn");
    if (saveBtn) {
      e.stopPropagation();
      const recipeId = saveBtn.getAttribute("data-id");
      const recipeToSave = currentRecipes.find((r) => r.idMeal === recipeId);

      if (recipeToSave) {
        const isNowSaved = storage.toggleRecipe(recipeToSave);
        if (isNowSaved) {
          saveBtn.classList.remove("text-truffle/30", "hover:text-red-500");
          saveBtn.classList.add("text-red-500", "fill-current");
        } else {
          saveBtn.classList.remove("text-red-500", "fill-current");
          saveBtn.classList.add("text-truffle/30", "hover:text-red-500");
        }
      }
    }
  });
});
