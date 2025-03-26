const images = [
    "assets/quinoa.png",
    "assets/lentille.png",
    "assets/cesard.png",
    "assets/nicoise.png",
    "assets/poulet.png",
    "assets/lasagne.png",
    "assets/carbo.png",
    "assets/risoto.png",
    "assets/ti.png",
    "assets/saladefruit.png",
    "assets/muffin.png",
    "assets/tarte.png",
    "assets/pomme.png",    
];

const imagesPerPage = 4;
let currentPage = 1;

function displayImages() {
    const photoContainer = document.getElementById("photo-container");
    photoContainer.innerHTML = "";

    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const imagesToDisplay = images.slice(startIndex, endIndex);

    imagesToDisplay.forEach(src => {
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
    document.getElementById("next-btn").disabled = currentPage === Math.ceil(images.length / imagesPerPage);
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
