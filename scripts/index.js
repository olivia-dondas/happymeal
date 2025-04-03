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
    initFavorisButtons();
    updateMegaMenu();
    gererRecherche();
    console.log("Initialisation terminée avec succès");
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    showErrorToUser();
  }
}

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
    console.log("Chargement des recettes...");
    const response = await fetch("data/data.json");
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

      // Gestion des ingrédients
      const ingredients = Array.isArray(recette.ingredients)
        ? recette.ingredients.map((i) =>
            typeof i === "string" ? i : i.nom || ""
          )
        : [];

      // Correction du chemin des images
      let imagePath = fixImagePath(recette.images);

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
            <img src="${imagePath}" class="card-img-top" alt="${
        recette.nom
      }" style="height: 180px; object-fit: cover;">
            <h5 class="card-title mt-2">${recette.nom}</h5>
            <p class="card-text">${ingredients.slice(0, 3).join(", ")}...</p>
            <button class="btn btn-primary btn-voir-recette" data-recipe='${JSON.stringify(
              recette
            )}'>
              Voir la recette
            </button>
          </div>
        </div>
      `;
      $container.append(cardHTML);
    });
  } catch (error) {
    console.error("Erreur afficherRecettesAleatoires:", error);
    $("#cartes-recettes").html(`
      <div class="alert alert-warning">
        Impossible de charger les recettes aléatoires
      </div>
    `);
  }
}

// Helper function pour corriger les chemins d'images
function fixImagePath(path) {
  if (!path) return "";
  return path.startsWith("../") ? path.substring(3) : path;
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
function updateMegaMenu() {
  const favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  const $favoritesList = $("#favorites-list").empty();

  // 1. Titre cliquable
  $favoritesList.append(
    $("<a>")
      .addClass("list-group-item text-uppercase fw-bold")
      .attr("href", "pages/favorites.html")
      .text("Mes recettes favorites")
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

// Gestion de la recherche
function gererRecherche() {
  const searchInput = $("#search");
  const suggestionsBox = $("#suggestions");

  // Charger les recettes une seule fois au démarrage
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

// Ouverture du modal
function openRecipeModal(recette) {
  try {
    // Gestion des ingrédients
    const ingredients = Array.isArray(recette.ingredients)
      ? recette.ingredients
          .map((i) => {
            if (typeof i === "string") return i;
            if (i.nom) return `${i.nom} ${i.quantite || ""}`.trim();
            return "";
          })
          .filter(Boolean)
      : [];

    // Correction du chemin de l'image
    let imagePath = fixImagePath(recette.images);

    // Mise à jour du modal
    $("#recipeModal #recipe-name").text(recette.nom || "Recette sans nom");
    $("#recipeModal #recipe-category").text(
      `Catégorie: ${recette.categorie || "Non spécifiée"}`
    );
    $("#recipeModal #recipe-prep-time").text(
      `Temps: ${recette.temps_preparation || "Non spécifié"}`
    );
    $("#recipeModal #recipe-image").attr("src", imagePath);
    $("#recipeModal #recipe-ingredients").html(
      ingredients.map((i) => `<li>${i}</li>`).join("") ||
        "Aucun ingrédient spécifié"
    );

    // Ajout des étapes de préparation si elles existent
    if (recette.etapes_preparation) {
      $("#recipeModal #recipe-steps").html(
        recette.etapes_preparation.map((step, i) => `<li>${step}</li>`).join("")
      );
    } else {
      $("#recipeModal #recipe-steps").html("<li>Aucune étape spécifiée</li>");
    }

    const modal = new bootstrap.Modal(document.getElementById("recipeModal"));
    modal.show();
  } catch (error) {
    console.error("Erreur openRecipeModal:", error);
    window.location.href = `pages/recipe.html?nom=${encodeURIComponent(
      recette.nom
    )}`;
  }
}

// Gestionnaire pour les boutons "Voir recette"
$(document).on("click", ".btn-voir-recette", function () {
  try {
    // Récupère et nettoie les données
    const recipeStr = $(this)
      .data("recipe")
      .replace(/\\"/g, '"') // Restaure les guillemets
      .replace(/\\'/g, "'") // Restaure les apostrophes
      .replace(/\\n/g, "\n"); // Restaure les sauts de ligne

    const recipeData = JSON.parse(recipeStr);
    openRecipeModal(recipeData);
  } catch (e) {
    console.error("Erreur parsing des données :", e);

    // Solution de repli SANS redirection
    const card = $(this).closest(".card");
    const fallbackData = {
      nom: card.find(".card-title").text(),
      categorie: card.find(".badge.bg-secondary").text(),
      ingredients: [],
      temps_preparation: card.find(".badge.bg-light").text(),
    };
    openRecipeModal(fallbackData);
  }
});
