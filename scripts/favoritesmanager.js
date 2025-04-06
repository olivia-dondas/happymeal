class FavorisManager {
  constructor() {
    this.favorisKey = "favoris";
    this.initEventListeners();
  }

  getFavoris() {
    return JSON.parse(localStorage.getItem(this.favorisKey)) || [];
  }

  saveFavoris(favoris) {
    localStorage.setItem(this.favorisKey, JSON.stringify(favoris));
    this.dispatchUpdateEvent();
  }

  isFavori(nom) {
    return this.getFavoris().some((fav) => fav.nom === nom);
  }

  toggleFavori(recette) {
    const favoris = this.getFavoris();
    const index = favoris.findIndex((fav) => fav.nom === recette.nom);

    if (index === -1) {
      favoris.push(this.validateRecipeData(recette));
    } else {
      favoris.splice(index, 1);
    }

    this.saveFavoris(favoris);
    return index === -1;
  }

  validateRecipeData(recipe) {
    return {
      nom: recipe.nom || "Sans nom",
      images: recipe.images || "assets/img_recipes/default.png",
      ingredients: recipe.ingredients || [],
      categorie: recipe.categorie || "Non classé",
      temps_preparation: recipe.temps_preparation || "N/A",
    };
  }

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  }

  initEventListeners() {
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("btn-favori")) {
        const button = event.target;
        const card = button.closest(".card");
        const recette = {
          nom: card.querySelector(".card-title").textContent,
          categorie: button.closest(".card-header").querySelector(".badge")
            .textContent,
          images: card.querySelector("img").src,
          temps_preparation: button
            .closest(".card-header")
            .querySelectorAll(".badge")[1].textContent,
        };

        const isNowFavorite = this.toggleFavori(recette);
        button.classList.toggle("active", isNowFavorite);
        button.innerHTML = isNowFavorite ? "♥" : "♡";
      }
    });
  }

  updateMegaMenu() {
    const favorisList = document.getElementById("favorites-list");
    if (!favorisList) return;

    favorisList.innerHTML = "";
    const favoris = this.getFavoris();

    const title = document.createElement("a");
    title.className = "list-group-item text-uppercase fw-bold";
    title.href = "pages/favorites.html";
    title.textContent = "Mes recettes favorites";
    favorisList.appendChild(title);

    if (favoris.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "list-group-item text-muted";
      emptyMsg.textContent = "Aucun favori ajouté";
      favorisList.appendChild(emptyMsg);
    } else {
      favoris.forEach((fav) => {
        const item = document.createElement("a");
        item.className = "list-group-item list-group-item-action";
        item.href = "#";
        item.textContent = fav.nom;
        item.onclick = (e) => {
          e.preventDefault();
          this.openFavoriteModal(fav); // Nouvelle méthode
        };
        favorisList.appendChild(item);
      });
    }
  }

  openFavoriteModal(fav) {
    // Crée un événement personnalisé pour ouvrir le modal
    const event = new CustomEvent("openRecipeModal", { detail: fav });
    window.dispatchEvent(event);
  }

  updateHearts() {
    document.querySelectorAll(".btn-favori").forEach((button) => {
      const recetteNom = button.getAttribute("data-nom");
      button.classList.toggle("active", this.isFavori(recetteNom));
      button.innerHTML = this.isFavori(recetteNom) ? "♥" : "♡";
    });
  }
}

// Instance globale
const favorisManager = new FavorisManager();

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
  favorisManager.updateMegaMenu();
  favorisManager.updateHearts();

  // Écoute des mises à jour
  window.addEventListener("favoritesUpdated", () => {
    favorisManager.updateMegaMenu();
    favorisManager.updateHearts();
  });
});

// Compatibilité avec l'ancien code
window.FavoritesManager = favorisManager;
