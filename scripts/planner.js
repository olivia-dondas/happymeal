const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function calendarApp() {
    return {
        month: 0,
        year: 0,
        daysInMonth: [],
        blankDays: [],
        daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        recipes: [],
        selectedRecipes: {},
        isModalOpen: false,
        selectedDate: null,
        selectedType: 'Entrée',
        selectedRecipe: '',

        init() {
            const today = new Date();
            this.month = today.getMonth();
            this.year = today.getFullYear();
            this.loadRecipes();
            this.calculateDays();
        },

        loadRecipes() {
            fetch("../data/data.json")
                .then(response => response.json())
                .then(data => {
                    this.recipes = data.recettes;
                })
                .catch(error => console.error("Erreur lors du chargement des recettes :", error));
        },

        calculateDays() {
            const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
            const firstDayOfMonth = new Date(this.year, this.month, 1).getDay();
            this.blankDays = Array(firstDayOfMonth).fill(null);
            this.daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        },

        prevMonth() {
            if (this.month === 0) {
                this.month = 11;
                this.year--;
            } else {
                this.month--;
            }
            this.calculateDays();
        },

        nextMonth() {
            if (this.month === 11) {
                this.month = 0;
                this.year++;
            } else {
                this.month++;
            }
            this.calculateDays();
        },

        openModal(date) {
            this.selectedDate = date;
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
            this.selectedRecipe = '';
            this.selectedType = 'Entrée';
        },

        addRecipe() {
            if (!this.selectedRecipes[this.selectedDate]) {
                this.selectedRecipes[this.selectedDate] = [];
            }
            if (this.selectedRecipes[this.selectedDate].length < 3) {
                this.selectedRecipes[this.selectedDate].push(`${this.selectedType}: ${this.selectedRecipe}`);
                this.closeModal();
            } else {
                alert("Vous ne pouvez ajouter que 3 recettes par jour.");
            }
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.getElementById("calendar");
    const monthYear = document.getElementById("monthYear");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    const recipeModal = document.getElementById("recipeModal");
    const closeModal = document.getElementById("closeModal");
    const recipeType = document.getElementById("recipeType");
    const recipeName = document.getElementById("recipeName");
    const addRecipe = document.getElementById("addRecipe");

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    let recipes = [];
    let selectedRecipes = {};

    // Charger les recettes depuis le fichier JSON
    fetch("../data/data.json")
        .then(response => response.json())
        .then(data => {
            recipes = data.recettes;
            recipes.forEach(recipe => {
                const option = document.createElement("option");
                option.value = recipe.nom;
                option.textContent = recipe.nom;
                recipeName.appendChild(option);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des recettes :", error));

    // Générer le calendrier
    function generateCalendar() {
        calendar.innerHTML = "";
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Ajouter les jours vides
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            calendar.appendChild(emptyCell);
        }

        // Ajouter les jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement("div");
            dayCell.textContent = day;
            dayCell.addEventListener("click", () => openModal(day));
            calendar.appendChild(dayCell);

            // Afficher les recettes sélectionnées
            if (selectedRecipes[`${currentYear}-${currentMonth}-${day}`]) {
                selectedRecipes[`${currentYear}-${currentMonth}-${day}`].forEach(recipe => {
                    const recipeDiv = document.createElement("div");
                    recipeDiv.textContent = recipe;
                    recipeDiv.classList.add("recipe");
                    dayCell.appendChild(recipeDiv);
                });
            }
        }

        monthYear.textContent = `${new Date(currentYear, currentMonth).toLocaleString("fr-FR", {
            month: "long",
        })} ${currentYear}`;
    }

    // Ouvrir le modal
    function openModal(day) {
        selectedDate = `${currentYear}-${currentMonth}-${day}`;
        recipeModal.style.display = "flex";
    }

    // Fermer le modal
    closeModal.addEventListener("click", () => {
        recipeModal.style.display = "none";
    });

    // Ajouter une recette
    addRecipe.addEventListener("click", () => {
        const type = recipeType.value;
        const name = recipeName.value;
        if (!selectedRecipes[selectedDate]) {
            selectedRecipes[selectedDate] = [];
        }
        if (selectedRecipes[selectedDate].length < 3) {
            selectedRecipes[selectedDate].push(`${type}: ${name}`);
            recipeModal.style.display = "none";
            generateCalendar();
        } else {
            alert("Vous ne pouvez ajouter que 3 recettes par jour.");
        }
    });

    // Navigation du mois
    prevMonth.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });

    nextMonth.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });

    generateCalendar();
});