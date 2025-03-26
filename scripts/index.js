$(document).ready(function () {
  // Chargement du fichier JSON local
  fetch("data/data.json") // Assure-toi que le fichier 'data.json' est dans le même répertoire que ton fichier HTML
    .then((response) => response.json())
    .then((data) => {
      const $recipeList = $("#recipe"); // Sélectionne l'élément où les recettes seront ajoutées

      // Crée un élément de titre pour les recettes
      const title = $("<p>")
        .addClass("mb-0 list-group-item text-uppercase fw-bold")
        .text("Toutes les recettes");
      $recipeList.append(title); // Ajoute le titre "Toutes les recettes"

      // Boucle sur les recettes et ajoute chaque recette comme un lien cliquable
      data.recettes.forEach((recette) => {
        const $link = $("<a>")
          .addClass("list-group-item list-group-item-action")
          .attr("href", "#") // Tu peux mettre un lien réel ici si nécessaire
          .text(recette.nom); // Affiche le nom de la recette
        $recipeList.append($link); // Ajoute chaque recette à la liste
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des recettes:", error);
    });
});
