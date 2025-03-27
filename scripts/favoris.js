document.addEventListener("DOMContentLoaded", afficherFavoris);

function afficherFavoris() {
  const container = document.getElementById("favorisContainer");
  container.innerHTML = "";

  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

  if (favoris.length === 0) {
    container.innerHTML = "<p>Aucun favori enregistré.</p>";
    return;
  }

  favoris.forEach(favori => {
    const card = document.createElement("div");
    card.classList.add("recette-card");

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
  favoris = favoris.filter(favori => favori.id !== id);
  localStorage.setItem("favoris", JSON.stringify(favoris));

  afficherFavoris();
}
