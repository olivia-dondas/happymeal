# Happy Meal

## Introduction
Happy Meal est une application web qui simplifie la cuisine en proposant des recettes variées, la gestion des listes de courses et la planification des repas de la semaine. L'application fonctionne sans base de données et s'appuie sur un fichier JSON pour stocker les recettes.

## Fonctionnalités
- **Affichage aléatoire de recettes** à chaque visite pour encourager la découverte.
- **Recherche rapide** avec une barre de recherche dotée d'un système d'autocomplétion permettant de filtrer les recettes par nom ou ingrédient.
- **Affichage détaillé** d'une recette avec la liste des ingrédients, le temps de préparation et les étapes de réalisation.
- **Ajout aux favoris** avec une indication visuelle pour identifier les recettes enregistrées.
- **Gestion des listes de courses** :
  - Ajout des ingrédients directement depuis une recette.
  - Suppression des ingrédients individuellement.
  - Génération et téléchargement d'une liste de courses.
- **Affichage de toutes les recettes** sous forme paginée (9 recettes par page).
- **Planification des repas de la semaine** à partir des favoris.
- **Persistance des données** malgré la fermeture du navigateur (sans base de données).

## Technologies utilisées
- **HTML5, CSS3, JavaScript**
- Manipulation du **DOM** et gestion des **événements**
- Utilisation de **JSON** pour stocker les recettes
- API Fetch pour la manipulation des données
- Génération de fichiers (ex : liste de courses en PDF)
- Gestion de projet avec **Trello** et **GitHub**

## Installation
1. **Cloner le dépôt GitHub** :
   ```sh
   git clone https://github.com/olivia-dondas/happyMeal.git
   ```
2. **Ouvrir le projet dans un navigateur** :
   - Ouvrir `index.html` directement.
   - Ou utiliser un serveur local comme Live Server.
3. **Hébergement sur Plesk** :
   - Déployer les fichiers sur votre espace Plesk.
   - Assurez-vous que le fichier JSON est bien accessible.

## Collaboration
- **GitHub** : Travail collaboratif via branches et pull requests.
- **Trello** : Organisation des tâches et suivi du projet.
- **Figma** : Réalisation des maquettes.

## Livrables
- Projet en ligne sur Plesk.
- Code source public sur GitHub.
- Présentation du projet à l'équipe pédagogique.

## Base de connaissances
- **Traitement des URL**
- **Conversion HTML en PDF avec JavaScript**
- **Utilisation de l'API Fetch**
