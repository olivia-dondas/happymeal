document.addEventListener("DOMContentLoaded", function () {
  // Initialisation
  if (typeof favorisManager !== "undefined") {
    displayFavorites();
  } else {
    document.addEventListener("favoritesManagerReady", displayFavorites);
  }

  // Écouteur pour les interactions
  document.addEventListener("click", function(event) {
    // Gestion des boutons favoris
    if (event.target.closest(".btn-favori")) {
      const button = event.target.closest(".btn-favori");
      const card = button.closest(".card");
      const recette = {
        nom: card.querySelector(".card-title").textContent,
        categorie: card.querySelector(".badge").textContent,
        image: card.querySelector("img").src.split('/').pop(),
        temps_preparation: card.querySelector(".text-muted span:last-child").textContent.trim()
      };

      favorisManager.toggleFavori(recette);
      updateInterface();
    }
    
    // Gestion de l'ouverture du modal
    if (event.target.closest(".btn-view-recipe") || 
        (event.target.closest(".recipe-card") && !event.target.closest(".btn-favori"))) {
      const card = event.target.closest(".recipe-card");
      const recetteData = JSON.parse(card.dataset.recette);
      openRecipeModal(recetteData);
    }
  });

  updateMegaMenu();
  updateHearts();
});

function displayFavorites() {
  const container = document.getElementById("favorisContainer");
  const emptyMsg = document.getElementById("empty-message") || { style: {} };

  if (!emptyMsg) {
    console.error("L'élément 'empty-message' n'a pas été trouvé dans le DOM.");
    return;
  }

  const favoris = favorisManager.getFavoris();

  if (favoris.length === 0) {
    emptyMsg.textContent = "Vous n'avez aucune recette favorite pour le moment.";
    emptyMsg.classList.remove("alert-info");
    emptyMsg.classList.add("alert-warning");
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  fetch("../data/data.json")
    .then((response) => response.json())
    .then((data) => {
      container.innerHTML = favoris.map(favori => {
        const recette = data.recettes.find((r) => r.nom === favori.nom);
        if (!recette) return '';
        
        return `
          <div class="col-md-6 col-lg-4 mb-4 recipe-card" data-recette='${JSON.stringify(recette)}'>
            <div class="card h-100 shadow-sm">
              <img src="../assets/img_recettes/${recette.image || 'default.png'}" 
                   class="card-img-top" 
                   alt="${recette.nom}"
                   style="height: 180px; object-fit: cover;"
                   onerror="this.src='../assets/img_recettes/default.png'">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${recette.nom}</h5>
                <p class="text-muted mb-3">
                  <span class="badge bg-secondary">${recette.categorie}</span>
                  <span class="ms-2">${recette.temps_preparation}</span>
                </p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <button class="btn btn-primary btn-sm btn-view-recipe">
                    Voir la recette
                  </button>
                  <button class="btn-favori btn btn-sm ${favorisManager.isFavori(recette.nom) ? 'btn-danger' : 'btn-outline-danger'}" 
                          data-nom="${recette.nom}">
                    ${favorisManager.isFavori(recette.nom) ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    })
    .catch((error) => {
      console.error("Erreur:", error);
      emptyMsg.textContent = "Une erreur est survenue lors du chargement des recettes.";
      emptyMsg.classList.remove("alert-info");
      emptyMsg.classList.add("alert-danger");
      emptyMsg.style.display = "block";
    });
}

function openRecipeModal(recette) {
  // Création du modal identique à recipe.html
  const modalContent = `
    <div class="modal fade" id="recipeModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title">${recette.nom}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <img src="../assets/img_recettes/${recette.image || 'default.png'}" 
                     class="img-fluid rounded mb-3" 
                     alt="${recette.nom}"
                     onerror="this.src='../assets/img_recettes/default.png'">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge bg-primary">${recette.categorie}</span>
                  <span class="text-muted"><i class="far fa-clock me-1"></i>${recette.temps_preparation}</span>
                </div>
                <div class="ingredients-section">
                  <h6 class="border-bottom pb-2">Ingrédients</h6>
                  <ul class="list-group list-group-flush">
                    ${recette.ingredients?.map(ing => `
                      <li class="list-group-item d-flex justify-content-between align-items-start">
                        <div class="ms-2 me-auto">
                          <div class="fw-bold">${ing.nom}</div>
                        </div>
                        <span class="badge bg-primary rounded-pill">${ing.quantite}</span>
                      </li>
                    `).join('') || '<li class="list-group-item">Aucun ingrédient spécifié</li>'}
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="instructions-section">
                  <h6 class="border-bottom pb-2">Instructions</h6>
                  <ol class="list-group list-group-numbered list-group-flush">
                    ${recette.instructions?.map((step, index) => `
                      <li class="list-group-item d-flex">
                        <div class="ms-2 me-auto">
                          <span class="fw-bold">Étape ${index + 1}</span>
                          <div>${step}</div>
                        </div>
                      </li>
                    `).join('') || '<li class="list-group-item">Aucune instruction spécifiée</li>'}
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i> Fermer
            </button>
            <button class="btn ${favorisManager.isFavori(recette.nom) ? 'btn-danger' : 'btn-outline-danger'} btn-favori-modal"
                    data-nom="${recette.nom}">
              <i class="${favorisManager.isFavori(recette.nom) ? 'fas' : 'far'} fa-heart me-1"></i>
              ${favorisManager.isFavori(recette.nom) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Injection du modal
  const modalContainer = document.getElementById('modal-container') || document.body;
  const existingModal = document.getElementById('recipeModal');
  if (existingModal) existingModal.remove();
  
  modalContainer.insertAdjacentHTML('beforeend', modalContent);

  // Initialisation du modal Bootstrap
  const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
  recipeModal.show();

  // Gestion du bouton favori dans le modal
  document.querySelector('.btn-favori-modal')?.addEventListener('click', function() {
    favorisManager.toggleFavori(recette);
    recipeModal.hide();
    updateInterface();
  });

  // Nettoyage après fermeture
  document.getElementById('recipeModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

function updateInterface() {
  displayFavorites();
  updateMegaMenu();
  updateHearts();
}

function updateHearts() {
  document.querySelectorAll(".btn-favori").forEach((button) => {
    const recetteNom = button.getAttribute("data-nom");
    if (favorisManager.isFavori(recetteNom)) {
      button.innerHTML = "♥";
      button.classList.remove("btn-outline-danger");
      button.classList.add("btn-danger");
    } else {
      button.innerHTML = "♡";
      button.classList.add("btn-outline-danger");
      button.classList.remove("btn-danger");
    }
  });
}

class FavorisManager {
  constructor() {
    this.favorisKey = "favoris";
  }

  getFavoris() {
    return JSON.parse(localStorage.getItem(this.favorisKey)) || [];
  }

  saveFavoris(favoris) {
    localStorage.setItem(this.favorisKey, JSON.stringify(favoris));
  }

  isFavori(nom) {
    return this.getFavoris().some((fav) => fav.nom === nom);
  }

  toggleFavori(recette) {
    let favoris = this.getFavoris();
    const index = favoris.findIndex((fav) => fav.nom === recette.nom);

    if (index === -1) {
      favoris.push(recette);
    } else {
      favoris.splice(index, 1);
    }

    this.saveFavoris(favoris);
  }
}

const favorisManager = new FavorisManager();

function updateMegaMenu() {
  const favorisList = document.getElementById("favorites-list");
  if (!favorisList) return;

  favorisList.innerHTML = "";
  const favoris = favorisManager.getFavoris();

  if (favoris.length === 0) {
    favorisList.innerHTML = '<div class="list-group-item text-muted">Aucun favori ajouté</div>';
    return;
  }

  favoris.forEach((fav) => {
    const item = document.createElement("a");
    item.href = "#";
    item.textContent = fav.nom;
    item.classList.add("list-group-item", "list-group-item-action");
    item.onclick = (e) => {
      e.preventDefault();
      openRecipeModal(fav);
    };
    favorisList.appendChild(item);
  });
}

updateMegaMenu();