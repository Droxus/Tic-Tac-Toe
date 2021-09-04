
let fillCellsCounter, isXturn, TimeOutId, gameMode, isBotTurn, finished;
const grid = document.getElementById('grid');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);
const svgStrikethrough = document.getElementById('strikethrough');
const select = document.getElementsByName('gameMode')[0];
const MODE = {
    BOT_EASY: 'Easy bot',
    BOT_HARD: 'Insane bot',
    PVP_OFFLINE: 'Local PvP',
    PVP_ONLINE: 'Online PvP',
};
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// ========================= Setup =========================
for (const mode in MODE) {
    const option = document.createElement('option');
    option.innerText = option.value = MODE[mode];
    select.appendChild(option);
}

window.onclick = onWindowClick;

select.addEventListener('input', onSelect);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick);
    cell.addEventListener('mouseenter', onEnter);
    cell.addEventListener('mouseleave', onLeave);
}

reset();
checkBotTurn();
// =========================================================

// ==================== Event Listeners ====================
function onSelect(event) {
    reset();
    checkBotTurn();
}

function onEnter(event) {
    const svg = event.currentTarget;
    clearTimeout(svg.timeOutId);
    const use = svg.firstElementChild;
    if (isSvgLocked(use)) { return; }
    svg.timeOutId = setTimeout(() => {
        drawSvg(use, 0.3, false);
    }, 200);
}

function onLeave(event) {
    const svg = event.currentTarget;
    clearTimeout(svg.timeOutId);
    const use = svg.firstElementChild;
    if (isSvgLocked(use)) { return; }
    use.removeAttribute('opacity');
    use.removeAttribute('href');
}

function onClick(event) {
    const svg = event.currentTarget;
    clearTimeout(svg.timeOutId);
    const use = svg.firstElementChild;
    if (isSvgLocked(use)) { return; }
    makeMove(event);
}

function onWindowClick(event) {
    if (Array.from(modal.children).includes(event.target)) { hideModal(); }
}
// =========================================================

// ========================= Moves =========================
function checkBotTurn() {
    const shouldBotMakeMove = (gameMode === MODE.BOT_EASY || gameMode === MODE.BOT_HARD) && isBotTurn;
    if (!shouldBotMakeMove) { return; }
    makeBotMove();
    changeTurn();
}

function changeTurn() {
    if (finished) { return; }
    fillCellsCounter++;
    isXturn = !isXturn;
    checkWinner();
    isBotTurn = !isBotTurn;
}

function makeMove(event) {
    switch (gameMode) {
        case MODE.BOT_EASY:
        case MODE.BOT_HARD: {
            if (isBotTurn) {
                makeBotMove();
            } else {
                makePlayerMove(event);
                changeTurn();
                makeBotMove();
            }
        } break;
        default: {
            makePlayerMove(event);
        }
    }
    changeTurn();
}

function makePlayerMove(event) {
    const svg = event.currentTarget;
    const use = svg.firstElementChild;
    drawSvg(use);
    animateSvg(use, isXturn ? 2000 : 1500);
}

function makeBotMove() {
    const unlockedUses = uses.filter(use => !isSvgLocked(use));
    const randomUnlockedUseIndex = Math.floor(Math.random() * unlockedUses.length);
    const randomUnlockedUse = unlockedUses[randomUnlockedUseIndex];
    const isAnyRandomUnlockedUseLeft = !!randomUnlockedUse;
    if (!isAnyRandomUnlockedUseLeft) { return; }
    drawSvg(randomUnlockedUse);
    animateSvg(randomUnlockedUse, isXturn ? 2000 : 1500);
}

