
$(document)
  .ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const nomRecette = decodeURIComponent(urlParams.get("nom"));


    fetch("../data/data.json")
      .then((response) => response.json())
      .then((data) => {
        const recette = data.recettes.find((r) => r.nom === nomRecette);

        if (recette) {
          // Afficher les détails de la recette
          $("#titre-recette").text(recette.nom);
          $("#categorie-recette").text(recette.categorie);
          $("#temps-preparation").text(recette.temps_preparation);

          // Afficher les ingrédients
          const $ingredientsList = $("#ingredients-list");
          recette.ingredients.forEach((ingredient) => {
            const text =
              typeof ingredient === "string"
                ? ingredient
                : `${ingredient.nom} - ${ingredient.quantite}`;
            $ingredientsList.append($("<li>").text(text));
          });

          // Afficher les étapes
          const $etapesList = $("#etapes-list");
          recette.etapes.forEach((etape, index) => {
            $etapesList.append(
              $("<li>").html(`<strong>Étape ${index + 1}:</strong> ${etape}`)
            );
          });
        } else {
          $("#recette-content").html(
            "<p class='text-danger'>Recette non trouvée</p>"
          );
        }
      })
      .catch((error) => {
        console.error("Erreur de chargement:", error);
        $("#recette-content").html(
          "<p class='text-danger'>Erreur de chargement de la recette</p>"
        );
      });

    // Titre de la section
    $recipeList.append(
      $("<p>")
        .addClass("mb-0 list-group-item text-uppercase fw-bold")
        .text("Toutes les recettes")
    );

    // Vérification et affichage des recettes
    if (data.recettes && Array.isArray(data.recettes)) {
      data.recettes.forEach((recette) => {
        $recipeList.append(
          $("<a>")
            .addClass("list-group-item list-group-item-action")
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
