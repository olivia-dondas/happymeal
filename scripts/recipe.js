// Configuration du chemin de base
const BASE_PATH = window.location.pathname.toLowerCase().includes("happymeal")
  ? "/happyMeal/"
  : "/";
console.log("BASE_PATH vérifié:", BASE_PATH);

// ==================== FONCTIONS UTILITAIRES ====================
function showLoader() {
  $("#loader").removeClass("d-none");
}

function hideLoader() {
  $("#loader").addClass("d-none");
}

function showError(msg, selector = "#recipe-cards-container") {
  $(selector).html(`<div class="alert alert-danger">${msg}</div>`);
}

// ==================== GESTION DES DONNÉES ====================
async function fetchRecipes() {
  try {
    const response = await fetch(`${BASE_PATH}data/data.json`);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur fetchRecipes:", error);
    showError("Impossible de charger les recettes");
    throw error;
  }
}

// ==================== AFFICHAGE DES RECETTES ====================
function displayRecipeCards(recipes) {
  const $container = $("#recipe-cards-container");
  $container.empty();

  if (!recipes || recipes.length === 0) {
    return $container.html(
      '<div class="alert alert-info">Aucune recette disponible</div>'
    );
  }

  const favoris = JSON.parse(localStorage.getItem("favoris")) || [];

  $container.append(
    recipes.map((recipe, index) => {
      const isFavori = favoris.some((f) => f.nom === recipe.nom);

      return `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${BASE_PATH}${recipe.images}" class="card-img-top" alt="${
        recipe.nom
      }" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${recipe.nom}</h5>
            <div class="d-flex gap-2 mb-2">
              <span class="badge bg-secondary">${recipe.categorie}</span>
              <span class="badge bg-light text-dark">${
                recipe.temps_preparation
              }</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-primary btn-view-recipe" data-recipe-id="${index}">
                Voir la recette <i class="bi bi-arrow-right"></i>
              </button>
              <button class="btn-favorite ${isFavori ? "active" : ""}" 
                      data-recipe-id="${index}"
                      aria-label="${
                        isFavori ? "Retirer des favoris" : "Ajouter aux favoris"
                      }">
                ${isFavori ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>
      </div>
      `;
    })
  );
}

// ==================== GESTION DES MODALS ====================
function displayRecipeModal(recipe) {
  if (!recipe) {
    console.error("Aucune donnée de recette reçue");
    return;
  }

  // Fermeture propre du modal existant s'il y en a un
  const existingModal = bootstrap.Modal.getInstance(
    document.getElementById("recipeModal")
  );
  if (existingModal) {
    existingModal.hide();
    $(".modal-backdrop").remove(); // Suppression explicite du backdrop
    $("body").removeClass("modal-open"); // Réactivation du scroll
  }

  // Remplissage du modal
  $("#recipeTitle").text(recipe.nom);
  $("#recipeImage").attr("src", `${BASE_PATH}${recipe.images}`);
  $("#recipeCategory").text(`Catégorie: ${recipe.categorie}`);
  $("#recipeTime").text(`Temps: ${recipe.temps_preparation}`);

  // Correction du chemin de l'image
  let imagePath = recipe.images || "";
  if (imagePath.startsWith("http")) {
    // Si c'est déjà une URL complète, on l'utilise telle quelle
    $("#recipeImage").attr("src", imagePath);
  } else {
    // Sinon on construit le chemin correctement
    $("#recipeImage").attr(
      "src",
      `${BASE_PATH}${imagePath.replace(/^\//, "")}`
    );
  }

  // Gestion sécurisée des ingrédients
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  // Ingédients

  $("#recipeIngredients").html(
    ingredients
      .map((ing) => {
        if (typeof ing === "string") return `<li>${ing}</li>`;
        if (ing && ing.nom) return `<li>${ing.nom} ${ing.quantite || ""}</li>`;
        return "";
      })
      .join("") || "<li>Aucun ingrédient spécifié</li>"
  );

  // Étapes
  const etapes = Array.isArray(recipe.etapes) ? recipe.etapes : [];

  $("#recipeSteps").html(
    etapes
      .map((step, i) => `<li>${step || `Étape ${i + 1} non spécifiée`}</li>`)
      .join("") || "<li>Aucune étape de préparation spécifiée</li>"
  );

  // Ouverture du modal
  new bootstrap.Modal("#recipeModal").show();
}

function setupModalHandlers() {
  $(document).on(
    "click",
    ".btn-view-recipe, .list-group-item-action",
    async function (e) {
      e.preventDefault();
      showLoader();

      try {
        const recipeId = $(this).data("recipe-id");
        const response = await fetch(`${BASE_PATH}data/data.json`);

        if (!response.ok) throw new Error("Erreur de chargement des données");

        const data = await response.json();
        const recipe =
          recipeId !== undefined
            ? data.recettes[recipeId]
            : JSON.parse($(this).data("recipe"));

        if (!recipe) throw new Error("Recette introuvable");

        displayRecipeModal(recipe);
      } catch (error) {
        console.error("Erreur:", error);
        showError("Impossible d'afficher la recette");
      } finally {
        hideLoader();
      }
    }
  );
}

// ==================== GESTION DES FAVORIS ====================

