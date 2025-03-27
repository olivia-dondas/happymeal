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
async function loadRecipes() {
  try {
    const response = await fetch("../data/data.json");
    if (!response.ok)
      throw new Error("Erreur lors du chargement du fichier JSON");
    const data = await response.json();
    const recipes = data.recettes || [];

    const container = document.getElementById("recipe-container");
    if (!container) {
      console.error("Le conteneur recipe-container n'existe pas");
      return;
    }
    container.innerHTML = "";

    recipes.forEach((recipe) => {
      const recipeDiv = document.createElement("div");
      recipeDiv.className = "entrée";

      const title = document.createElement("h3");
      title.textContent = recipe.nom;

      const category = document.createElement("p");
      category.textContent = `Catégorie : ${recipe.categorie}`;

      const time = document.createElement("p");
      time.textContent = `Temps de préparation : ${recipe.temps_preparation}`;

      const ingredients = document.createElement("ul");
      ingredients.textContent = "Ingrédients :";
      recipe.ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = `${ingredient.nom} - ${ingredient.quantite}`;
        ingredients.appendChild(li);
      });

      const steps = document.createElement("ol");
      steps.textContent = "Étapes :";
      recipe.etapes.forEach((etape) => {
        const li = document.createElement("li");
        li.textContent = etape;
        steps.appendChild(li);
      });

      recipeDiv.appendChild(title);
      recipeDiv.appendChild(category);
      recipeDiv.appendChild(time);
      recipeDiv.appendChild(ingredients);
      recipeDiv.appendChild(steps);

      container.appendChild(recipeDiv);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error);
  }
}

// Charger le menu
async function loadMenu() {
  try {
    const response = await fetch("../data/pagination.json");
    if (!response.ok)
      throw new Error("Erreur lors du chargement du fichier JSON");
    const data = await response.json();
    const items = data.recipes || [];

    const container = document.getElementById("menu-container");
    if (!container) {
      console.error("Le conteneur menu-container n'existe pas");
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
