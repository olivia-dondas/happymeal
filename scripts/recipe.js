// Configuration du chemin universel
const BASE_PATH = window.location.pathname.includes("pages") ? "../" : "./";

$(document).ready(async function () {
  try {
    await loadRecipeCards();
    setupModalHandlers();
    console.log("Prêt ! Les recettes sont chargées");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showError("Une erreur est survenue lors du chargement");
  }
});

async function loadRecipeCards() {
  showLoader(); // Afficher un indicateur de chargement

  try {
    const response = await fetch(`${BASE_PATH}data/data.json`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

    const data = await response.json();
    displayRecipeCards(data.recettes || []);
  } catch (error) {
    console.error("Erreur de chargement:", error);
    showError("Impossible de charger les recettes");
    throw error;
  } finally {
    hideLoader();
  }
}

function displayRecipeCards(recipes) {
  const $container = $("#recipe-cards-container");
  $container.empty();

  if (recipes.length === 0) {
    $container.html(
      '<div class="alert alert-info">Aucune recette disponible</div>'
    );
    return;
  }

  $container.append(
    recipes.map(
      (recipe, index) => `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${BASE_PATH}${recipe.images}" class="card-img-top" alt="${recipe.nom}" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${recipe.nom}</h5>
            <div class="d-flex gap-2 mb-2">
              <span class="badge bg-secondary">${recipe.categorie}</span>
              <span class="badge bg-light text-dark">${recipe.temps_preparation}</span>
            </div>
            <button class="btn btn-primary btn-view-recipe" data-recipe-id="${index}">
              Voir la recette <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
  );
}

function setupModalHandlers() {
  $(document).on("click", ".btn-view-recipe", async function () {
    const recipeId = $(this).data("recipe-id");
    showLoader();

    try {
      const response = await fetch(`${BASE_PATH}data/data.json`);
      const data = await response.json();
      const recipe = data.recettes[recipeId];

      if (recipe) {
        displayRecipeModal(recipe);
      }
    } catch (error) {
      console.error("Erreur du modal:", error);
      showError("Impossible d'afficher la recette");
    } finally {
      hideLoader();
    }
  });
}

function displayRecipeModal(recipe) {
  // Remplissage du modal
  $("#recipeTitle").text(recipe.nom);
  $("#recipeImage").attr("src", `${BASE_PATH}${recipe.images}`);
  $("#recipeCategory").text(`Catégorie: ${recipe.categorie}`);
  $("#recipeTime").text(`Temps: ${recipe.temps_preparation}`);

  // Ingédients
  $("#recipeIngredients").html(
    recipe.ingredients
      .map(
        (ing) =>
          `<li>${
            typeof ing === "string" ? ing : `${ing.nom} - ${ing.quantite}`
          }</li>`
      )
      .join("")
  );

  // Étapes
  $("#recipeSteps").html(
    recipe.etapes.map((step, i) => `<li>${step}</li>`).join("")
  );

  // Ouverture
  new bootstrap.Modal("#recipeModal").show();
}

// Helpers
function showLoader() {
  $("#loader").removeClass("d-none");
}
function hideLoader() {
  $("#loader").addClass("d-none");
}
function showError(msg) {
  $("#recipe-cards-container").html(
    `<div class="alert alert-danger">${msg}</div>`
  );
}
