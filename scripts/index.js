// Configuration du chemin de base
const BASE_PATH = window.location.pathname.includes("happyMeal")
  ? "/happymeal/"
  : "/";

$(document).ready(function () {
  console.log("Document prêt - Initialisation");
  initApp();
});

// Initialisation globale de l'application
async function initApp() {
  try {
    console.log("Initialisation en cours...");
    await loadRecipes();
    await afficherRecettesAleatoires();
    initViewRecipeButtons(); // Nouvelle fonction séparée
    initFavorisButtons();
    updateMegaMenu();
    gererRecherche();
    console.log("Initialisation terminée avec succès");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showErrorToUser();
  }
}
$(document).on("click", ".btn-voir-recette", function () {
  try {
    const recipeData = JSON.parse($(this).data("recipe"));
    openRecipeModal(recipeData);
  } catch (e) {
    console.error("Erreur:", e);
  }
});

function showErrorToUser() {
  $("#cartes-recettes").html(`
    <div class="alert alert-danger">
      Une erreur est survenue lors du chargement des recettes.
    </div>
  `);
}

// Chargement des recettes pour le menu
async function loadRecipes() {
  try {
    const response = await fetch("data/data.json");
    const data = await response.json();
    const $recipeList = $("#recipes-list");
    $recipeList.empty();

    $recipeList.append(
      $("<a>")
        .addClass("list-group-item text-uppercase fw-bold")
        .attr("href", "pages/recipe.html")
        .text("Toutes les recettes")
    );

    data.recettes.forEach((recette) => {
      $recipeList.append(
        $("<a>")
          .addClass("list-group-item list-group-item-action")
          .attr("href", "#")
          .data(
            "recipe",
            JSON.stringify({
              ...recette,
              images: recette.images,
            })
          )
          .text(recette.nom)
          .on("click", function (e) {
            e.preventDefault();
            openRecipeModal(JSON.parse($(this).data("recipe")));
          })
      );
    });
  } catch (error) {
    console.error("Erreur loadRecipes:", error);
    $("#recipes-list").html(
      '<p class="text-danger">Erreur de chargement des recettes</p>'
    );
  }
}