function checkWinner() {
    for (let i = 0; i < 9; i += 3) {
        const isRowSet = uses[i + 1].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 1].getAttribute('href') &&
            uses[i + 1].getAttribute('href') === uses[i + 2].getAttribute('href');
        if (isRowSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const top = cellBoundingClientRect.top + cellBoundingClientRect.height / 2;
            const left = cellBoundingClientRect.left;
            strikethrough(0, 0, '100%', 0, top, left, '5%');
            announce("Winner " + (!isXturn ? 'X' : 'O') + "!");
            return;
        }

    }
    for (let i = 0; i < 3; i++) {
        const isColumnSet = uses[i + 3].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 3].getAttribute('href') &&
            uses[i + 3].getAttribute('href') === uses[i + 6].getAttribute('href');
        if (isColumnSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const top = cellBoundingClientRect.top;
            const left = cellBoundingClientRect.left + cellBoundingClientRect.width / 2;
            strikethrough(0, 0, 0, '100%', top, left, undefined, '5%');
            announce("Winner " + (!isXturn ? 'X' : 'O') + "!");
            return;
        }
    }

    if (!uses[4].getAttribute('href')) { return; }

    if (uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[6].getAttribute('href')) {
        const top = uses[2].parentNode.getBoundingClientRect().top;
        const left = uses[6].parentNode.getBoundingClientRect().left;
        strikethrough('100%', 0, 0, '100%', top, left);
        announce("Winner " + (!isXturn ? 'X' : 'O') + "!");
        return;
    }
    if (uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[8].getAttribute('href')) {
        const cellBoundingClientRect = uses[0].parentNode.getBoundingClientRect();
        const top = cellBoundingClientRect.top;
        const left = cellBoundingClientRect.left;
        strikethrough(0, 0, '100%', '100%', top, left);
        announce("Winner " + (!isXturn ? 'X' : 'O') + "!");
        return;
    }

    if (fillCellsCounter > 8) announce("Draw!");
}

function announce(announcement) {
    finish();
    showModal(announcement);
    setTimeout(() => {
        reset();
        checkBotTurn();
        hideModal();
    }, 2000);
}

function showModal(text) {
    modalContent.innerText = text;
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
}
// =========================================================

// ========================= Drawing =========================
function setSvgLocked(use, locked) {
    use.locked = locked;
}

function isSvgLocked(use) {
    return use.locked;
}

function drawSvg(use, opacity = 1, locked = true) {
    setSvgLocked(use, locked);
    use.setAttribute('opacity', '' + opacity);
    const hrefValue = isXturn ? '#cross' : '#circle';
    use.setAttribute('href', hrefValue);
}

function animateSvg(element, duration, strokeDashLength = 1000) {
    element.style.strokeDasharray = strokeDashLength;
    element.animate([
        { strokeDashoffset: strokeDashLength },
        { strokeDashoffset: 0 }
    ], {
        duration: duration,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

function strikethrough(x1, y1, x2, y2, top, left, height, width) {
    const isDiagonale = x1 !== x2 && y1 !== y2;

    const gridBoundingClientRect = grid.getBoundingClientRect();
    const svg = svgStrikethrough;
    let line = svg.firstElementChild;
    if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        svg.appendChild(line);
    }
    line.setAttribute('x1', '' + x1);
    line.setAttribute('y1', '' + y1);
    line.setAttribute('x2', '' + x2);
    line.setAttribute('y2', '' + y2);
    line.setAttribute('stroke', isXturn ? 'red' : 'blue');
    line.setAttribute('stroke-width', isDiagonale ? '2%' : '5%');
    svg.style.top = top;
    svg.style.left = left;
    svg.style.height = height || gridBoundingClientRect.height;
    svg.style.width = width || gridBoundingClientRect.width;
    svg.style.display = 'block';
    const lineLength = line.getTotalLength();
    animateSvg(line, 1000, lineLength);
}
// =========================================================

function reset() {
    isXturn = true;
    fillCellsCounter = 0;
    gameMode = select.value;
    isBotTurn = Math.random() > 0.5;
    svgStrikethrough.style.display = 'none';
    for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        const use = cell.firstElementChild;
        finished = false;
        setSvgLocked(use, false);
        use.removeAttribute('href');
        use.removeAttribute('opacity');
    }
}

function finish() {
    finished = true;
    uses.forEach(use => setSvgLocked(use, true));
}