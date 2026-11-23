/* =========================================================
   PLAYBOOK - SISTEMA DE JOGOS
   ========================================================= */

/* =========================================================
   VARIÁVEIS GERAIS
   ========================================================= */

   let selectedGame = null;
   let gameInterval = null;
   let gameRunning = false;
   let score = 0;
   
   
   /* =========================================================
      SISTEMA DE TEMPO
      ========================================================= */
   
   function formatTime(seconds) {
   
       seconds = Math.max(0, Math.floor(seconds));
   
       const hours = Math.floor(seconds / 3600);
   
       const minutes = Math.floor(
           (seconds % 3600) / 60
       );
   
       const secs = seconds % 60;
   
       return (
           String(hours).padStart(2, "0") +
           ":" +
           String(minutes).padStart(2, "0") +
           ":" +
           String(secs).padStart(2, "0")
       );
   }
   
   
   function getReadingTime() {
   
       return Number(
           localStorage.getItem(
               "playbookReadingTime"
           ) || 0
       );
   }
   
   
   function getGameTime() {
   
       return Number(
           localStorage.getItem(
               "playbookGameTime"
           ) || 0
       );
   }
   
   
   function saveGameTime(seconds) {
   
       localStorage.setItem(
           "playbookGameTime",
           String(
               Math.max(
                   0,
                   Math.floor(seconds)
               )
           )
       );
   }
   
   
   /* =========================================================
      ATUALIZAR TEMPO NA INTERFACE
      ========================================================= */
   
   function updateTimeDisplay() {
   
       const reading =
           document.getElementById(
               "readingTime"
           );
   
       const game =
           document.getElementById(
               "gameTime"
           );
   
       const available =
           document.getElementById(
               "availableGameTime"
           );
   
       const timer =
           document.getElementById(
               "gameTimer"
           );
   
   
       if (reading) {
   
           reading.textContent =
               formatTime(
                   getReadingTime()
               );
   
       }
   
   
       if (game) {
   
           game.textContent =
               formatTime(
                   getGameTime()
               );
   
       }
   
   
       if (available) {
   
           available.textContent =
               formatTime(
                   getGameTime()
               );
   
       }
   
   
       if (timer) {
   
           timer.textContent =
               formatTime(
                   getGameTime()
               );
   
       }
   }
   
   
   /* =========================================================
      ABRIR POPUP DO JOGO
      ========================================================= */
   
   function openGame(game) {
   
       const popup =
           document.getElementById(
               "gameArea"
           );
   
   
       if (!popup) {
   
           console.error(
               "Erro: #gameArea não foi encontrado."
           );
   
           return;
       }
   
   
       if (getGameTime() <= 0) {
   
           showPlaybookAlert(
               "Sem tempo de jogo",
               "Você não possui tempo de jogo disponível. Leia para conquistar mais tempo."
           );
   
           return;
       }
   
   
       selectedGame = game;
   
       score = 0;
   
       gameRunning = false;
   
   
       popup.hidden = false;
   
       document.body.style.overflow =
           "hidden";
   
   
       const startScreen =
           document.getElementById(
               "gameStartScreen"
           );
   
       const gameOver =
           document.getElementById(
               "gameOverScreen"
           );
   
   
       if (startScreen) {
   
           startScreen.hidden = false;
   
       }
   
   
       if (gameOver) {
   
           gameOver.hidden = true;
   
       }
   
   
       hideGames();
   
   
       const title =
           document.getElementById(
               "popupGameTitle"
           );
   
       const description =
           document.getElementById(
               "popupGameDescription"
           );
   
       const controls =
           document.getElementById(
               "gameControls"
           );
   
   
       if (game === "sky") {
   
           if (title) {
   
               title.textContent =
                   "Desafio dos Céus";
   
           }
   
           if (description) {
   
               description.textContent =
                   "Desvie dos obstáculos e tente alcançar a maior pontuação.";
   
           }
   
           if (controls) {
   
               controls.textContent =
                   "Controle: Espaço ou seta para cima.";
   
           }
       }
   
   
       else if (game === "memory") {
   
           if (title) {
   
               title.textContent =
                   "Desafio da Memória";
   
           }
   
           if (description) {
   
               description.textContent =
                   "Encontre todos os pares.";
   
           }
   
           if (controls) {
   
               controls.textContent =
                   "Controle: clique nas cartas.";
   
           }
       }
   
   
       else if (game === "word") {
   
           if (title) {
   
               title.textContent =
                   "Desafio das Palavras";
   
           }
   
           if (description) {
   
               description.textContent =
                   "Forme as palavras corretamente.";
   
           }
   
           if (controls) {
   
               controls.textContent =
                   "Controle: teclado.";
   
           }
       }
   
   
       updateTimeDisplay();
   }
   
   
   /* =========================================================
      COMEÇAR JOGO
      ========================================================= */
   
   function startSelectedGame() {
   
       if (!selectedGame) {
   
           console.error(
               "Nenhum jogo selecionado."
           );
   
           return;
       }
   
   
       if (getGameTime() <= 0) {
   
           finishGame();
   
           return;
       }
   
   
       const startScreen =
           document.getElementById(
               "gameStartScreen"
           );
   
   
       if (startScreen) {
   
           startScreen.hidden = true;
   
       }
   
   
       hideGames();
   
   
       /*
          CORREÇÃO PRINCIPAL:
   
          O contador é iniciado ANTES do jogo.
   
          Dessa forma:
          gameRunning = true
   
          antes de startSkyGame(),
          startMemoryGame() ou
          startWordGame().
       */
   
       startGameTimer();
   
   
       /* =====================================================
          DESAFIO DOS CÉUS
          ===================================================== */
   
       if (selectedGame === "sky") {
   
           const sky =
               document.getElementById(
                   "skyGame"
               );
   
   
           if (sky) {
   
               sky.hidden = false;
   
           }
   
   
           startSkyGame();
       }
   
   
       /* =====================================================
          DESAFIO DA MEMÓRIA
          ===================================================== */
   
       else if (selectedGame === "memory") {
   
           const memory =
               document.getElementById(
                   "memoryGame"
               );
   
   
           if (memory) {
   
               memory.hidden = false;
   
           }
   
   
           startMemoryGame();
       }
   
   
       /* =====================================================
          DESAFIO DAS PALAVRAS
          ===================================================== */
   
       else if (selectedGame === "word") {
   
           const word =
               document.getElementById(
                   "wordGame"
               );
   
   
           if (word) {
   
               word.hidden = false;
   
           }
   
   
           startWordGame();
       }
   }
   
   
   /* =========================================================
      ESCONDER TODOS OS JOGOS
      ========================================================= */
   
   function hideGames() {
   
       const sky =
           document.getElementById(
               "skyGame"
           );
   
       const memory =
           document.getElementById(
               "memoryGame"
           );
   
       const word =
           document.getElementById(
               "wordGame"
           );
   
   
       if (sky) {
   
           sky.hidden = true;
   
       }
   
   
       if (memory) {
   
           memory.hidden = true;
   
       }
   
   
       if (word) {
   
           word.hidden = true;
   
       }
   }
   
   
   /* =========================================================
      CONTADOR DO TEMPO DE JOGO
      ========================================================= */
   
   function startGameTimer() {
   
       stopGameTimer();
   
       gameRunning = true;
   
   
       updateTimeDisplay();
   
   
       gameInterval =
           setInterval(
               function () {
   
                   let time =
                       getGameTime();
   
   
                   if (time <= 0) {
   
                       saveGameTime(0);
   
                       finishGame();
   
                       return;
                   }
   
   
                   time--;
   
   
                   saveGameTime(
                       time
                   );
   
   
                   updateTimeDisplay();
   
   
                   if (time <= 0) {
   
                       finishGame();
   
                   }
   
               },
               1000
           );
   }
   
   
   function stopGameTimer() {
   
       if (gameInterval !== null) {
   
           clearInterval(
               gameInterval
           );
   
           gameInterval = null;
       }
   }
   
   
   /* =========================================================
      FECHAR JOGO
      ========================================================= */
   
   function closeGame() {
   
       stopGameTimer();
   
   
       gameRunning = false;
   
       selectedGame = null;
   
   
       if (skyAnimation) {
   
           cancelAnimationFrame(
               skyAnimation
           );
   
           skyAnimation = null;
       }
   
   
       document.onkeydown = null;
   
   
       const popup =
           document.getElementById(
               "gameArea"
           );
   
   
       if (popup) {
   
           popup.hidden = true;
   
       }
   
   
       hideGames();
   
   
       document.body.style.overflow =
           "";
   
   
       updateTimeDisplay();
   }
   
   
   /* =========================================================
      FINALIZAR JOGO
      ========================================================= */
   
   function finishGame() {
   
       stopGameTimer();
   
   
       gameRunning = false;
   
   
       if (skyAnimation) {
   
           cancelAnimationFrame(
               skyAnimation
           );
   
           skyAnimation = null;
       }
   
   
       document.onkeydown = null;
   
   
       hideGames();
   
   
       const startScreen =
           document.getElementById(
               "gameStartScreen"
           );
   
       const gameOver =
           document.getElementById(
               "gameOverScreen"
           );
   
       const finalScore =
           document.getElementById(
               "finalScore"
           );
   
   
       if (startScreen) {
   
           startScreen.hidden = true;
   
       }
   
   
       if (finalScore) {
   
           finalScore.textContent =
               score;
       }
   
   
       if (gameOver) {
   
           gameOver.hidden = false;
   
       }
   
   
       updateTimeDisplay();
   }
   
   
   /* =========================================================
      REINICIAR JOGO
      ========================================================= */
   
   function restartGame() {
   
       if (getGameTime() <= 0) {
   
           finishGame();
   
           return;
       }
   
   
       score = 0;
   
   
       const gameOver =
           document.getElementById(
               "gameOverScreen"
           );
   
   
       if (gameOver) {
   
           gameOver.hidden = true;
   
       }
   
   
       startSelectedGame();
   }
   
   
   /* =========================================================
      DESAFIO DOS CÉUS
      ========================================================= */
   
   let player = null;
   let obstacles = [];
   let skyFrame = 0;
   let skyAnimation = null;
   
   
   function startSkyGame() {
   
       const canvas =
           document.getElementById(
               "gameCanvas"
           );
   
   
       if (!canvas) {
   
           console.error(
               "Canvas do jogo não encontrado."
           );
   
           return;
       }
   
   
       const ctx =
           canvas.getContext(
               "2d"
           );
   
   
       if (!ctx) {
   
           console.error(
               "Não foi possível obter o contexto 2D do canvas."
           );
   
           return;
       }
   
   
       /*
          Cancela uma animação anterior,
          caso exista.
       */
   
       if (skyAnimation) {
   
           cancelAnimationFrame(
               skyAnimation
           );
   
           skyAnimation = null;
       }
   
   
       player = {
   
           x: 100,
   
           y: 220,
   
           width: 35,
   
           height: 35,
   
           velocity: 0
   
       };
   
   
       obstacles = [];
   
       skyFrame = 0;
   
       score = 0;
   
   
       /* =====================================================
          PULO
          ===================================================== */
   
       function jump() {
   
           if (!gameRunning) {
   
               return;
           }
   
   
           player.velocity = -8;
       }
   
   
       /*
          Teclado
       */
   
       document.onkeydown =
           function (event) {
   
               if (
                   event.code === "Space" ||
                   event.code === "ArrowUp"
               ) {
   
                   event.preventDefault();
   
                   jump();
               }
   
           };
   
   
       /*
          Clique/touch no canvas também permite pular.
       */
   
       canvas.onclick =
           function () {
   
               jump();
   
           };
   
   
       /* =====================================================
          CRIAR OBSTÁCULO
          ===================================================== */
   
       function createObstacle() {
   
           const gap = 170;
   
   
           const top =
               Math.floor(
                   Math.random() * 210
               ) + 40;
   
   
           obstacles.push({
   
               x: canvas.width,
   
               width: 55,
   
               top: top,
   
               gap: gap,
   
               counted: false
   
           });
       }
   
   
       /* =====================================================
          COLISÃO
          ===================================================== */
   
       function collision(obstacle) {
   
           const hitHorizontal =
               player.x <
               obstacle.x +
               obstacle.width &&
               player.x +
               player.width >
               obstacle.x;
   
   
           const hitVertical =
               player.y <
               obstacle.top ||
               player.y +
               player.height >
               obstacle.top +
               obstacle.gap;
   
   
           return (
               hitHorizontal &&
               hitVertical
           );
       }
   
   
       /* =====================================================
          LOOP DO JOGO
          ===================================================== */
   
       function loop() {
   
           if (!gameRunning) {
   
               return;
           }
   
   
           /*
              LIMPAR CANVAS
           */
   
           ctx.clearRect(
               0,
               0,
               canvas.width,
               canvas.height
           );
   
   
           /* =================================================
              FUNDO
              ================================================= */
   
           ctx.fillStyle =
               "#B77BE8";
   
   
           ctx.fillRect(
               0,
               0,
               canvas.width,
               canvas.height
           );
   
   
           /* =================================================
              DETALHES DO FUNDO
              ================================================= */
   
           ctx.fillStyle =
               "rgba(255,255,255,0.18)";
   
   
           ctx.fillRect(
               0,
               0,
               canvas.width,
               8
           );
   
   
           ctx.fillRect(
               0,
               canvas.height - 8,
               canvas.width,
               8
           );
   
   
           /* =================================================
              JOGADOR
              ================================================= */
   
           player.velocity += 0.4;
   
           player.y +=
               player.velocity;
   
   
           /*
              Corpo do jogador
           */
   
           ctx.fillStyle =
               "#5A189A";
   
   
           ctx.fillRect(
               player.x,
               player.y,
               player.width,
               player.height
           );
   
   
           /*
              Detalhe do jogador
           */
   
           ctx.fillStyle =
               "#FFFFFF";
   
   
           ctx.fillRect(
               player.x + 22,
               player.y + 8,
               6,
               6
           );
   
   
           /* =================================================
              CRIAR OBSTÁCULOS
              ================================================= */
   
           if (
               skyFrame % 100 === 0
           ) {
   
               createObstacle();
   
           }
   
   
           /* =================================================
              OBSTÁCULOS
              ================================================= */
   
           obstacles.forEach(
               function (obstacle) {
   
                   obstacle.x -= 4;
   
   
                   /*
                      Cor dos obstáculos
                   */
   
                   ctx.fillStyle =
                       "#386C1C";
   
   
                   /*
                      Obstáculo superior
                   */
   
                   ctx.fillRect(
                       obstacle.x,
                       0,
                       obstacle.width,
                       obstacle.top
                   );
   
   
                   /*
                      Obstáculo inferior
                   */
   
                   ctx.fillRect(
                       obstacle.x,
                       obstacle.top +
                       obstacle.gap,
                       obstacle.width,
                       canvas.height
                   );
   
   
                   /*
                      Contabilizar ponto
                   */
   
                   if (
                       !obstacle.counted &&
                       obstacle.x +
                       obstacle.width <
                       player.x
                   ) {
   
                       obstacle.counted = true;
   
                       score++;
   
                   }
   
   
                   /*
                      Verificar colisão
                   */
   
                   if (
                       collision(
                           obstacle
                       )
                   ) {
   
                       finishGame();
   
                       return;
   
                   }
   
               }
           );
   
   
           /*
              Remover obstáculos que saíram
              da tela.
           */
   
           obstacles =
               obstacles.filter(
                   function (obstacle) {
   
                       return (
                           obstacle.x +
                           obstacle.width >
                           0
                       );
   
                   }
               );
   
   
           /* =================================================
              VERIFICAR LIMITES
              ================================================= */
   
           if (
               player.y < 0 ||
               player.y +
               player.height >
               canvas.height
           ) {
   
               finishGame();
   
               return;
           }
   
   
           /* =================================================
              PONTUAÇÃO
              ================================================= */
   
           ctx.fillStyle =
               "#FFFFFF";
   
   
           ctx.font =
               "bold 22px monospace";
   
   
           ctx.fillText(
               "Pontos: " + score,
               20,
               35
           );
   
   
           /* =================================================
              PRÓXIMO FRAME
              ================================================= */
   
           skyFrame++;
   
   
           skyAnimation =
               requestAnimationFrame(
                   loop
               );
       }
   
   
       /*
          COMEÇAR O LOOP
   
          Neste ponto gameRunning já está true,
          pois startGameTimer() foi chamado antes.
       */
   
       loop();
   }
   
   
   /* =========================================================
      DESAFIO DA MEMÓRIA
      ========================================================= */
   
   let firstCard = null;
   let lockCards = false;
   let pairsFound = 0;
   
   
   function startMemoryGame() {
   
       const board =
           document.getElementById(
               "memoryBoard"
           );
   
   
       if (!board) {
   
           console.error(
               "Tabuleiro da memória não encontrado."
           );
   
           return;
       }
   
   
       board.innerHTML = "";
   
   
       firstCard = null;
   
       lockCards = false;
   
       pairsFound = 0;
   
       score = 0;
   
   
       const values = [
   
           "A",
           "A",
   
           "B",
           "B",
   
           "C",
           "C",
   
           "D",
           "D",
   
           "E",
           "E",
   
           "F",
           "F"
   
       ];
   
   
       /*
          Embaralhar cartas
       */
   
       values.sort(
           function () {
   
               return Math.random() - 0.5;
   
           }
       );
   
   
       values.forEach(
           function (value) {
   
               const card =
                   document.createElement(
                       "button"
                   );
   
   
               card.type = "button";
   
   
               card.className =
                   "memory-card";
   
   
               card.dataset.value =
                   value;
   
   
               card.textContent =
                   "?";
   
   
               card.onclick =
                   function () {
   
                       revealCard(
                           card
                       );
   
                   };
   
   
               board.appendChild(
                   card
               );
   
           }
       );
   }
   
   
   /* =========================================================
      REVELAR CARTA
      ========================================================= */
   
   function revealCard(card) {
   
       if (
           !gameRunning ||
           lockCards ||
           card.classList.contains(
               "revealed"
           ) ||
           card.classList.contains(
               "matched"
           )
       ) {
   
           return;
       }
   
   
       card.classList.add(
           "revealed"
       );
   
   
       card.textContent =
           card.dataset.value;
   
   
       /*
          Primeira carta
       */
   
       if (!firstCard) {
   
           firstCard = card;
   
           return;
       }
   
   
       /*
          Par encontrado
       */
   
       if (
           firstCard.dataset.value ===
           card.dataset.value
       ) {
   
           firstCard.classList.add(
               "matched"
           );
   
   
           card.classList.add(
               "matched"
           );
   
   
           pairsFound++;
   
   
           score += 10;
   
   
           firstCard = null;
   
   
           /*
              Todas as cartas encontradas
           */
   
           if (
               pairsFound === 6
           ) {
   
               setTimeout(
                   function () {
   
                       finishGame();
   
                   },
                   300
               );
   
           }
   
   
           return;
       }
   
   
       /*
          Cartas diferentes
       */
   
       lockCards = true;
   
   
       const oldCard =
           firstCard;
   
   
       setTimeout(
           function () {
   
               card.classList.remove(
                   "revealed"
               );
   
   
               oldCard.classList.remove(
                   "revealed"
               );
   
   
               card.textContent =
                   "?";
   
   
               oldCard.textContent =
                   "?";
   
   
               firstCard = null;
   
               lockCards = false;
   
           },
           700
       );
   }
   
   
   /* =========================================================
      DESAFIO DAS PALAVRAS
      ========================================================= */
   
   const words = [
   
       "LIVRO",
   
       "ESCOLA",
   
       "LEITURA",
   
       "JOGO",
   
       "PALAVRA",
   
       "ESTUDO",
   
       "HISTORIA"
   
   ];
   
   
   let currentWord = "";
   
   
   /* =========================================================
      COMEÇAR PALAVRAS
      ========================================================= */
   
   function startWordGame() {
   
       score = 0;
   
   
       nextWord();
   
   
       const input =
           document.getElementById(
               "wordInput"
           );
   
   
       if (input) {
   
           input.value = "";
   
   
           setTimeout(
               function () {
   
                   input.focus();
   
               },
               100
           );
       }
   }
   
   
   /* =========================================================
      PRÓXIMA PALAVRA
      ========================================================= */
   
   function nextWord() {
   
       const random =
           Math.floor(
               Math.random() *
               words.length
           );
   
   
       currentWord =
           words[random];
   
   
       const letters =
           document.getElementById(
               "wordLetters"
           );
   
   
       const message =
           document.getElementById(
               "wordMessage"
           );
   
   
       if (letters) {
   
           const shuffled =
               currentWord
                   .split("")
                   .sort(
                       function () {
   
                           return (
                               Math.random() -
                               0.5
                           );
   
                       }
                   )
                   .join(" ");
   
   
           letters.textContent =
               shuffled;
       }
   
   
       if (message) {
   
           message.textContent =
               "";
   
       }
   }
   
   
   /* =========================================================
      VERIFICAR PALAVRA
      ========================================================= */
   
   function checkWord() {
   
       if (!gameRunning) {
   
           return;
       }
   
   
       const input =
           document.getElementById(
               "wordInput"
           );
   
   
       const message =
           document.getElementById(
               "wordMessage"
           );
   
   
       if (!input) {
   
           return;
       }
   
   
       const answer =
           input.value
               .trim()
               .toUpperCase();
   
   
       if (
           answer ===
           currentWord
       ) {
   
           score += 10;
   
   
           if (message) {
   
               message.textContent =
                   "Resposta correta!";
   
           }
   
   
           input.value = "";
   
   
           setTimeout(
               function () {
   
                   if (!gameRunning) {
   
                       return;
                   }
   
   
                   nextWord();
   
   
                   input.focus();
   
               },
               500
           );
   
       }
   
   
       else {
   
           if (message) {
   
               message.textContent =
                   "Resposta incorreta.";
   
           }
   
       }
   }
   
   
   /* =========================================================
      PERMITIR ENTER NO JOGO DAS PALAVRAS
      ========================================================= */
   
   document.addEventListener(
       "keydown",
       function (event) {
   
           if (
               event.key === "Enter"
           ) {
   
               const input =
                   document.getElementById(
                       "wordInput"
                   );
   
   
               if (
                   input &&
                   document.activeElement ===
                   input
               ) {
   
                   event.preventDefault();
   
                   checkWord();
   
               }
   
           }
   
       }
   );
   
   
   /* =========================================================
      ALERTA PERSONALIZADO PLAYBOOK
      ========================================================= */
   
   function showPlaybookAlert(
       title,
       message
   ) {
   
       let modal =
           document.getElementById(
               "playbookAlert"
           );
   
   
       /*
          Criar modal caso ainda não exista.
       */
   
       if (!modal) {
   
           modal =
               document.createElement(
                   "div"
               );
   
   
           modal.id =
               "playbookAlert";
   
   
           modal.className =
               "playbook-modal";
   
   
           modal.innerHTML = `
   
               <div class="playbook-modal-box">
   
                   <h2></h2>
   
                   <p></p>
   
                   <button
                       type="button"
                       class="playbook-modal-button"
                   >
                       OK
                   </button>
   
               </div>
   
           `;
   
   
           document.body.appendChild(
               modal
           );
   
   
           const button =
               modal.querySelector(
                   "button"
               );
   
   
           button.onclick =
               function () {
   
                   modal.classList.remove(
                       "show"
                   );
   
               };
       }
   
   
       const modalTitle =
           modal.querySelector(
               "h2"
           );
   
   
       const modalMessage =
           modal.querySelector(
               "p"
           );
   
   
       if (modalTitle) {
   
           modalTitle.textContent =
               title;
   
       }
   
   
       if (modalMessage) {
   
           modalMessage.textContent =
               message;
   
       }
   
   
       modal.classList.add(
           "show"
       );
   }
   
   
   /* =========================================================
      INICIALIZAÇÃO
      ========================================================= */
   
   document.addEventListener(
       "DOMContentLoaded",
       function () {
   
           updateTimeDisplay();
   
       }
   );