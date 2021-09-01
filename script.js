
let fillCellsCounter, isXturn, TimeOutId, gameMode;
const grid = document.getElementById('grid');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);
const svgStrikethrough = document.getElementById('strikethrough');
const select = document.getElementsByName('gameMode')[0];
const MODE = {
    BOT_EASY: 'bot.easy',
    BOT_HARD: 'bot.hard',
    PVP_OFFLINE: 'pvp.offline',
    PVP_ONLINE: 'pvp.online',
};

// ========================= Setup =========================
reset();

select.addEventListener('input', onSelect);
for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    const use = cell.firstElementChild;
    use.locked = false;
    cell.addEventListener('click', onClick);
    cell.addEventListener('mouseenter', onEnter);
    cell.addEventListener('mouseleave', onLeave);
}
// =========================================================

// ==================== Event Listeners ====================
function onSelect(event) {
    reset();
}

function onEnter(event) {
    const svg = event.target;
    clearTimeout(svg.timeOutId);
    const use = svg.firstElementChild;
    if (isSvgLocked(use)) { return; }
    svg.timeOutId = setTimeout(() => {
        drawSvg(use, '0.3');
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
// =========================================================

// ========================= Moves =========================
function changeTurn() {
    fillCellsCounter++;
    isXturn = !isXturn;
    checkWinner();
}

function makeMove(event) {
    switch (gameMode) {
        case MODE.BOT_EASY:
        case MODE.BOT_HARD: {
            makePlayerMove(event);
            changeTurn();
            makeBotMove(event);
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
    drawSvg(use, 1, true);
    animateSvg(use, isXturn ? 2000 : 1500);
}

function makeBotMove(event) {
    let locked = true;
    for (let index = 0; locked && index < cells.length; index++, locked = isSvgLocked(randomUse)) {
        const randomCellIndex = Math.floor(Math.random() * 9);
        var randomUse = uses[randomCellIndex];
    }
    if (!randomUse) { return; }
    drawSvg(randomUse, 1, true);
    animateSvg(randomUse, isXturn ? 2000 : 1500);
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
    setTimeout(() => {
        console.log(announcement);
        reset();
    }, 2000);
}
// =========================================================

// ========================= Drawing =========================
function isSvgLocked(element) {
    return element.locked;
}

function drawSvg(use, opacity, locked = false) {
    use.locked = locked;
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
    svgStrikethrough.style.display = 'none';
    for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        const use = cell.firstElementChild;
        use.locked = false;
        use.removeAttribute('href');
        use.removeAttribute('opacity');
    }
}
