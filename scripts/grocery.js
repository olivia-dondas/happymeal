document.addEventListener("DOMContentLoaded", () => {
  const ingredientContainer = document.querySelector(".ingredient-list");
  const shoppingList = new Set(JSON.parse(localStorage.getItem("groceryList")) || []);

  // Fonction pour afficher les ingrédients
  function displayIngredients(ingredients) {
    ingredientContainer.innerHTML = ""; // Réinitialise la liste des ingrédients

    ingredients.forEach((ingredient) => {
      const ingredientDiv = document.createElement("div");
      ingredientDiv.className = "d-flex justify-content-between align-items-center mb-2";

      const ingredientName = document.createElement("span");
      ingredientName.textContent = ingredient.nom;

      const addButton = document.createElement("button");
      addButton.className = "btn btn-sm btn-success";
      addButton.textContent = "Ajouter";
      addButton.onclick = () => addToShoppingList(ingredient.nom);

      ingredientDiv.appendChild(ingredientName);
      ingredientDiv.appendChild(addButton);
      ingredientContainer.appendChild(ingredientDiv);
    });
  }

  // Fonction pour ajouter un ingrédient à la liste de courses
  function addToShoppingList(ingredient) {
    shoppingList.add(ingredient);
    localStorage.setItem("groceryList", JSON.stringify([...shoppingList]));
    renderShoppingList();
  }

  // Fonction pour supprimer un ingrédient de la liste de courses
  function removeFromShoppingList(ingredient) {
    shoppingList.delete(ingredient);
    localStorage.setItem("groceryList", JSON.stringify([...shoppingList]));
    renderShoppingList();
  }

  // Fonction pour afficher la liste de courses
  function renderShoppingList() {
    const shoppingListElement = document.getElementById("shopping-list");
    shoppingListElement.innerHTML = "";

    shoppingList.forEach((ingredient) => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item d-flex justify-content-between align-items-center";
      listItem.textContent = ingredient;

      const removeButton = document.createElement("button");
      removeButton.className = "btn btn-sm btn-danger";
      removeButton.textContent = "Supprimer";
      removeButton.onclick = () => {
        shoppingList.delete(ingredient);
        localStorage.setItem("groceryList", JSON.stringify([...shoppingList]));
        renderShoppingList();
      };

      listItem.appendChild(removeButton);
      shoppingListElement.appendChild(listItem);
    });
  }

  // Afficher la liste de courses initiale
  renderShoppingList();

  // Charger les ingrédients depuis le fichier JSON
  fetch("../data/data.json")
    .then((response) => response.json())
    .then((data) => {
      const allIngredients = data.recettes.flatMap((recette) =>
        recette.ingredients.map((ing) => ({
          nom: typeof ing === "string" ? ing : ing.nom,
        }))
      );
      displayIngredients(allIngredients);
    })
    .catch((error) => console.error("Erreur lors du chargement des ingrédients :", error));

  // Générer un fichier PDF de la liste de courses
  document.getElementById("generate-pdf").addEventListener("click", () => {
    if (shoppingList.size === 0) {
      alert("Votre liste de courses est vide !");
      return;
    }

    // Importation de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ajout du titre
    doc.setFontSize(16);
    doc.text("Liste de courses", 10, 10);

    // Ajout des ingrédients
    let y = 20; // Position verticale de départ
    Array.from(shoppingList).forEach((item, index) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${item}`, 10, y);
      y += 10; // Décalage vertical pour chaque ligne
    });

    // Téléchargement du fichier PDF
    doc.save("liste_de_courses.pdf");
  });

  // Supprimer toute la liste
  document.getElementById("clear-list").addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment supprimer toute la liste ?")) {
      shoppingList.clear();
      localStorage.setItem("groceryList", JSON.stringify([...shoppingList]));
      renderShoppingList();
    }
  });
});
