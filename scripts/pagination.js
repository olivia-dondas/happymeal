// Vérification de jQuery
if (typeof jQuery === "undefined") {
  throw new Error("jQuery is not loaded");
}

(function ($) {
  const RECIPES_PER_PAGE = 6;
  let currentPage = 1;

  function initPagination() {
    // Vérifie si des cartes existent déjà
    if ($("#recipe-cards-container .recipe-card").length > 0) {
      displayRecipes();
    } else {
      // Si pas de cartes, on attend 500ms et on réessaye
      setTimeout(initPagination, 500);
    }
  }

  window.displayRecipes = function () {
    const $container = $("#recipe-cards-container");
    const totalRecipes = $container.find(".recipe-card");
    const totalPages = Math.ceil(totalRecipes.length / RECIPES_PER_PAGE);

    // Cache toutes les cartes
    totalRecipes.hide();

    // Affiche seulement celles de la page courante
    const start = (currentPage - 1) * RECIPES_PER_PAGE;
    const end = start + RECIPES_PER_PAGE;
    totalRecipes.slice(start, end).show();

    updatePagination(totalPages);
  };

  function updatePagination(totalPages) {
    $("#page-number").text(`Page ${currentPage} / ${totalPages}`);
    $("#prev-page").toggleClass("disabled", currentPage === 1);
    $("#next-page").toggleClass("disabled", currentPage === totalPages);
  }

  $(document).ready(function () {
    // Initialisation
    initPagination();

    // Gestion des clics
    $(document)
      .on("click", "#prev-page:not(.disabled)", function () {
        currentPage--;
        displayRecipes();
      })
      .on("click", "#next-page:not(.disabled)", function () {
        currentPage++;
        displayRecipes();
      });
  });
})(jQuery);