// Affichage des recettes aléatoires
async function afficherRecettesAleatoires() {
  try {
    console.log("Génération des cartes aléatoires...");
    const response = await fetch("data/data.json");
    const data = await response.json();
    const recettes = data.recettes;

    const shuffled = [...recettes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const $container = $("#cartes-recettes");
    $container.empty();

    selected.forEach((recette) => {
      const isFavori = (JSON.parse(localStorage.getItem("favoris")) || []).some(
        (f) => f.nom === recette.nom
      );

      const ingredients = Array.isArray(recette.ingredients)
        ? recette.ingredients.map((i) =>
            typeof i === "string" ? i : i.nom || ""
          )
        : [];

      // Sérialisation sécurisée
      const safeRecipeData = JSON.stringify({
        ...recette,
        images: recette.images || "", // Garantit que images existe
      }).replace(/"/g, "'"); // Remplace les guillemets doubles par simples

      const cardHTML = `
        <div class="card" style="width: 18rem;">
          <div class="card-header d-flex justify-content-between">
            <div>
              <span class="badge bg-secondary">${
                recette.categorie || "Non classé"
              }</span>
              <span class="badge bg-light text-dark ms-2">${
                recette.temps_preparation || "N/A"
              }</span>
            </div>
            <button class="btn-favori ${isFavori ? "active" : ""}" data-nom="${
        recette.nom
      }">
              ${isFavori ? "♥" : "♡"}
            </button>
          </div>
          <div class="card-body">
            <img src="${fixImagePath(
              recette.images
            )}" class="card-img-top" alt="${
        recette.nom
      }" style="height: 180px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${recette.nom}</h5>
              <p class="card-text text-muted flex-grow-1">
                ${ingredients.slice(0, 3).join(", ")}...
              </p>
        <button class="btn btn-outline-primary btn-voir-recette mt-auto" 
            data-recipe='${safeRecipeData}'>
      Voir la recette
    </button>

</div>
          </div>
        </div>
      `;
      $container.append(cardHTML);
    });
  } catch (error) {
    console.error("Erreur:", error);
    $("#cartes-recettes").html(`
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle"></i>
        Impossible de charger les recettes. Veuillez réessayer.
      </div>
    `);
  }
}

// Correction des chemins d'images
function fixImagePath(path) {
  if (!path) return "";
  return path.startsWith("../") ? path.substring(3) : path;
}

// Initialisation des boutons "Voir recette" (NOUVEAU)

function initViewRecipeButtons() {
  $(document).on("click", ".btn-voir-recette", function () {
    try {
      const rawData = $(this).attr("data-recipe"); // Utilisez attr() au lieu de data()
      if (!rawData) throw new Error("Aucune donnée de recette trouvée");

      const recipeData = JSON.parse(rawData);
      if (!recipeData) throw new Error("Parsing a échoué");

      openRecipeModal(recipeData);
    } catch (e) {
      console.error("Erreur:", e);
      // Fallback avec les données visibles de la carte
      const card = $(this).closest(".card");
      openRecipeModal({
        nom: card.find(".card-title").text(),
        categorie: card.find(".badge.bg-secondary").text(),
        temps_preparation: card.find(".badge.bg-light").text(),
        ingredients: [],
        etapes: [],
      });
    }
  });
}
// Initialisation des boutons favoris
function initFavorisButtons() {
  $(document).on("click", ".btn-favori", function () {
    const card = $(this).closest(".card");
    const recetteData = {
      nom: card.find(".card-title").text(),
      categorie: card.find(".badge:first").text(),
      images: card.find("img").attr("src"),
      temps_preparation: card.find(".badge:last").text().trim(),
      ingredients: JSON.parse(card.find(".btn-voir-recette").data("recipe"))
        .ingredients,
    };

    toggleFavori(recetteData);
    $(this).toggleClass("active");
    $(this).html($(this).hasClass("active") ? "♥" : "♡");
    updateMegaMenu();
  });
}

// Gestion des favoris
function toggleFavori(recette) {
  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  const index = favoris.findIndex((f) => f.nom === recette.nom);

  if (index === -1) {
    favoris.push(recette);
  } else {
    favoris.splice(index, 1);
  }

  localStorage.setItem("favoris", JSON.stringify(favoris));
}

// Mise à jour du méga menu
async function updateMegaMenu() {
  try {
    const response = await fetch("data/data.json");
    const data = await response.json();
    const $favoriteslist = $("#favorites-list");
    const favoris = JSON.parse(localStorage.getItem("favoris") || "[]");

    // On vide la liste et on ajoute le titre
    $favoriteslist
      .empty()
      .append(
        $("<a>")
          .addClass("list-group-item text-uppercase fw-bold")
          .attr("href", "pages/favorites.html")
          .text("Mes recettes favorites")
      );

    // Si pas de favoris
    if (favoris.length === 0) {
      $favoriteslist.append(
        $('<a class="list-group-item text-muted">Aucun favori</a>')
      );
      return;
    }

    // Ajout des favoris
    favoris.forEach((fav) => {
      const completeRecipe = data.recettes.find((r) => r.nom === fav.nom) || {
        ...fav,
        ingredients: [],
        etapes: [],
      };

      $favoriteslist.append(
        $('<a class="list-group-item list-group-item-action"></a>')
          .attr("href", "#")
          .data("recipe", JSON.stringify(completeRecipe))
          .text(completeRecipe.nom)
          .on("click", (e) => {
            e.preventDefault();
            openRecipeModal(completeRecipe);
          })
      );
    });
  } catch (error) {
    console.error("Erreur updateMegaMenu:", error);
  }
}
// Gestion de la recherche
function gererRecherche() {
  const searchInput = $("#search");
  const suggestionsBox = $("#suggestions");
  let allRecipes = [];

  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      allRecipes = data.recettes;
    })
    .catch((error) => console.error("Erreur chargement recettes:", error));

  searchInput.on("input", function () {
    const query = $(this).val().toLowerCase().trim();
    suggestionsBox.empty();

    if (query.length >= 1) {
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

  $(document).on("click", (e) => {
    if (!$(e.target).closest(".autocomplete").length) {
      suggestionsBox.empty();
    }
  });
}

// Ouverture du modal
function openRecipeModal(recipe) {
  if (!recipe) {
    console.error("Aucune donnée de recette reçue");
    return;
  }

  const safeRecipe = {
    nom: recipe.nom || "Recette sans nom",
    images: recipe.images || "",
    categorie: recipe.categorie || "Non spécifié",
    temps_preparation: recipe.temps_preparation || "N/A",
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    etapes: Array.isArray(recipe.etapes) ? recipe.etapes : [],
  };

  // Gestion des chemins d'images
  function getImagePath(img) {
    // Vérification complète de l'input
    if (!img || typeof img !== "string") return "";

    // Gestion des chemins
    if (img.startsWith("http")) return img;
    if (img.startsWith("assets/")) return img;

    return `assets/img_recipes/${img}`;
  }

  // Mise à jour du modal
  $("#recipeTitle").text(safeRecipe.nom);
  $("#recipeImage").attr("src", getImagePath(safeRecipe.images)).show();
  $("#recipeCategory").text(safeRecipe.categorie);
  $("#recipeTime").text(safeRecipe.temps_preparation);

  // Ingrédients formatés
  const formatIngredient = (i) =>
    typeof i === "string" ? i : `${i.nom} ${i.quantite || ""}`.trim();

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map(formatIngredient).filter(Boolean)
    : [];

  $("#recipeIngredients").html(
    ingredients
      .map(
        (i) => `
      <li class="d-flex align-items-start mb-2">
        <span class="bullet me-2 text-primary">•</span>
        <span>${i}</span>
      </li>
    `
      )
      .join("") || "<li>Aucun ingrédient spécifié</li>"
  );

  // Étapes formatées
  const steps = Array.isArray(recipe.etapes)
    ? recipe.etapes
    : ["Aucune étape spécifiée"];

  $("#recipeSteps").html(
    steps
      .map(
        (step, i) => `
      <li class="mb-3">
        <strong>Étape ${i + 1}:</strong>
        <span class="d-block mt-1">${step}</span>
      </li>
    `
      )
      .join("")
  );

  // Affichage du modal
  new bootstrap.Modal("#recipeModal").show();
}

// Modification de initViewRecipeButtons()
function initViewRecipeButtons() {
  $(document).on("click", ".btn-voir-recette", function () {
    try {
      let recipeData;
      const rawData = $(this).data("recipe");

      // Gestion des deux formats de données (string ou déjà parsé)
      if (typeof rawData === "string") {
        recipeData = JSON.parse(rawData);
      } else {
        recipeData = rawData;
      }

      console.log("Data recette:", recipeData);
      openRecipeModal(recipeData);
    } catch (e) {
      console.error("Erreur parsing:", e);
      const card = $(this).closest(".card");
      openRecipeModal({
        nom: card.find(".card-title").text(),
        categorie: card.find(".badge.bg-secondary").text(),
        temps_preparation: card.find(".badge.bg-light").text(),
        ingredients: [],
        etapes: [],
      });
    }
  });
}
