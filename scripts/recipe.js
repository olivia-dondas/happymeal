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
}

// Charger les recettes depuis le fichier JSON
const recipesPerPage = 4; // Nombre de recettes par page
let currentPage = 1; // Page actuelle
let allRecipes = []; // Stocker toutes les recettes

function displayPaginatedRecipes() {
  const container = document.getElementById("menu-container");
  if (!container) {
    console.error("Le conteneur menu-container n'existe pas");
    return;
  }
  container.innerHTML = "";

  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const recipesToDisplay = allRecipes.slice(startIndex, endIndex);

  recipesToDisplay.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4";
    card.innerHTML = `
      <div class="card recipe-card" data-index="${index}">
        <img src="${recipe.images}" class="card-img-top" alt="${recipe.nom}">
        <div class="card-body">
          <h5 class="card-title">${recipe.nom}</h5>
          <p class="card-text">Catégorie: ${recipe.categorie}</p>
          <p class="card-text">Temps: ${recipe.temps_preparation}</p>
          <button class="btn btn-primary voir-plus-btn">Voir la recette</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  updatePaginationControls();
  setupVoirPlusButtons();
}

function updatePaginationControls() {
  const paginationContainer = document.getElementById("pagination-controls");
  if (!paginationContainer) {
    console.error("Le conteneur pagination-controls n'existe pas");
    return;
  }
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  const prevButton = document.createElement("button");
  prevButton.textContent = "Précédent";
  prevButton.className = "btn btn-secondary me-2";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayPaginatedRecipes();
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "Suivant";
  nextButton.className = "btn btn-secondary";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPaginatedRecipes();
    }
  });

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(nextButton);
}

function setupVoirPlusButtons() {
  document.querySelectorAll(".voir-plus-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const card = event.target.closest(".recipe-card");
      const index = card.dataset.index;
      const recipe = allRecipes[index];

      if (recipe) {
        openModal(recipe);
      }
    });
  });
}

function openModal(recipe) {
  const modal = document.getElementById("recipeModal");
  const modalTitle = document.getElementById("recipeTitle");
  const modalImage = document.getElementById("recipeImage");
  const modalCategory = document.getElementById("recipeCategory");
  const modalTime = document.getElementById("recipeTime");
  const modalIngredients = document.getElementById("recipeIngredients");
  const modalSteps = document.getElementById("recipeSteps");

  // Remplir les données du modal
  modalTitle.textContent = recipe.nom;
  modalImage.src = recipe.images;
  modalCategory.textContent = recipe.categorie;
  modalTime.textContent = recipe.temps_preparation;

  // Liste des ingrédients
  modalIngredients.innerHTML = "";
  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = `${ingredient.nom} - ${ingredient.quantite}`;
    modalIngredients.appendChild(li);
  });

  // Étapes de la recette
  modalSteps.innerHTML = "";
  recipe.etapes.forEach((etape) => {
    const li = document.createElement("li");
    li.textContent = etape;
    modalSteps.appendChild(li);
  });

  // Afficher le modal
  modal.style.display = "block";
}

// Fermer le modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("recipeModal").style.display = "none";
});

window.addEventListener("click", (event) => {
  const modal = document.getElementById("recipeModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

async function loadRecipes() {
  try {
    const response = await fetch("../data/data.json");
    if (!response.ok)
      throw new Error("Erreur lors du chargement du fichier JSON");
    const data = await response.json();
    allRecipes = data.recettes || [];
    displayPaginatedRecipes();
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error);
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
