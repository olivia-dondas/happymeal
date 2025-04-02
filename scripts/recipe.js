$(document).ready(function () {
  initApp();
});

// Initialisation globale de l'application
function initApp() {
  chargerMenuRecettes();
  loadRecipes(); // Charge les recettes dans recipe-container
  loadMenu(); // Charge le menu dans menu-container
}

// Chargement des recettes pour le menu déroulant
function chargerMenuRecettes() {
  fetch("../data/data.json")
    .then((response) => {
      if (!response.ok)
        throw new Error("Erreur lors du chargement du fichier JSON");
      return response.json();
    })
    .then((data) => {
      const $recipeList = $("#recipes-list");

      $recipeList.append(
        $("<p>")
          .addClass(
            "list-group list-group-flush list-group-item-action text-uppercase fw-bold"
          )
          .text("Toutes les recettes")
      );

      if (data.recettes && Array.isArray(data.recettes)) {
        data.recettes.forEach((recette) => {
          $recipeList.append(
            $("<a>")
              .addClass("mb-0 list-group-item list-group-item-action")
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
    .catch((error) =>
      console.error("Erreur lors de la récupération des recettes:", error)
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
}

// Charger le menu
async function loadMenu() {
  try {
    const response = await fetch("../data/data.json");
    if (!response.ok)
      throw new Error("Erreur lors du chargement du fichier JSON");
    const data = await response.json();
    const items = data.recipes || [];

    const container = document.getElementById("recipe-container");

    if (!container) {
      console.error("Le conteneur recipe-container n'existe pas");
      return;
    }
    container.innerHTML = "";

    items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "entrée";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      img.width = 200;
      img.height = 200;

      const title = document.createElement("h3");
      title.textContent = item.title;

      const button = document.createElement("button");
      button.textContent = item.buttonText;
      button.className = "voir-plus-btn";

      itemDiv.appendChild(img);
      itemDiv.appendChild(title);
      itemDiv.appendChild(button);

      container.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des éléments :", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/data.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("❌ Erreur: Impossible de charger le fichier JSON !");
      }
      return response.json();
    })
    .then(data => {
      console.log("✅ JSON chargé avec succès :", data);

      const recettes = data.recettes;
      const container = document.getElementById("menu-container");

      if (!recettes || recettes.length === 0) {
        console.error("❌ Aucune recette trouvée !");
        container.innerHTML = "<p>Aucune recette disponible.</p>";
        return;
      }

      container.innerHTML = ""; // Nettoie le conteneur

      // Afficher les recettes sous forme de cards Bootstrap
      recettes.forEach((recette, index) => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
          <div class="card recipe-card" data-index="${index}">
            <img src="${recette.images}" class="card-img-top" alt="${recette.nom}">
            <div class="card-body">
              <h5 class="card-title">${recette.nom}</h5>
              <p class="card-text">Catégorie: ${recette.categorie}</p>
              <p class="card-text">Temps: ${recette.temps_preparation}</p>
              <button class="btn btn-primary open-modal">Voir la recette</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      setupModal(recettes);
    })
    .catch(error => console.error(error));
});

// ✅ Fonction pour afficher la recette dans le modal
function setupModal(recettes) {
  const modal = document.getElementById("recipeModal");
  const modalTitle = document.getElementById("recipeTitle");
  const modalImage = document.getElementById("recipeImage");
  const modalCategory = document.getElementById("recipeCategory");
  const modalTime = document.getElementById("recipeTime");
  const modalIngredients = document.getElementById("recipeIngredients");
  const modalSteps = document.getElementById("recipeSteps");
  const closeModal = document.querySelector(".close");

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("open-modal")) {
      const index = event.target.closest(".recipe-card").dataset.index;
      const recette = recettes[index];

      if (!recette) {
        console.error("❌ Recette introuvable !");
        return;
      }

      // Affichage des données dans le modal
      modalTitle.textContent = recette.nom;
      modalImage.src = recette.images;
      modalCategory.textContent = recette.categorie;
      modalTime.textContent = recette.temps_preparation;

      // Liste des ingrédients
      modalIngredients.innerHTML = "";
      recette.ingredients.forEach(ingredient => {
        const li = document.createElement("li");
        li.textContent = `${ingredient.nom} - ${ingredient.quantite}`;
        modalIngredients.appendChild(li);
      });

      // Étapes de la recette
      modalSteps.innerHTML = "";
      recette.etapes.forEach(etape => {
        const li = document.createElement("li");
        li.textContent = etape;
        modalSteps.appendChild(li);
      });

      modal.style.display = "block"; // Afficher le modal
    }
  });

  // Fermer le modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

