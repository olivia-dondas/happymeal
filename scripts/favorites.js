document.addEventListener("DOMContentLoaded", afficherFavoris);

// Fonction pour charger les recettes 
async function chargerRecettes() {
  try {
    const response = await fetch('recipe.html');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const recettes = doc.querySelectorAll('.recette');
    const recettesData = [];
    
    recettes.forEach(recette => {
      recettesData.push({
        id: recette.dataset.id,
        nom: recette.querySelector('h2').textContent,
        description: recette.querySelector('.description').textContent,
        image: recette.querySelector('img')?.src || 'image-par-defaut.jpg'
      });
    });
    
    return recettesData;
  } catch (error) {
    console.error("Erreur lors du chargement des recettes:", error);
    return [];
  }
}

// Fonction pour ajouter une recette aux favoris
async function ajouterAuxFavoris(id) {
  const recettes = await chargerRecettes();
  const recette = recettes.find(r => r.id === id);
  
  if (!recette) return;
  
  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  
  // Vérifier si la recette ne l'est pas déja 
  if (!favoris.some(f => f.id === id)) {
    favoris.push(recette);
    localStorage.setItem("favoris", JSON.stringify(favoris));
    afficherFavoris();
  }
}

function afficherFavoris() {
  const container = document.getElementById("favorisContainer");
  container.innerHTML = "";

  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

  if (favoris.length === 0) {
    container.innerHTML = "<p>Aucun favori enregistré.</p>";
    return;
  }

  favoris.forEach((favori) => {
    const card = document.createElement("div");
    card.classList.add("recette-card");
    card.dataset.id = favori.id;

    card.innerHTML = `
      <img src="${favori.image}" alt="${favori.nom}" />
      <h3>${favori.nom}</h3>
      <p>${favori.description}</p>
      <button onclick="supprimerFavori(${favori.id})">Supprimer</button>
    `;

    container.appendChild(card);
  });
}

function supprimerFavori(id) {
  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  favoris = favoris.filter((favori) => favori.id !== id);
  localStorage.setItem("favoris", JSON.stringify(favoris));

  afficherFavoris();
}
