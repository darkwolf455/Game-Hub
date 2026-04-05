let isSnakeRunning = false;
let snakeTimeout;

function showGame(game, btn) {
    isSnakeRunning = false;
    clearTimeout(snakeTimeout);
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));
    document.getElementById(game + '-container').classList.add('active');
    document.body.className = game + '-bg';
    if(game === 'ttt') initTTT();
    if(game === 'mem') initMemory();
}

// ================= TIC TAC TOE (UNBEATABLE) =================
const tttBoxes = document.querySelectorAll(".box");
const tttInfo = document.querySelector(".ttt-info");
const tttDiffBtns = document.querySelectorAll(".ttt-diff-btn");
let tttGrid, tttActive, tttPlayer, tttIsBot = false, tttLevel = 'easy';
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function initTTT() {
    tttPlayer = "X"; tttGrid = ["","","","","","","","",""]; tttActive = true;
    tttBoxes.forEach(b => { b.innerText = ""; b.classList.remove("win"); b.style.pointerEvents = "all"; });
    tttInfo.innerText = `Current Turn: ${tttPlayer}`;
}

tttDiffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tttDiffBtns.forEach(b => b.classList.remove("active-tab"));
        btn.classList.add("active-tab");
        tttLevel = btn.dataset.level;
        initTTT();
    });
});

function handleTTTClick(i) {
    if(!tttActive || tttGrid[i] !== "") return;
    tttGrid[i] = tttPlayer;
    tttBoxes[i].innerText = tttPlayer;
    if(checkTTTWin()) return;
    tttPlayer = tttPlayer === "X" ? "O" : "X";
    tttInfo.innerText = `Current Turn: ${tttPlayer}`;
    if(tttIsBot && tttPlayer === "O") {
        tttBoxes.forEach(b => b.style.pointerEvents = "none");
        setTimeout(tttBotMove, 600);
    }
}

function tttBotMove() {
    let move;
    if (tttLevel === 'easy') move = getRandomMove();
    else if (tttLevel === 'medium') move = getProMove();
    else move = getBestMove(); 

    tttGrid[move] = "O";
    tttBoxes[move].innerText = "O";
    if(!checkTTTWin()) {
        tttPlayer = "X"; tttInfo.innerText = `Current Turn: ${tttPlayer}`;
        tttBoxes.forEach((v, i) => { if(tttGrid[i] === "") tttBoxes[i].style.pointerEvents = "all"; });
    }
}