function toggleFavori(recipe) {
  if (!recipe) return false;

  const favoris = JSON.parse(localStorage.getItem("favoris") || []);
  const index = favoris.findIndex((f) => f.nom === recipe.nom);

  if (index === -1) {
    // Ne stocke que le strict nécessaire
    favoris.push({
      nom: recipe.nom,
      // Ajoutez ici d'autres identifiants uniques si nécessaire
    });
  } else {
    favoris.splice(index, 1);
  }

  localStorage.setItem("favoris", JSON.stringify(favoris));
  return index === -1;
}

function initFavorisButtons() {
  $(document).on("click", ".btn-favorite", async function () {
    const $btn = $(this);
    const recipeId = $btn.data("recipe-id");

    try {
      const data = await fetchRecipes();
      const recipe = data.recettes[recipeId];
      if (!recipe) return;

      // Bascule l'état et met à jour l'interface
      const isNowFavori = toggleFavori(recipe);
      $btn.toggleClass("active", isNowFavori);
      $btn.html(isNowFavori ? "♥" : "♡");
      $btn.attr(
        "aria-label",
        isNowFavori ? "Retirer des favoris" : "Ajouter aux favoris"
      );

      updateMegaMenu();
    } catch (error) {
      console.error("Erreur gestion favori:", error);
    }
  });
}

// ==================== MEGA MENU ====================
async function updateMegaMenu() {
  try {
    const data = await fetchRecipes();
    const recipes = data.recettes || [];
    const favoris = JSON.parse(localStorage.getItem("favoris") || "[]");

    console.log("Recettes chargées:", recipes.length);
    console.log("Favoris trouvés:", favoris);

    // Section Recettes
    const $recipesList = $("#recipes-list").empty();
    $recipesList.append(
      $('<a class="list-group-item text-uppercase fw-bold"></a>')
        .attr("href", `${BASE_PATH}pages/recipes.html`)
        .text("Toutes les recettes")
    );

    recipes.forEach((recipe) => {
      $recipesList.append(
        $('<a class="list-group-item list-group-item-action"></a>')
          .attr("href", "#")
          .data("recipe", JSON.stringify(recipe))
          .text(recipe.nom)
          .on("click", function (e) {
            e.preventDefault();
            displayRecipeModal(recipe);
          })
      );
    });

    // Section Favoris
    const $favoritesList = $("#favorites-list").empty();
    $favoritesList.append(
      $('<a class="list-group-item text-uppercase fw-bold"></a>')
        .attr("href", `${BASE_PATH}pages/favorites.html`)
        .text("Mes recettes favorites")
    );

    if (favoris.length === 0) {
      $favoritesList.append(
        $('<div class="list-group-item text-muted"></div>').text("Aucun favori")
      );
    } else {
      favoris.forEach((fav) => {
        // Recherche de la recette complète correspondante
        const completeRecipe = recipes.find((r) => r.nom === fav.nom);
        if (completeRecipe) {
          $favoritesList.append(
            $('<a class="list-group-item list-group-item-action"></a>')
              .attr("href", "#")
              .data("recipe", JSON.stringify(completeRecipe))
              .text(completeRecipe.nom)
              .on("click", function (e) {
                e.preventDefault();
                displayRecipeModal(completeRecipe);
              })
          );
        } else {
          console.warn("Favori introuvable dans les recettes:", fav.nom);
        }
      });
    }
  } catch (error) {
    console.error("Erreur updateMegaMenu:", error);
  }
}
// ==================== RECHERCHE/AUTOCOMPLETE ====================
function initSearch() {
  const searchInput = $("#search");
  const suggestionsBox = $("#suggestions");
  let allRecipes = [];

  // Chargement initial
  fetchRecipes()
    .then((data) => (allRecipes = data.recettes || []))
    .catch((error) => console.error("Erreur chargement recettes:", error));

  // Gestion de l'input
  searchInput.on("input", function () {
    const query = $(this).val().toLowerCase().trim();
    suggestionsBox.empty();

    if (query.length >= 1 && allRecipes.length > 0) {
      const filtered = allRecipes.filter((recette) =>
        recette.nom.toLowerCase().includes(query)
      );

      filtered.slice(0, 5).forEach((recette) => {
        suggestionsBox.append(
          $('<div class="suggestion-item"></div>')
            .text(recette.nom)
            .on("click", () => {
              searchInput.val(recette.nom);
              suggestionsBox.empty();
              displayRecipeModal(recette);
            })
        );
      });
    }
  });

  // Fermeture des suggestions
  $(document).on("click", (e) => {
    if (!$(e.target).closest(".autocomplete").length) {
      suggestionsBox.empty();
    }
  });
}

// ==================== INITIALISATION ====================
async function initApp() {
  try {
    console.log("Initialisation en cours...");
    showLoader();

    const data = await fetchRecipes();
    displayRecipeCards(data.recettes || []);
    setupModalHandlers();
    initFavorisButtons();
    updateMegaMenu();
    initSearch();

    console.log("Application prête");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showError("Une erreur est survenue lors du chargement");
  } finally {
    hideLoader();
  }
}

// Lancement de l'application
$(document).ready(() => {
  console.log("Document prêt - Initialisation");
  initApp();
});

const favoris = JSON.parse(localStorage.getItem("favoris") || []);
console.log("Favoris dans le localStorage:", favoris);
