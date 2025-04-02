// Récupère tous les favoris
export const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favoris")) || [];
};

// Ajoute/retire une recette des favoris
export const toggleFavorite = (recipe) => {
  const favoris = getFavorites();
  const index = favoris.findIndex((f) => f.nom === recipe.nom);

  if (index === -1) {
    favoris.push(validateRecipeData(recipe));
  } else {
    favoris.splice(index, 1);
  }

  localStorage.setItem("favoris", JSON.stringify(favoris));
  dispatchFavoritesUpdatedEvent(); // Notification globale
};

// Valide la structure des données
const validateRecipeData = (recipe) => {
  return {
    nom: recipe.nom || "Sans nom",
    images: recipe.images || "assets/img_recipes/default.png",
    ingredients: recipe.ingredients || [],
    categorie: recipe.categorie || "Non classé",
    temps_preparation: recipe.temps_preparation || "N/A",
  };
};

// Événement personnalisé pour notifier les changements
const dispatchFavoritesUpdatedEvent = () => {
  window.dispatchEvent(new CustomEvent("favoritesUpdated"));
};
