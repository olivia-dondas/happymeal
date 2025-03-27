$(document).ready(function () {
  // Chargement des recettes pour le menu déroulant
  fetch("data/data.json")
    .then((response) => response.json())
    .then((data) => {
      const $recipeList = $("#recipes-list");

      // Titre de la section
      $recipeList.append(
        $("<p>")
          .addClass(
            "list-group list-group-flush list-group-item-action text-uppercase fw-bold"
          )
          .text("Toutes les recettes")
      );

      // Vérification et affichage des recettes
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
    .catch((error) => {
      console.error("Erreur lors de la récupération des recettes:", error);
    });

  // Affichage des recettes aléatoires sur la page d'accueil
  afficherRecettesAleatoires();

  // Barre de recherche avec suggestions
  gererRecherche();
});

async function chargerRecettes() {
  try {
    const response = await fetch("data/data.json");
    const data = await response.json();
    return data.recettes || [];
  } catch (error) {
    console.error("Erreur de chargement des recettes :", error);
    return [];
  }
}

function melangerTableau(tableau) {
  return tableau.sort(() => Math.random() - 0.5);
}

async function afficherRecettesAleatoires() {
  const recettes = await chargerRecettes();
  const recettesSelectionnees = melangerTableau([...recettes]).slice(0, 3);
  const container = $("#cartes-recettes");

  container.empty(); // Vide le conteneur

  recettesSelectionnees.forEach((recette) => {
    const card = `
      <div class="card" style="width: 18rem;">
        <div class="card-header bg-transparent">
          <span class="badge bg-secondary">${recette.categorie}</span>
          <span class="badge bg-light text-dark ms-2">${
            recette.temps_preparation
          }</span>
        </div>
        <div class="card-body">
         <img src="${recette.images}" class="card-img-top" alt="${recette.nom}">
          <h5 class="card-title">${recette.nom}</h5>
          <p class="card-text">${recette.ingredients
            .slice(0, 3)
            .map((i) => i.nom || i)
            .join(", ")}...</p>
          <a href="pages/recipe.html?nom=${encodeURIComponent(
            recette.nom
          )}" class="btn btn-primary">Voir la recette</a>
        </div>
      </div>
    `;
    container.append(card);
  });
}

// Fonction pour gérer la recherche et les suggestions
async function gererRecherche() {
  const searchInput = document.getElementById("search");
  const suggestionsBox = document.getElementById("suggestions"); // Correction ici

  if (!searchInput || !suggestionsBox) {
    console.error(
      "Les éléments de recherche ou de suggestions sont introuvables."
    );
    return;
  }

  async function fetchData() {
    try {
      const response = await fetch("data/data.json");
      const data = await response.json();
      return data.recettes || []; // Assurez-vous de retourner le tableau des recettes
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      return [];
    }
  }

  searchInput.addEventListener("input", async function () {
    const query = this.value.toLowerCase();
    suggestionsBox.innerHTML = ""; // Vide les suggestions précédentes

    if (query.length === 0) return;

    const recettes = await fetchData();
    const filteredRecettes = recettes.filter((recette) =>
      recette.nom.toLowerCase().includes(query)
    );

    filteredRecettes.forEach((recette) => {
      let div = document.createElement("div");
      div.textContent = recette.nom;
      div.style.cursor = "pointer"; // Style pour indiquer que c'est cliquable
      div.addEventListener("click", function () {
        searchInput.value = recette.nom; // Remplit le champ de recherche
        suggestionsBox.innerHTML = ""; // Efface les suggestions
      });
      suggestionsBox.appendChild(div);
    });
  });
}
