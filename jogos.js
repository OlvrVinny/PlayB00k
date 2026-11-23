
/* =====================================
   PLAYBOOK - SISTEMA DE JOGOS
   Desafio dos Céus, Memória e Palavras
===================================== */

(() => {
    "use strict";

    const POINTS_KEY = "playbookGamePoints";

    let points = Number(localStorage.getItem(POINTS_KEY)) || 0;
    let currentGame = null;

    const area = document.getElementById("gameArea");

    /* =====================================
       SISTEMA DE PONTUAÇÃO
    ===================================== */

    function savePoints(amount) {
        points += amount;
        localStorage.setItem(POINTS_KEY, points);
        updatePoints();
    }

    function updatePoints() {
        document.querySelectorAll("[data-game-points]").forEach(element => {
            element.textContent = points;
        });
    }

    function awardPoints(amount) {
        savePoints(amount);
    }

    /* =====================================
       NAVEGAÇÃO ENTRE OS JOGOS
    ===================================== */

    function closeGame() {
        stopSkyGame();
        clearMemoryTimer();

        if (area) {
            area.classList.remove("active");
        }

        document.body.style.overflow = "";
        currentGame = null;
        skyKeys = {};
    }

    function openGame(game) {
        if (!area) return;

        closeGame();

        currentGame = game;
        area.classList.add("active");
        document.body.style.overflow = "hidden";

        document.querySelectorAll(".game-screen").forEach(screen => {
            screen.style.display = "none";
        });

        const screens = {
            sky: "skyGame",
            memory: "memoryGame",
            word: "wordGame"
        };

        const screen = document.getElementById(screens[game]);

        if (!screen) return;

        screen.style.display = "block";

        if (game === "sky") startSkyGame();
        if (game === "memory") startMemoryGame();
        if (game === "word") startWordGame();
    }

    window.openGame = openGame;
    window.closeGame = closeGame;

    /* =====================================
       DESAFIO DOS CÉUS
       Astronauta, estrelas e nuvens
    ===================================== */

    let skyAnimation = null;
    let skyRunning = false;
    let skyScore = 0;
    let skyLives = 3;
    let skyPlayer = {
        x: 329,
        y: 420,
        width: 42,
        height: 42,
        speed: 5
    };

    let skyObjects = [];
    let skyKeys = {};
    let skyBackgroundStars = [];
    let skyFrame = 0;
    let skySpawnCounter = 0;

    const SKY_WIDTH = 700;
    const SKY_HEIGHT = 500;

    function createSkyInterface() {
        const screen = document.getElementById("skyGame");

        if (!screen || screen.dataset.ready === "true") return;

        screen.dataset.ready = "true";

        screen.innerHTML = `
            <div class="game-heading">
                <span class="sky-kicker">MISSÃO ESPACIAL</span>
                <h2>Desafio dos Céus</h2>
                <p>
                    Prepare seu traje, explore o espaço e colete
                    estrelas para completar sua missão!
                </p>
            </div>

            <div class="game-status sky-status">
                <div class="sky-stat">
                    <span class="sky-stat-label">Estrelas coletadas</span>
                    <strong id="skyScore">0</strong>
                </div>

                <div class="sky-stat">
                    <span class="sky-stat-label">Vidas disponíveis</span>
                    <strong id="skyLives">3</strong>
                </div>
            </div>

            <div class="sky-canvas-wrap">
                <div class="sky-canvas-top">
                    <span class="sky-live-indicator"></span>
                    <span>EXPEDIÇÃO ESPACIAL</span>
                    <span class="sky-level">NÍVEL 01</span>
                </div>

                <canvas
                    id="skyCanvas"
                    width="700"
                    height="500"
                    aria-label="Jogo espacial com astronauta, estrelas e nuvens"
                ></canvas>

                <div class="sky-canvas-bottom">
                    <span>PLAYBOOK SPACE PROGRAM</span>
                    <span>MISSÃO: 10 ESTRELAS</span>
                </div>
            </div>

            <div class="sky-instructions">
                <div class="sky-instruction-icon">A / D</div>
                <div>
                    <strong>Controle seu astronauta</strong>
                    <p>Use as setas do teclado ou A e D para movimentar.</p>
                </div>
            </div>

            <p id="skyFeedback" class="game-feedback">
                Sua missão começa agora. Colete 10 estrelas!
            </p>

            <div class="game-controls">
                <button class="game-action" id="skyStart">
                    Começar missão
                </button>

                <button class="game-secondary" id="skyExit">
                    Sair do jogo
                </button>
            </div>
        `;

        document.getElementById("skyStart").addEventListener(
            "click",
            startSkyGame
        );

        document.getElementById("skyExit").addEventListener(
            "click",
            closeGame
        );
    }

    /* =====================================
       DESENHO DO FUNDO ESPACIAL
    ===================================== */

    function createSkyStars() {
        skyBackgroundStars = [];

        for (let i = 0; i < 85; i++) {
            skyBackgroundStars.push({
                x: Math.random() * SKY_WIDTH,
                y: Math.random() * SKY_HEIGHT,
                size: 0.7 + Math.random() * 1.8,
                phase: Math.random() * Math.PI * 2,
                speed: 0.025 + Math.random() * 0.04
            });
        }
    }

    function drawSkyBackground(ctx) {
        const gradient = ctx.createLinearGradient(
            0, 0, SKY_WIDTH, SKY_HEIGHT
        );

        gradient.addColorStop(0, "#11172F");
        gradient.addColorStop(0.48, "#24204F");
        gradient.addColorStop(1, "#45276B");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SKY_WIDTH, SKY_HEIGHT);

        // Nebulosas suaves
        const nebula = ctx.createRadialGradient(
            520, 110, 10,
            520, 110, 250
        );

        nebula.addColorStop(0, "rgba(153, 113, 220, 0.20)");
        nebula.addColorStop(1, "rgba(153, 113, 220, 0)");

        ctx.fillStyle = nebula;
        ctx.fillRect(250, 0, 450, 350);

        const secondNebula = ctx.createRadialGradient(
            100, 360, 5,
            100, 360, 190
        );

        secondNebula.addColorStop(0, "rgba(87, 195, 174, 0.12)");
        secondNebula.addColorStop(1, "rgba(87, 195, 174, 0)");

        ctx.fillStyle = secondNebula;
        ctx.fillRect(0, 180, 350, 320);

        // Estrelas com brilho
        skyBackgroundStars.forEach(star => {
            const opacity =
                0.35 + Math.abs(Math.sin(skyFrame * star.speed + star.phase)) * 0.65;

            ctx.globalAlpha = opacity;
            ctx.fillStyle = "#FFFFFF";

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Planeta decorativo
        const planetGradient = ctx.createLinearGradient(
            540, 35, 625, 120
        );

        planetGradient.addColorStop(0, "#BFA8F1");
        planetGradient.addColorStop(1, "#704B9F");

        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(585, 85, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(221, 205, 255, 0.55)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(585, 85, 52, 13, -0.35, 0, Math.PI * 2);
        ctx.stroke();

        // Pequeno planeta distante
        ctx.fillStyle = "#85D8C2";
        ctx.beginPath();
        ctx.arc(115, 120, 9, 0, Math.PI * 2);
        ctx.fill();

        // Pontos de luz
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.arc(410, 175, 2, 0, Math.PI * 2);
        ctx.arc(210, 70, 2, 0, Math.PI * 2);
        ctx.arc(630, 260, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    /* =====================================
       DESENHO DO ASTRONAUTA
    ===================================== */

    function drawAstronaut(ctx, x, y, size = 56) {
        const scale = size / 56;
        const bob = Math.sin(skyFrame * 0.09) * 3;

        ctx.save();
        ctx.translate(x, y + bob);
        ctx.scale(scale, scale);

        // Sombra
        ctx.fillStyle = "rgba(5, 7, 25, 0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 26, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mochila
        ctx.fillStyle = "#7050AE";
        ctx.beginPath();
        ctx.roundRect(-21, -5, 11, 29, 6);
        ctx.fill();

        ctx.fillStyle = "#A78AE0";
        ctx.beginPath();
        ctx.roundRect(-19, 1, 6, 13, 3);
        ctx.fill();

        // Pernas do traje
        ctx.fillStyle = "#F2F0FA";

        ctx.beginPath();
        ctx.roundRect(-13, 13, 10, 14, 4);
        ctx.roundRect(3, 13, 10, 14, 4);
        ctx.fill();

        // Botas
        ctx.fillStyle = "#544080";

        ctx.beginPath();
        ctx.roundRect(-15, 22, 13, 7, 3);
        ctx.roundRect(2, 22, 13, 7, 3);
        ctx.fill();

        // Braços
        ctx.strokeStyle = "#F2F0FA";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(-13, -3);
        ctx.lineTo(-20, 9);
        ctx.moveTo(13, -3);
        ctx.lineTo(20, 9);
        ctx.stroke();

        // Luvas
        ctx.fillStyle = "#9BE2C4";

        ctx.beginPath();
        ctx.arc(-20, 10, 5, 0, Math.PI * 2);
        ctx.arc(20, 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Corpo
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(-15, -10, 30, 30, 10);
        ctx.fill();

        // Faixa do uniforme
        ctx.fillStyle = "#D9D0F2";
        ctx.beginPath();
        ctx.roundRect(-11, 5, 22, 5, 2);
        ctx.fill();

        // Painel do traje
        ctx.fillStyle = "#7552B9";
        ctx.beginPath();
        ctx.roundRect(-6, -2, 12, 9, 3);
        ctx.fill();

        ctx.fillStyle = "#A8F0D1";
        ctx.beginPath();
        ctx.arc(0, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Pescoço
        ctx.fillStyle = "#D9D0F2";
        ctx.beginPath();
        ctx.roundRect(-8, -17, 16, 9, 4);
        ctx.fill();

        // Capacete externo
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, -20, 21, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#C8B9EB";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Visor
        const visor = ctx.createLinearGradient(
            -12, -32, 12, -7
        );

        visor.addColorStop(0, "#476D91");
        visor.addColorStop(1, "#172C50");

        ctx.fillStyle = visor;
        ctx.beginPath();
        ctx.ellipse(0, -20, 15, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflexo principal
        ctx.fillStyle = "rgba(164, 240, 237, 0.85)";
        ctx.beginPath();
        ctx.ellipse(-6, -26, 4, 2, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Reflexo secundário
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.arc(8, -15, 2, 0, Math.PI * 2);
        ctx.fill();

        // Detalhe lateral do capacete
        ctx.fillStyle = "#8F75CB";
        ctx.beginPath();
        ctx.arc(-19, -20, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#A4E8CD";
        ctx.beginPath();
        ctx.arc(19, -20, 4, 0, Math.PI * 2);
        ctx.fill();

        // Brilho decorativo
        ctx.fillStyle = "#D8FFF0";
        ctx.beginPath();
        ctx.arc(0, -45, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /* =====================================
       DESENHO DAS ESTRELAS
    ===================================== */

    function drawSkyStar(ctx, x, y, radius) {
        ctx.save();
        ctx.translate(x, y);

        ctx.shadowColor = "#FFE69A";
        ctx.shadowBlur = 16;

        ctx.fillStyle = "#FFD76A";
        ctx.strokeStyle = "#FFF0B4";
        ctx.lineWidth = 1.5;

        ctx.beginPath();

        for (let i = 0; i < 10; i++) {
            const angle = -Math.PI / 2 + i * Math.PI / 5;
            const r = i % 2 === 0 ? radius : radius * 0.45;

            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.85)";

        ctx.beginPath();
        ctx.arc(-3, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /* =====================================
       DESENHO DAS NUVENS
    ===================================== */

    function drawSkyCloud(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.shadowColor = "rgba(10, 10, 30, 0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = "#D7D8F2";

        ctx.beginPath();
        ctx.arc(-12, 2, 10, 0, Math.PI * 2);
        ctx.arc(0, -5, 14, 0, Math.PI * 2);
        ctx.arc(13, 2, 10, 0, Math.PI * 2);
        ctx.roundRect(-22, 0, 44, 13, 7);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.beginPath();
        ctx.arc(-5, -9, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /* =====================================
       OBJETOS DO JOGO
    ===================================== */

    function spawnSkyObject() {
        skySpawnCounter++;

        if (skySpawnCounter < 38) return;

        skySpawnCounter = 0;

        const type = Math.random() < 0.68 ? "star" : "cloud";

        skyObjects.push({
            x: 30 + Math.random() * (SKY_WIDTH - 60),
            y: -30,
            type,
            speed: type === "star"
                ? 2.2 + Math.random() * 1.5
                : 2.5 + Math.random() * 1.7,
            size: type === "star" ? 15 : 21,
            hit: false
        });
    }

    function drawSkyObjects(ctx) {
        skyObjects.forEach(object => {
            if (object.type === "star") {
                drawSkyStar(
                    ctx,
                    object.x,
                    object.y,
                    object.size
                );
            } else {
                drawSkyCloud(ctx, object.x, object.y);
            }
        });
    }

    function checkSkyCollision(object) {
        const playerCenterX = skyPlayer.x + skyPlayer.width / 2;
        const playerCenterY = skyPlayer.y + skyPlayer.height / 2;

        const distanceX = Math.abs(object.x - playerCenterX);
        const distanceY = Math.abs(object.y - playerCenterY);

        const collisionRadius = object.type === "star" ? 25 : 29;

        return (
            distanceX < collisionRadius &&
            distanceY < collisionRadius
        );
    }

    /* =====================================
       ATUALIZAÇÃO DO JOGO
    ===================================== */

    function updateSkyGame() {
        if (!skyRunning) return;

        skyFrame++;

        const canvas = document.getElementById("skyCanvas");
        if (!canvas) {
            stopSkyGame();
            return;
        }

        const ctx = canvas.getContext("2d");

        drawSkyBackground(ctx);

        // Movimento do astronauta
        if (skyKeys.ArrowLeft || skyKeys.a || skyKeys.A) {
            skyPlayer.x -= skyPlayer.speed;
        }

        if (skyKeys.ArrowRight || skyKeys.d || skyKeys.D) {
            skyPlayer.x += skyPlayer.speed;
        }

        skyPlayer.x = Math.max(
            8,
            Math.min(
                SKY_WIDTH - skyPlayer.width - 8,
                skyPlayer.x
            )
        );

        spawnSkyObject();

        // Movimento e colisões
        for (const object of skyObjects) {
            object.y += object.speed;

            if (!object.hit && checkSkyCollision(object)) {
                object.hit = true;

                if (object.type === "star") {
                    skyScore++;

                    const scoreElement = document.getElementById("skyScore");
                    if (scoreElement) {
                        scoreElement.textContent = skyScore;
                    }

                    if (skyScore >= 10) {
                        finishSkyGame(true);
                        return;
                    }
                } else {
                    skyLives--;

                    const livesElement = document.getElementById("skyLives");
                    if (livesElement) {
                        livesElement.textContent = skyLives;
                    }

                    if (skyLives <= 0) {
                        finishSkyGame(false);
                        return;
                    }
                }
            }
        }

        skyObjects = skyObjects.filter(object =>
            object.y < SKY_HEIGHT + 40 && !object.hit
        );

        drawSkyObjects(ctx);

        // Pequeno brilho abaixo do astronauta
        ctx.save();
        ctx.fillStyle = "rgba(151, 232, 207, 0.18)";
        ctx.beginPath();
        ctx.ellipse(
            skyPlayer.x + 21,
            skyPlayer.y + 48,
            13,
            4,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        drawAstronaut(
            ctx,
            skyPlayer.x + skyPlayer.width / 2,
            skyPlayer.y + skyPlayer.height / 2,
            56
        );

        skyAnimation = requestAnimationFrame(updateSkyGame);
    }

    /* =====================================
       INICIAR E FINALIZAR DESAFIO DOS CÉUS
    ===================================== */

    function startSkyGame() {
        createSkyInterface();
        stopSkyGame();

        const canvas = document.getElementById("skyCanvas");
        if (!canvas) return;

        skyScore = 0;
        skyLives = 3;
        skyObjects = [];
        skyKeys = {};
        skyFrame = 0;
        skySpawnCounter = 0;

        skyPlayer = {
            x: 329,
            y: 420,
            width: 42,
            height: 42,
            speed: 5
        };

        createSkyStars();

        skyRunning = true;

        document.getElementById("skyScore").textContent = "0";
        document.getElementById("skyLives").textContent = "3";
        document.getElementById("skyFeedback").textContent =
            "Colete 10 estrelas e desvie das nuvens!";

        updateSkyGame();
    }

    function finishSkyGame(won) {
        if (!skyRunning) return;

        skyRunning = false;

        if (skyAnimation) {
            cancelAnimationFrame(skyAnimation);
        }

        const feedback = document.getElementById("skyFeedback");

        if (won) {
            awardPoints(20);

            if (feedback) {
                feedback.textContent =
                    "Missão concluída! Você ganhou 20 pontos no PlayBook!";
            }
        } else {
            if (feedback) {
                feedback.textContent =
                    "Fim da missão! Você pode tentar novamente.";
            }
        }
    }

    function stopSkyGame() {
        skyRunning = false;

        if (skyAnimation) {
            cancelAnimationFrame(skyAnimation);
            skyAnimation = null;
        }
    }

    // Controles do teclado
    document.addEventListener("keydown", event => {
        if (currentGame !== "sky") return;

        skyKeys[event.key] = true;

        if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
        }
    });

    document.addEventListener("keyup", event => {
        skyKeys[event.key] = false;
    });

    window.addEventListener("blur", () => {
        skyKeys = {};
    });

    /* =====================================
       DESAFIO DA MEMÓRIA
       Encontre os oito pares
    ===================================== */

    const memorySymbols = [
        "★", "◆", "☾", "♫",
        "✿", "●", "▲", "■"
    ];

    let memoryCards = [];
    let memoryFirst = null;
    let memoryLocked = false;
    let memoryMoves = 0;
    let memoryMatches = 0;
    let memoryFinished = false;
    let memoryTimer = null;

    function clearMemoryTimer() {
        if (memoryTimer) {
            clearTimeout(memoryTimer);
            memoryTimer = null;
        }
    }

    function createMemoryInterface() {
        const screen = document.getElementById("memoryGame");

        if (!screen || screen.dataset.ready === "true") return;

        screen.dataset.ready = "true";

        screen.innerHTML = `
            <div class="game-heading">
                <h2>Desafio da Memória</h2>
                <p>Encontre todos os pares e teste sua capacidade de memorização.</p>
            </div>

            <div class="game-status">
                <span>Jogadas: <b id="memoryMoves">0</b></span>
                <span>Pares: <b id="memoryMatches">0</b>/8</span>
            </div>

            <div class="memory-board" id="memoryBoard"></div>

            <p id="memoryFeedback" class="game-feedback">
                Encontre os oito pares!
            </p>

            <div class="game-controls">
                <button class="game-action" id="memoryRestart">
                    Reiniciar
                </button>

                <button class="game-secondary" id="memoryExit">
                    Sair
                </button>
            </div>
        `;

        document.getElementById("memoryRestart").addEventListener(
            "click",
            startMemoryGame
        );

        document.getElementById("memoryExit").addEventListener(
            "click",
            closeGame
        );
    }

    function startMemoryGame() {
        createMemoryInterface();
        clearMemoryTimer();

        memoryCards = [...memorySymbols, ...memorySymbols]
            .sort(() => Math.random() - 0.5);

        memoryFirst = null;
        memoryLocked = false;
        memoryMoves = 0;
        memoryMatches = 0;
        memoryFinished = false;

        document.getElementById("memoryMoves").textContent = "0";
        document.getElementById("memoryMatches").textContent = "0";

        const board = document.getElementById("memoryBoard");
        board.innerHTML = "";

        memoryCards.forEach((symbol, index) => {
            const card = document.createElement("button");

            card.type = "button";
            card.className = "memory-card";
            card.textContent = "?";
            card.setAttribute("aria-label", "Carta fechada");

            card.addEventListener("click", () => {
                revealMemoryCard(index, card);
            });

            board.appendChild(card);
        });

        document.getElementById("memoryFeedback").textContent =
            "Encontre os oito pares!";
    }

    function revealMemoryCard(index, card) {
        if (memoryLocked || memoryFinished) return;

        if (
            card.classList.contains("revealed") ||
            card.classList.contains("matched")
        ) {
            return;
        }

        card.textContent = memoryCards[index];
        card.classList.add("revealed");
        card.setAttribute("aria-label", memoryCards[index]);

        if (memoryFirst === null) {
            memoryFirst = { index, card };
            return;
        }

        memoryMoves++;

        document.getElementById("memoryMoves").textContent =
            memoryMoves;

        const first = memoryFirst;

        if (memoryCards[first.index] === memoryCards[index]) {
            first.card.classList.remove("revealed");
            card.classList.remove("revealed");

            first.card.classList.add("matched");
            card.classList.add("matched");

            memoryMatches++;

            document.getElementById("memoryMatches").textContent =
                memoryMatches;

            memoryFirst = null;

            if (memoryMatches === 8) {
                memoryFinished = true;
                awardPoints(25);

                document.getElementById("memoryFeedback").textContent =
                    "Parabéns! Você encontrou todos os pares e ganhou 25 pontos!";
            } else {
                document.getElementById("memoryFeedback").textContent =
                    "Muito bem! Você encontrou um par.";
            }
        } else {
            memoryLocked = true;

            document.getElementById("memoryFeedback").textContent =
                "Continue tentando! Memorize as posições das cartas.";

            memoryTimer = setTimeout(() => {
                first.card.textContent = "?";
                card.textContent = "?";

                first.card.classList.remove("revealed");
                card.classList.remove("revealed");

                first.card.setAttribute("aria-label", "Carta fechada");
                card.setAttribute("aria-label", "Carta fechada");

                memoryFirst = null;
                memoryLocked = false;
                memoryTimer = null;
            }, 850);
        }
    }

    /* =====================================
       DESAFIO DAS PALAVRAS
       Descubra a palavra embaralhada
    ===================================== */

    const wordQuestions = [
        {
            word: "LIVRO",
            hint: "Objeto que contém histórias e textos."
        },
        {
            word: "LEITURA",
            hint: "Ação de interpretar um texto."
        },
        {
            word: "ESCOLA",
            hint: "Lugar onde aprendemos."
        },
        {
            word: "BIBLIOTECA",
            hint: "Lugar onde encontramos muitos livros."
        },
        {
            word: "HISTORIA",
            hint: "Narrativa de acontecimentos."
        },
        {
            word: "ESCRITA",
            hint: "Ação de registrar palavras."
        },
        {
            word: "AVENTURA",
            hint: "História cheia de descobertas e desafios."
        },
        {
            word: "PERSONAGEM",
            hint: "Quem participa de uma história."
        },
        {
            word: "IMAGINACAO",
            hint: "Capacidade de criar ideias na mente."
        },
        {
            word: "CONHECIMENTO",
            hint: "Aquilo que adquirimos ao aprender."
        }
    ];

    let wordIndex = 0;
    let wordScore = 0;
    let wordList = [];
    let wordCompleted = false;

    function createWordInterface() {
        const screen = document.getElementById("wordGame");

        if (!screen || screen.dataset.ready === "true") return;

        screen.dataset.ready = "true";

        screen.innerHTML = `
            <div class="game-heading">
                <h2>Desafio das Palavras</h2>
                <p>Organize as letras e descubra a palavra escondida.</p>
            </div>

            <div class="game-status">
                <span>Questão: <b id="wordProgress">1</b>/10</span>
                <span>Pontos: <b id="wordScore">0</b></span>
            </div>

            <div class="word-box">
                <p>Qual é a palavra?</p>

                <div class="word-scrambled" id="wordScrambled"></div>

                <p class="word-hint" id="wordHint"></p>

                <input
                    type="text"
                    id="wordInput"
                    class="word-input"
                    placeholder="Digite sua resposta"
                    autocomplete="off"
                    maxlength="20"
                >

                <div class="game-controls">
                    <button class="game-action" id="wordCheck">
                        Responder
                    </button>

                    <button
                        class="game-secondary"
                        id="wordNext"
                        style="display:none"
                    >
                        Próxima palavra
                    </button>
                </div>
            </div>

            <p id="wordFeedback" class="game-feedback">
                Boa sorte!
            </p>

            <div class="game-controls">
                <button class="game-secondary" id="wordExit">
                    Sair
                </button>
            </div>
        `;

        document.getElementById("wordCheck").addEventListener(
            "click",
            checkWord
        );

        document.getElementById("wordNext").addEventListener(
            "click",
            nextWord
        );

        document.getElementById("wordExit").addEventListener(
            "click",
            closeGame
        );

        document.getElementById("wordInput").addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") checkWord();
            }
        );
    }

    function shuffleWord(word) {
        const shuffled = word.split("");

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] =
                [shuffled[j], shuffled[i]];
        }

        if (shuffled.join("") === word) {
            return shuffleWord(word);
        }

        return shuffled.join("");
    }

    function startWordGame() {
        createWordInterface();

        wordList = [...wordQuestions]
            .sort(() => Math.random() - 0.5);

        wordIndex = 0;
        wordScore = 0;
        wordCompleted = false;

        const input = document.getElementById("wordInput");

        input.style.display = "block";
        input.disabled = false;

        document.getElementById("wordScore").textContent = "0";

        showWord();
    }

    function showWord() {
        if (wordIndex >= wordList.length) {
            finishWordGame();
            return;
        }

        const question = wordList[wordIndex];

        document.getElementById("wordProgress").textContent =
            wordIndex + 1;

        document.getElementById("wordScrambled").textContent =
            shuffleWord(question.word);

        document.getElementById("wordHint").textContent =
            "Dica: " + question.hint;

        const input = document.getElementById("wordInput");

        input.value = "";
        input.disabled = false;
        input.style.display = "block";

        document.getElementById("wordCheck").style.display =
            "inline-block";

        document.getElementById("wordNext").style.display =
            "none";

        document.getElementById("wordFeedback").textContent =
            "Qual é a resposta?";

        input.focus();
    }

    function normalizeWord(value) {
        return value
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();
    }

    function checkWord() {
        if (wordCompleted || wordIndex >= wordList.length) return;

        const input = document.getElementById("wordInput");

        const answer = normalizeWord(input.value);

        if (!answer) {
            document.getElementById("wordFeedback").textContent =
                "Digite uma palavra antes de responder.";
            return;
        }

        const correct = wordList[wordIndex].word;

        if (answer === correct) {
            wordScore += 10;

            document.getElementById("wordScore").textContent =
                wordScore;

            document.getElementById("wordFeedback").textContent =
                "Resposta correta! Você ganhou 10 pontos.";
        } else {
            document.getElementById("wordFeedback").textContent =
                "Não foi dessa vez. A resposta era " + correct + ".";
        }

        input.disabled = true;

        document.getElementById("wordCheck").style.display =
            "none";

        document.getElementById("wordNext").style.display =
            "inline-block";
    }

    function nextWord() {
        wordIndex++;
        showWord();
    }

    function finishWordGame() {
        if (wordCompleted) return;

        wordCompleted = true;

        const earned = wordScore;

        awardPoints(earned);

        document.getElementById("wordProgress").textContent = "10";
        document.getElementById("wordScrambled").textContent = "Fim!";
        document.getElementById("wordHint").textContent =
            "Você concluiu todas as palavras.";

        document.getElementById("wordInput").style.display = "none";
        document.getElementById("wordCheck").style.display = "none";
        document.getElementById("wordNext").style.display = "none";

        document.getElementById("wordFeedback").textContent =
            "Você fez " + earned +
            " pontos e recebeu essa mesma quantidade no PlayBook!";
    }

    /* =====================================
       INICIALIZAÇÃO
    ===================================== */

    updatePoints();

})();