function getRandomMove() {
    let empty = tttGrid.map((v,i) => v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

function getProMove() {
    for(let i=0; i<9; i++) {
        if(tttGrid[i]==="") {
            tttGrid[i]="O"; if(checkInternalWinner(tttGrid)==="O") {tttGrid[i]=""; return i;}
            tttGrid[i]="X"; if(checkInternalWinner(tttGrid)==="X") {tttGrid[i]=""; return i;}
            tttGrid[i]="";
        }
    }
    return getRandomMove();
}

function getBestMove() {
    let bestScore = -Infinity; let move;
    for(let i=0; i<9; i++) {
        if(tttGrid[i] === "") {
            tttGrid[i] = "O";
            let score = minimax(tttGrid, 0, false);
            tttGrid[i] = "";
            if(score > bestScore) { bestScore = score; move = i; }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let res = checkInternalWinner(board);
    if (res === "O") return 10 - depth;
    if (res === "X") return depth - 10;
    if (!board.includes("")) return 0;
    if (isMaximizing) {
        let best = -Infinity;
        for (let i=0; i<9; i++) {
            if (board[i]==="") { board[i]="O"; best = Math.max(best, minimax(board, depth+1, false)); board[i]=""; }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i=0; i<9; i++) {
            if (board[i]==="") { board[i]="X"; best = Math.min(best, minimax(board, depth+1, true)); board[i]=""; }
        }
        return best;
    }
}

function checkInternalWinner(grid) {
    for (let p of wins) { if (grid[p[0]] !== "" && grid[p[0]] === grid[p[1]] && grid[p[0]] === grid[p[2]]) return grid[p[0]]; }
    return null;
}

function checkTTTWin() {
    let winner = checkInternalWinner(tttGrid);
    if(winner) {
        wins.forEach(p => { if(tttGrid[p[0]] === winner && tttGrid[p[1]] === winner && tttGrid[p[2]] === winner) p.forEach(idx => tttBoxes[idx].classList.add("win")); });
        tttInfo.innerText = `Winner: ${winner}`; tttActive = false; return true;
    }
    if(!tttGrid.includes("")) { tttInfo.innerText = "Game Tied!"; tttActive = false; return true; }
    return false;
}

tttBoxes.forEach((b, i) => b.addEventListener("click", () => handleTTTClick(i)));
document.getElementById("pve-btn").onclick = function() { tttIsBot = true; this.classList.add('active-tab'); document.getElementById('pvp-btn').classList.remove('active-tab'); document.getElementById('ttt-diff-box').style.display='flex'; initTTT(); };
document.getElementById("pvp-btn").onclick = function() { tttIsBot = false; this.classList.add('active-tab'); document.getElementById('pve-btn').classList.remove('active-tab'); document.getElementById('ttt-diff-box').style.display='none'; initTTT(); };

// ================= CARD FLIP (3x4 & 4x4 GRIDS) =================
let memDiff = 'easy', flipped = [], matched = 0;
const icons = ["🍎","🍌","🍇","🍓","🍒","🍍","🥝","🍉","🚀","🎮","🏀","🎲","💎","🌈","🎨","🧩"];

function initMemory() {
    const grid = document.getElementById("memory-grid");
    grid.innerHTML = ""; flipped = []; matched = 0;
    let pairs = 6, cols = 4;
    if(memDiff === 'easy') { pairs = 6; cols = 4; } // 3x4
    else if(memDiff === 'medium') { pairs = 8; cols = 4; } // 4x4
    else { pairs = 12; cols = 4; } // 6x4
    
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    let gameIcons = [...icons.slice(0, pairs), ...icons.slice(0, pairs)].sort(() => Math.random() - 0.5);
    gameIcons.forEach(icon => {
        const card = document.createElement("div");
        card.className = "mem-card";
        card.innerHTML = `<span>${icon}</span>`;
        card.onclick = () => {
            if(flipped.length < 2 && !card.classList.contains('flipped')) {
                card.classList.add('flipped'); flipped.push(card);
                if(flipped.length === 2) setTimeout(() => {
                    if(flipped[0].innerHTML === flipped[1].innerHTML) matched++;
                    else flipped.forEach(c => c.classList.remove('flipped'));
                    flipped = [];
                    document.querySelector(".mem-info").innerText = `Pairs Found: ${matched}`;
                }, 600);
            }
        };
        grid.appendChild(card);
    });
}
document.querySelectorAll(".mem-diff-btn").forEach(btn => btn.onclick = function() {
    document.querySelectorAll(".mem-diff-btn").forEach(b => b.classList.remove('active-tab'));
    this.classList.add('active-tab'); memDiff = this.dataset.level; initMemory();
});

// ================= SNAKE PRO (8 SPEED LEVELS) =================
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
let snake, food, direction, score, candyCount;
const speedLevels = [280, 240, 200, 175, 150, 125, 100, 75];

function startSnake() {
    isSnakeRunning = true; clearTimeout(snakeTimeout);
    snake = [{x: 10, y: 10}]; food = {x: 5, y: 5};
    direction = 'right'; score = 0; candyCount = 0;
    document.getElementById("snk-sc").innerText = score;
    runSnake();
}

function runSnake() {
    if (!isSnakeRunning) return;
    const head = {...snake[0]};
    if(direction === 'up') head.y--; if(direction === 'down') head.y++;
    if(direction === 'left') head.x--; if(direction === 'right') head.x++;
    if(head.x<0 || head.x>=20 || head.y<0 || head.y>=20 || snake.some(s=>s.x===head.x && s.y===head.y)) {
        isSnakeRunning = false; alert("Snake Died! Score: " + score); return;
    }
    snake.unshift(head);
    if(head.x === food.x && head.y === food.y) {
        score += 10; candyCount++;
        food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
    } else snake.pop();

    ctx.fillStyle = "#000"; ctx.fillRect(0,0,300,300);
    ctx.fillStyle = "#4facfe"; snake.forEach(s => ctx.fillRect(s.x*15, s.y*15, 14, 14));
    ctx.fillStyle = "#ff4e6e"; ctx.fillRect(food.x*15, food.y*15, 14, 14);
    document.getElementById("snk-sc").innerText = score;

    let lvl = Math.floor(candyCount / 5);
    if(lvl >= speedLevels.length) lvl = speedLevels.length - 1;
    snakeTimeout = setTimeout(runSnake, speedLevels[lvl]);
}

function changeDir(d) {
    if(d==='up' && direction!=='down') direction='up';
    if(d==='down' && direction!=='up') direction='down';
    if(d==='left' && direction!=='right') direction='left';
    if(d==='right' && direction!=='left') direction='right';
}

window.addEventListener("keydown", e => {
    let k = e.key.toLowerCase();
    if(k==="arrowup" || k==="w") changeDir('up');
    if(k==="arrowdown" || k==="s") changeDir('down');
    if(k==="arrowleft" || k==="a") changeDir('left');
    if(k==="arrowright" || k==="d") changeDir('right');
});

initTTT();