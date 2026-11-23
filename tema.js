/* =========================================
   MODO NOTURNO - PLAYBOOK
========================================= */

const themeToggle = document.getElementById("themeToggle");


/* =========================================
   VERIFICAR TEMA SALVO
========================================= */

const savedTheme = localStorage.getItem("playbookTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

}


/* =========================================
   ATUALIZAR TEXTO DO BOTÃO
========================================= */

function updateThemeButton() {

    if (!themeToggle) {
        return;
    }

    if (document.body.classList.contains("dark-mode")) {

        themeToggle.textContent = "Modo claro";

    } else {

        themeToggle.textContent = "Modo noturno";

    }

}


updateThemeButton();


/* =========================================
   BOTÃO DE TROCAR O TEMA
========================================= */

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");


        const darkMode =
            document.body.classList.contains("dark-mode");


        /* Salva a escolha */

        localStorage.setItem(
            "playbookTheme",
            darkMode ? "dark" : "light"
        );


        /* Atualiza o texto */

        updateThemeButton();

    });

}