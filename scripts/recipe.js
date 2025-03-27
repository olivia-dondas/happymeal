// Charger les données depuis le fichier JSON
async function loadMenu() {
  try {
    const response = await fetch("../data/pagination.json"); // Chemin vers le fichier JSON
    if (!response.ok) {
      throw new Error("Erreur lors du chargement du fichier JSON");
    }
    const data = await response.json();
    const items = data.recipes;

    const container = document.getElementById("menu-container");
    container.innerHTML = ""; // Vider le conteneur avant d'ajouter du contenu

    items.forEach(item => {
      // Créer un div pour chaque élément
      const itemDiv = document.createElement("div");
      itemDiv.className = "entrée";

      // Ajouter l'image
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title;
      img.width = 200;
      img.height = 200;

      // Ajouter le titre
      const title = document.createElement("h3");
      title.textContent = item.title;

      // Ajouter le bouton
      const button = document.createElement("button");
      button.textContent = item.buttonText;
      button.className = "voir-plus-btn";

      // Ajouter les éléments au div
      itemDiv.appendChild(img);
      itemDiv.appendChild(title);
      itemDiv.appendChild(button);

      // Ajouter le div au conteneur
      container.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des éléments :", error);
  }
}

// Charger les éléments au chargement de la page
loadMenu();
// Charger les recettes au chargement de la page
loadRecipes();
// Charger les recettes au chargement de la page
loadRecipes();
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