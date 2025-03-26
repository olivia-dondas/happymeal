const images = [
  "../assets/img_recipes/quinoa.png",
  "../assets/img_recipes/lentille.png",
  "../assets/img_recipes/cesard.png",
  "../assets/img_recipes/nicoise.png",
  "../assets/img_recipes/poulet.png",
  "../assets/img_recipes/lasagne.png",
  "../assets/img_recipes/carbo.png",
  "../assets/img_recipes/risoto.png",
  "../assets/img_recipes/ti.png",
  "../assets/img_recipes/saladefruit.png",
  "../assets/img_recipes/muffin.png",
  "../assets/img_recipes/tarte.png",
  "../assets/img_recipes/pomme.png",
];

const imagesPerPage = 4;
let currentPage = 1;

function displayImages() {
  const photoContainer = document.getElementById("photo-container");
  photoContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const imagesToDisplay = images.slice(startIndex, endIndex);

  imagesToDisplay.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.width = 200;
    img.height = 200;
    img.style.borderRadius = "20%";
    photoContainer.appendChild(img);
  });
}

function updatePaginationButtons() {
  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled =
    currentPage === Math.ceil(images.length / imagesPerPage);
}

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayImages();
    updatePaginationButtons();
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentPage < Math.ceil(images.length / imagesPerPage)) {
    currentPage++;
    displayImages();
    updatePaginationButtons();
  }
});

// Initialisation
displayImages();
updatePaginationButtons();
