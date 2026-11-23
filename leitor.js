/* =========================================================
   PLAYBOOK — SISTEMA DE LEITURA
   ========================================================= */

const READING_KEY = "playbookReadingTime";
const GAME_KEY = "playbookGameTime";
const CREDITED_READING_KEY = "playbookCreditedReading";

const READING_BLOCK = 15 * 60; // 15 minutos
const GAME_REWARD = 10 * 60;   // 10 minutos

let readingTotal = Number(localStorage.getItem(READING_KEY) || 0);
let isReading = true;
let readerInterval = null;


/* =========================================================
   TEMPO
   ========================================================= */

function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


function getReadingTime() {
    return Number(localStorage.getItem(READING_KEY) || 0);
}


function getGameTime() {
    return Number(localStorage.getItem(GAME_KEY) || 0);
}


function getCreditedReading() {
    return Number(localStorage.getItem(CREDITED_READING_KEY) || 0);
}


function saveReadingTime(seconds) {
    localStorage.setItem(READING_KEY, String(Math.max(0, Math.floor(seconds))));
}


function saveGameTime(seconds) {
    localStorage.setItem(GAME_KEY, String(Math.max(0, Math.floor(seconds))));
}


/* =========================================================
   CRÉDITOS

   A leitura total é registrada separadamente do saldo de jogos.
   Assim, gastar tempo nos jogos NÃO apaga o histórico de leitura.
   ========================================================= */

function processReadingCredit(totalReading) {
    const alreadyCredited = getCreditedReading();

    const totalBlocks = Math.floor(totalReading / READING_BLOCK);
    const creditedBlocks = Math.floor(alreadyCredited / READING_BLOCK);

    const newBlocks = totalBlocks - creditedBlocks;

    if (newBlocks > 0) {
        const currentGameTime = getGameTime();
        const newGameTime = currentGameTime + (newBlocks * GAME_REWARD);

        saveGameTime(newGameTime);
        localStorage.setItem(CREDITED_READING_KEY, String(totalBlocks * READING_BLOCK));

        showCreditMessage(newBlocks);
    }
}


/* =========================================================
   ATUALIZAR INTERFACE
   ========================================================= */

function updateReaderInterface() {
    const totalReading = readingTotal;
    const gameTime = getGameTime();

    const readerTimer = document.getElementById("readerTimer");
    const readerGameTime = document.getElementById("readerGameTime");

    if (readerTimer) {
        readerTimer.textContent = formatTime(totalReading);
    }

    if (readerGameTime) {
        readerGameTime.textContent = formatTime(gameTime);
    }

    updateProgress(totalReading);
}


function updateProgress(totalReading) {
    const progress = totalReading % READING_BLOCK;
    const percentage = (progress / READING_BLOCK) * 100;
    const remaining = READING_BLOCK - progress;

    const bar = document.getElementById("readingProgress");
    const nextCredit = document.getElementById("nextCredit");

    if (bar) {
        bar.style.width = `${percentage}%`;
    }

    if (nextCredit) {
        nextCredit.textContent = formatShortTime(remaining);
    }
}


function formatShortTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


/* =========================================================
   REGISTRAR SEGUNDO DE LEITURA
   ========================================================= */

function registerReadingSecond() {
    if (!isReading) {
        return;
    }

    readingTotal++;

    saveReadingTime(readingTotal);
    processReadingCredit(readingTotal);
    updateReaderInterface();
}


/* =========================================================
   PAUSA
   ========================================================= */

function createPauseScreen() {
    let screen = document.querySelector(".reading-pause-screen");

    if (screen) {
        return screen;
    }

    screen = document.createElement("div");
    screen.className = "reading-pause-screen";

    screen.innerHTML = `
        <div class="reading-pause-box">
            <div class="pause-line"></div>

            <p class="pause-label">PLAYBOOK</p>

            <h2>Leitura pausada</h2>

            <p>
                Você saiu da página de leitura.
                O tempo não será contabilizado enquanto a leitura estiver pausada.
            </p>

            <div class="pause-status">
                LEITURA EM PAUSA
            </div>

            <button
                id="resumeReadingButton"
                class="resume-reading-button"
                type="button">
                Continuar leitura
            </button>
        </div>
    `;

    document.body.appendChild(screen);

    const button = document.getElementById("resumeReadingButton");

    if (button) {
        button.addEventListener("click", resumeReading);
    }

    return screen;
}


function pauseReading() {
    if (!isReading) {
        return;
    }

    isReading = false;

    const screen = createPauseScreen();

    requestAnimationFrame(() => {
        screen.classList.add("show");
    });
}


function resumeReading() {
    if (isReading) {
        return;
    }

    const screen = document.querySelector(".reading-pause-screen");

    if (screen) {
        screen.classList.remove("show");

        setTimeout(() => {
            if (screen.parentNode) {
                screen.remove();
            }
        }, 300);
    }

    isReading = true;
}


/* =========================================================
   TROCA DE ABA
   ========================================================= */

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseReading();
    }
});


/* =========================================================
   LIVRO
   ========================================================= */

function loadBook() {
    const params = new URLSearchParams(window.location.search);
    const book = params.get("livro");

    const viewer = document.getElementById("bookViewer");
    const title = document.getElementById("bookTitle");

    if (!viewer) {
        return;
    }

    if (!book) {
        viewer.src = "about:blank";

        if (title) {
            title.textContent = "Nenhum livro selecionado";
        }

        return;
    }

    viewer.src = `../livros/${encodeURIComponent(book)}`;

    if (title) {
        if (book === "livro-1.pdf") {
            title.textContent = "O Alienista — Machado de Assis";
        } else {
            title.textContent = book;
        }
    }
}


/* =========================================================
   AVISO DE CRÉDITO
   ========================================================= */

function showCreditMessage(numberOfCredits) {
    let message = document.querySelector(".reading-credit-message");

    if (!message) {
        message = document.createElement("div");
        message.className = "reading-credit-message";
        document.body.appendChild(message);
    }

    const minutes = numberOfCredits * 10;

    message.textContent =
        numberOfCredits === 1
            ? "Você conquistou 10 minutos de jogo!"
            : `Você conquistou ${minutes} minutos de jogo!`;

    message.classList.add("show");

    clearTimeout(message.hideTimer);

    message.hideTimer = setTimeout(() => {
        message.classList.remove("show");
    }, 4500);
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadBook();
    updateReaderInterface();

    readerInterval = setInterval(registerReadingSecond, 1000);
});
