$(document).ready(function () {
  initApp();
});

// Initialisation globale de l'application
function initApp() {
  loadRecipes();
  afficherRecettesAleatoires();
  gererRecherche();
}

// Chargement des recettes pour le menu déroulant
function loadRecipes() {
  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      const $recipeList = $("#recipes-list");

      // Titre de la section
      $recipeList.append(
        $("<p>")
          .addClass("list-group-item text-uppercase fw-bold")
          .text("Toutes les recettes")
      );

      // Vérification et affichage des recettes
      if (data.recettes && Array.isArray(data.recettes)) {
        data.recettes.forEach((recette) => {
          $recipeList.append(
            $("<a>")
              .addClass("list-group-item list-group-item-action")
              .attr(
                "href",
                `pages/recipe.html?nom=${encodeURIComponent(recette.nom)}`
              )
              .text(recette.nom)
          );
        });
      } else {
        console.error("Format JSON invalide.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des recettes:", error);
    });
}

// Fonction pour charger les recettes depuis le fichier JSON
async function chargerRecettes() {
  try {
    const response = await fetch("data/data.json");
    const data = await response.json();
    return data.recettes || [];
  } catch (error) {
    console.error("Erreur de chargement des recettes :", error);
    return [];
  }
}

// Mélanger un tableau aléatoirement
function melangerTableau(tableau) {
  return tableau.sort(() => Math.random() - 0.5);
}

// Affichage des recettes aléatoires sur la page d'accueil
async function afficherRecettesAleatoires() {
  const recettes = await chargerRecettes();
  const recettesSelectionnees = melangerTableau([...recettes]).slice(0, 3);
  const container = $("#cartes-recettes");

  container.empty();

  recettesSelectionnees.forEach((recette) => {
    const isFavori = (JSON.parse(localStorage.getItem("favoris")) || []).some(
      (f) => f.nom === recette.nom
    );

    const card = `
      <div class="card" style="width: 18rem;">
        <div class="card-header d-flex justify-content-between">
          <div>
            <span class="badge bg-secondary">${recette.categorie}</span>
            <span class="badge bg-light text-dark ms-2">${
              recette.temps_preparation
            }</span>
          </div>
          <button class="btn-favori ${isFavori ? "active" : ""}" data-nom="${
      recette.nom
    }">
            ${isFavori ? "♥" : "♡"}
          </button>
        </div>
        <div class="card-body">
          <img src="${recette.images}" class="card-img-top" alt="${
      recette.nom
    }">
          <h5 class="card-title">${recette.nom}</h5>
          <p class="card-text">${recette.ingredients
            .slice(0, 3)
            .map((i) => i.nom || i)
            .join(", ")}...</p>
          <a href="pages/recipe.html?nom=${encodeURIComponent(
            recette.nom
          )}" class="btn btn-primary">Voir la recette</a>
        </div>
      </div>
    `;
    container.append(card);
  });
}

// Gestion de la barre de recherche
async function gererRecherche() {
  const searchInput = document.querySelector(".navbar #search");
  const suggestionsBox = document.querySelector(".navbar #suggestions");

  if (!searchInput || !suggestionsBox) {
    console.error(
      "Les éléments de recherche ou de suggestions sont introuvables."
    );
    return;
  }

  const recettes = await chargerRecettes();

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    suggestionsBox.innerHTML = "";

    if (query.length === 0) return;

    const filteredRecettes = recettes.filter((recette) =>
      recette.nom.toLowerCase().includes(query)
    );

    filteredRecettes.forEach((recette) => {
      const div = document.createElement("div");
      div.textContent = recette.nom;
      div.classList.add("suggestion-item");
      div.style.cursor = "pointer";
      div.addEventListener("click", function () {
        searchInput.value = recette.nom;
        suggestionsBox.innerHTML = "";
      });
      suggestionsBox.appendChild(div);
    });
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
    };

    toggleFavori(recetteData);
    $(this).toggleClass("active");
    $(this).html($(this).hasClass("active") ? "♥" : "♡");
  });
}

// Ajout/retrait des favoris
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

function updateMegaMenu() {
  // On récupère l'élément de la liste des favoris dans le méga menu
  const favorisList = document.getElementById("favoris-list");
  if (!favorisList) {
    console.warn("Élément 'favoris-list' introuvable dans le méga menu.");
    return;
  }

  // On vide la liste des favoris avant de la mettre à jour
  favorisList.innerHTML = "";

  // On récupère les favoris du localStorage via le manager
  const favoris = favorisManager.getFavoris();

  // Si aucun favori, on affiche un message dans le méga menu
  if (favoris.length === 0) {
    favorisList.innerHTML = "<p>Aucun favori ajouté.</p>";
    return;
  }

  // Pour chaque favori, on crée un lien dans le méga menu
  favoris.forEach((fav) => {
    const item = document.createElement("a");
    item.href = `pages/recipe.html?nom=${encodeURIComponent(fav.nom)}`;
    item.textContent = fav.nom;
    item.classList.add("list-group-item", "list-group-item-action");
    favorisList.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", initFavorisButtons);
