const imagesPerPage = 4;
let currentPage = 1;
let recipes = [];

// Charger les données depuis le fichier JSON
fetch('../data/pagination.json')
    .then(response => response.json())
    .then(data => {
        recipes = data.recipes;
        displayRecipes();
        updatePaginationButtons();
    })
    .catch(error => console.error("Erreur lors du chargement des données:", error));

function displayRecipes() {
    const photoContainer = document.getElementById("photo-container");
    photoContainer.innerHTML = "";

    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const recipesToDisplay = recipes.slice(startIndex, endIndex);

    recipesToDisplay.forEach(recipe => {
        const recipeDiv = document.createElement("div");
        recipeDiv.className = "recipe";

        const img = document.createElement("img");
        img.src = recipe.image;
        img.alt = recipe.title;
        img.width = 200;
        img.height = 200;
        img.style.borderRadius = "20%";

        const title = document.createElement("h3");
        title.textContent = recipe.title;

        const button = document.createElement("button");
        button.textContent = recipe.buttonText;
        button.className = "btn btn-primary";

        recipeDiv.appendChild(img);
        recipeDiv.appendChild(title);
        recipeDiv.appendChild(button);
        photoContainer.appendChild(recipeDiv);
    });
}

function updatePaginationButtons() {
    document.getElementById("prev-btn").disabled = currentPage === 1;
    document.getElementById("next-btn").disabled = currentPage >= Math.ceil(recipes.length / imagesPerPage);
}

document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayRecipes();
        updatePaginationButtons();
    }
});

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentPage < Math.ceil(recipes.length / imagesPerPage)) {
        currentPage++;
        displayRecipes();
        updatePaginationButtons();
    }
});
// Charger les données depuis le fichier JSON
async function loadRecipes() {
  try {
    const response = await fetch("../data/data.json"); // Chemin vers le fichier JSON
    if (!response.ok) {
      throw new Error("Erreur lors du chargement du fichier JSON");
    }
    const data = await response.json();
    const recipes = data.recettes;

    const container = document.getElementById("recipe-container");
    container.innerHTML = ""; // Vider le conteneur avant d'ajouter du contenu

    recipes.forEach(recipe => {
      // Créer un div pour chaque recette
      const recipeDiv = document.createElement("div");
      recipeDiv.className = "entrée";

      // Ajouter le nom de la recette
      const title = document.createElement("h3");
      title.textContent = recipe.nom;

      // Ajouter la catégorie
      const category = document.createElement("p");
      category.textContent = `Catégorie : ${recipe.categorie}`;

      // Ajouter le temps de préparation
      const time = document.createElement("p");
      time.textContent = `Temps de préparation : ${recipe.temps_preparation}`;

      // Ajouter les ingrédients
      const ingredients = document.createElement("ul");
      ingredients.textContent = "Ingrédients :";
      recipe.ingredients.forEach(ingredient => {
        const li = document.createElement("li");
        li.textContent = `${ingredient.nom} - ${ingredient.quantite}`;
        ingredients.appendChild(li);
      });

      // Ajouter les étapes
      const steps = document.createElement("ol");
      steps.textContent = "Étapes :";
      recipe.etapes.forEach(etape => {
        const li = document.createElement("li");
        li.textContent = etape;
        steps.appendChild(li);
      });

      // Ajouter les éléments au div
      recipeDiv.appendChild(title);
      recipeDiv.appendChild(category);
      recipeDiv.appendChild(time);
      recipeDiv.appendChild(ingredients);
      recipeDiv.appendChild(steps);

      // Ajouter le div au conteneur
      container.appendChild(recipeDiv);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des recettes :", error);
  }
}

// Charger les recettes au chargement de la page
loadRecipes();