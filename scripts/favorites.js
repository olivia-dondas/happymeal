document.addEventListener("DOMContentLoaded", function () {
  // Attendre que le gestionnaire de favoris soit chargé
  if (typeof favorisManager !== "undefined") {
    displayFavorites();
  } else {
    document.addEventListener("favoritesManagerReady", displayFavorites);
  }

  // Mettez à jour le menu des favoris au chargement de la page
  updateMegaMenu();
});

function displayFavorites() {
  const container = document.getElementById("favorisContainer");
  const emptyMsg = document.getElementById("empty-message");

  // Vérifier si l'élément empty-message existe
  if (!emptyMsg) {
    console.error("L'élément 'empty-message' n'a pas été trouvé dans le DOM.");
    return;
  }

  const favoris = favorisManager.getFavoris();

  if (favoris.length === 0) {
    emptyMsg.textContent =
      "Vous n'avez aucune recette favorite pour le moment.";
    emptyMsg.classList.remove("alert-info");
    emptyMsg.classList.add("alert-warning");
    emptyMsg.style.display = "block"; // Afficher le message
    return;
  }

  emptyMsg.style.display = "none"; // Cacher le message si des favoris sont présents

  // Charger toutes les recettes pour obtenir les détails complets
  fetch("../data/data.json")
    .then((response) => response.json())
    .then((data) => {
      container.innerHTML = "";

      favoris.forEach((favori) => {
        const recette = data.recettes.find((r) => r.nom === favori.nom);
        if (recette) {
          const col = document.createElement("div");
          col.className = "col-md-6 col-lg-4";
          col.innerHTML = `
                      <div class="card h-100">
                          <img src="${
                            recette.images
                          }" class="card-img-top" alt="${recette.nom}">
                          <div class="card-body">
                              <h5 class="card-title">${recette.nom}</h5>
                              <p class="text-muted">${recette.categorie} • ${
            recette.temps_preparation
          }</p>
                              <div class="d-flex justify-content-between align-items-center">
                                  <a href="../pages/recipe.html?nom=${encodeURIComponent(
                                    recette.nom
                                  )}" 
                                     class="btn btn-primary">
                                      Voir la recette
                                  </a>
                                  <button class="btn-favori active" 
                                          onclick="toggleFavori(${JSON.stringify(
                                            {
                                              nom: recette.nom,
                                              categorie: recette.categorie,
                                              images: recette.images,
                                              temps_preparation:
                                                recette.temps_preparation,
                                            }
                                          ).replace(/"/g, "&quot;")})">
                                      ♥
                                  </button>
                              </div>
                          </div>
                      </div>
                  `;
          container.appendChild(col);
        }
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      emptyMsg.textContent =
        "Une erreur est survenue lors du chargement des recettes.";
      emptyMsg.classList.remove("alert-info");
      emptyMsg.classList.add("alert-danger");
      emptyMsg.style.display = "block"; // Afficher le message d'erreur
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
    updateMegaMenu(); // Mettez à jour le méga menu après chaque ajout/suppression de favori
  }
}

const favorisManager = new FavorisManager();

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-favori")) {
      const button = event.target;
      const card = button.closest(".card");
      const recette = {
        nom: card.querySelector(".card-title").textContent,
        categorie: card.querySelector(".badge").textContent,
        images: card.querySelector("img").src,
        temps_preparation: card
          .querySelector(".badge:last-child")
          .textContent.trim(),
      };

      favorisManager.toggleFavori(recette);
      button.classList.toggle("active");
      button.innerHTML = button.classList.contains("active") ? "♥" : "♡";
    }
  });

  updateMegaMenu();
});

function updateMegaMenu() {
  const favorisList = document.getElementById("favorites-list");
  if (!favorisList) return;

  favorisList.innerHTML = "";
  const favoris = favorisManager.getFavoris();

  if (favoris.length === 0) {
    favorisList.innerHTML = "<p>Aucun favori ajouté.</p>";
    return;
  }

  favoris.forEach((fav) => {
    const item = document.createElement("a");
    item.href = `../pages/recipe.html?nom=${encodeURIComponent(fav.nom)}`;
    item.textContent = fav.nom;
    item.classList.add("list-group-item", "list-group-item-action");
    favorisList.appendChild(item);
  });
}
