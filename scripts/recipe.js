// Configuration du chemin universel (basé sur le fichier JSON qui est à la racine du projet)

const BASE_PATH = window.location.pathname.toLowerCase().includes("happymeal")
  ? "/happyMeal/"
  : "/";
console.log("BASE_PATH vérifié:", BASE_PATH);

$(document).ready(function () {
  console.log("Document prêt - Initialisation");
  initApp();
});

async function initApp() {
  try {
    console.log("Initialisation en cours...");
    await loadRecipes();
    await loadRecipeCards();
    initFavorisButtons();
    setupModalHandlers();
    updateMegaMenu(); // Ajout de l'appel initial
    gererRecherche(); // Ajout de l'appel initial
    console.log("Prêt ! Les recettes sont chargées");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showErrorToUser("Une erreur est survenue lors du chargement");
  }
}

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

  // Ouverture du modal
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

console.log("BASE_PATH:", BASE_PATH);

// Chargement des recettes pour le menu
async function loadRecipes() {
  try {
    showLoader();
    console.log("Chargement des recettes...");
    const response = await fetch("../data/data.json");
    if (!response.ok) throw new Error("Erreur HTTP " + response.status);

    const data = await response.json();
    const $recipeList = $("#recipes-list");
    $recipeList.empty();

    // Titre
    $recipeList.append(
      // Titre cliquable
      $("<a>")
        .addClass("list-group-item text-uppercase fw-bold")
        .attr("href", "pages/recipe.html")
        .text("Toutes les recettes"),

      // Items (ouvrent le modal)
      ...data.recettes.map((recette) =>
        $("<a>")
          .addClass("list-group-item list-group-item-action")
          .attr("href", "#")
          .on("click", function (e) {
            e.preventDefault();
            openRecipeModal(recette);
          })
          .text(recette.nom)
      )
    );
  } catch (error) {
    console.error("Erreur loadRecipes:", error);
    $("#recipes-list").html(
      '<p class="text-danger">Erreur de chargement des recettes</p>'
    );
  }
}

// Mise à jour du méga menu
function updateMegaMenu() {
  const favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  const $favoritesList = $("#favorites-list").empty();
  const favoritesLink = `${BASE_PATH}pages/favorites.html`.replace(
    /\/\//g,
    "/"
  );
  console.log("Lien final vérifié:", favoritesLink);

  // 1. Titre cliquable
  $favoritesList.append(
    $("<a>")
      .addClass("list-group-item text-uppercase fw-bold")
      .attr("href", favoritesLink)
      .text("Mes recettes favorites")
      .on("click", function (e) {
        e.preventDefault();
        window.location.href = favoritesLink;
      })
  );
  // 2. Contenu
  if (favoris.length === 0) {
    $favoritesList.append(
      $("<div>")
        .addClass("list-group-item text-muted")
        .text("Aucune recette favorite")
    );
  } else {
    favoris.forEach((fav) => {
      $favoritesList.append(
        $("<a>")
          .addClass("list-group-item list-group-item-action")
          .attr("href", "#")
          .data("recipe", JSON.stringify(fav))
          .text(fav.nom)
          .on("click", function (e) {
            e.preventDefault();
            const recipeData = JSON.parse($(this).data("recipe"));
            openRecipeModal(recipeData);
          })
      );
    });
  }
}
console.log("Favoris href:", `${BASE_PATH}pages/favorites.html`);

// Gestion de la recherche
function gererRecherche() {
  const searchInput = $("#search");
  const suggestionsBox = $("#suggestions");

  // Nouveau: Charger les recettes une seule fois au démarrage
  let allRecipes = [];

  // Chargement initial des données
  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      allRecipes = data.recettes;
    })
    .catch((error) => console.error("Erreur chargement recettes:", error));

  searchInput.on("input", function () {
    const query = $(this).val().toLowerCase().trim();
    suggestionsBox.empty(); // Reset à chaque input

    if (query.length >= 1) {
      // Modification clé: 1 caractère suffit
      const filtered = allRecipes.filter((recette) =>
        recette.nom.toLowerCase().includes(query)
      );

      filtered.slice(0, 5).forEach((recette) => {
        suggestionsBox.append(
          $(`<div class="suggestion-item">${recette.nom}</div>`).on(
            "click",
            () => {
              searchInput.val(recette.nom);
              suggestionsBox.empty();
              openRecipeModal(recette);
            }
          )
        );
      });
    }
  });

  // Fermer les suggestions quand on clique ailleurs
  $(document).on("click", (e) => {
    if (!$(e.target).closest(".autocomplete").length) {
      suggestionsBox.empty();
    }
  });
}
