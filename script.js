





let fillCellsCounter, isXturn, TimeOutId, gameMode, isBotTurn, returnCompleteLine,
    finished, friendID, connection;

    const button = document.getElementById('connect');
    const input = document.getElementById('name');
const grid = document.getElementById('grid');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);
const svgStrikethrough = document.getElementById('strikethrough');
const select = document.getElementsByName('gameMode')[0];
const MODE = {
    PVP_ONLINE: 'Online PvP',
    BOT_EASY: 'Easy bot',
    BOT_HARD: 'Insane bot',
    PVP_OFFLINE: 'Local PvP',
};
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
button.addEventListener('click', onConnection);
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
checkOnlineMode()
// =========================================================

// ==================== Event Listeners ====================
function onSelect(event) {
    reset();
    checkBotTurn();
    checkOnlineMode()
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
    makeEasyBotMove();
    changeTurn();
}
function checkOnlineMode() {
    const isOnlineMode = gameMode === MODE.PVP_ONLINE
    if (isOnlineMode) {
        peer = new Peer()
        peer.on('open', function (id) {
            console.log('id: ' + id)
        });
        peer.on('connection', function (conn) {
            connection = conn
            connection.on('open', function () {
                connection.on('data', function (index) {
                    changeTurn()
                    drawSvg(uses[index])
                    animateSvg(uses[index])

                })
            })
        })
    }
}
function onConnection(event) {
    friendID =  input.value
    connection = peer.connect(friendID)
    connection.on('open', function () {
        connection.on('data', function (data) {

        })
    })
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
        case MODE.BOT_EASY: {
            if (isBotTurn) {
                makeEasyBotMove();
            } else {
                makePlayerMove(event);
                changeTurn();
                makeEasyBotMove();
            }
        } break;
        case MODE.BOT_HARD: {
            if (isBotTurn) {
                makeHardBotMove();
            } else {
                makePlayerMove(event);
                changeTurn();
                makeHardBotMove();
            }
        } break;
        case MODE.PVP_ONLINE: {
            makeOnlinePlayerMove(event)

        } break;
        default: {
            makePlayerMove(event);
        }
    }
    changeTurn();
}
function makeOnlinePlayerMove(event) {
    makePlayerMove(event)
    const cell = event.currentTarget;
    const index = cells.indexOf(cell)
    connection.send(index)

}
function makePlayerMove(event) {
    const svg = event.currentTarget;
    const use = svg.firstElementChild;
    drawSvg(use);
    animateSvg(use);
}

function makeEasyBotMove() {
    const unlockedUses = uses.filter(use => !isSvgLocked(use));
    const randomUnlockedUseIndex = Math.floor(Math.random() * unlockedUses.length);
    const randomUnlockedUse = unlockedUses[randomUnlockedUseIndex];
    const isAnyRandomUnlockedUseLeft = !!randomUnlockedUse;
    if (!isAnyRandomUnlockedUseLeft) { return; }
    drawSvg(randomUnlockedUse);
    animateSvg(randomUnlockedUse);
}
function completeLine(index1, index2, index3) {
    if (isSvgLocked(uses[index1]) && uses[index1].getAttribute('href') === uses[index2].getAttribute('href')
        && !isSvgLocked(uses[index3])) {
        drawSvg(uses[index3]); animateSvg(uses[index3]); return returnCompleteLine = true;
    }
    return returnCompleteLine = false;
}
function makeHardBotMove() {
    const unlockedUses = uses.filter(use => !isSvgLocked(use));
    returnCompleteLine = false
    for (let i = 0; i < 9; i += 3) {
        completeLine(i + 1, i, i + 2); if (returnCompleteLine) { return }
        completeLine(i + 1, i + 2, i); if (returnCompleteLine) { return }
        completeLine(i, i + 2, i + 1); if (returnCompleteLine) { return }
    }
    for (let i = 0; i < 3; i++) {
        completeLine(i, i + 3, i + 6); if (returnCompleteLine) { return }
        completeLine(i, i + 6, i + 3); if (returnCompleteLine) { return }
        completeLine(i + 3, i + 6, i); if (returnCompleteLine) { return }
    }
    completeLine(2, 4, 6); if (returnCompleteLine) { return }
    completeLine(4, 6, 2); if (returnCompleteLine) { return }
    completeLine(6, 2, 4); if (returnCompleteLine) { return }

    completeLine(0, 4, 8); if (returnCompleteLine) { return }
    completeLine(4, 8, 0); if (returnCompleteLine) { return }
    completeLine(8, 0, 4); if (returnCompleteLine) { return }


    if (!isSvgLocked(uses[4])) { drawSvg(uses[4]); animateSvg(uses[4]); return }
    if (isSvgLocked(uses[4]) && isSvgLocked(uses[0]) || isSvgLocked(uses[2]) || isSvgLocked(uses[6]) || isSvgLocked(uses[8])) {
        if (!isSvgLocked(uses[1])) { drawSvg(uses[1]); animateSvg(uses[1]); return }
        if (!isSvgLocked(uses[3])) { drawSvg(uses[3]); animateSvg(uses[3]); return }
        if (!isSvgLocked(uses[5])) { drawSvg(uses[5]); animateSvg(uses[5]); return }
        if (!isSvgLocked(uses[7])) { drawSvg(uses[7]); animateSvg(uses[7]); return }
    }
    if (!isSvgLocked(uses[0])) { drawSvg(uses[0]); animateSvg(uses[0]); return }
    if (!isSvgLocked(uses[2])) { drawSvg(uses[2]); animateSvg(uses[2]); return }
    if (!isSvgLocked(uses[6])) { drawSvg(uses[6]); animateSvg(uses[6]); return }
    if (!isSvgLocked(uses[8])) { drawSvg(uses[8]); animateSvg(uses[8]); return }

    const randomUnlockedUseIndex = Math.floor(Math.random() * unlockedUses.length);
    const randomUnlockedUse = unlockedUses[randomUnlockedUseIndex];
    const isAnyRandomUnlockedUseLeft = !!randomUnlockedUse;
    if (!isAnyRandomUnlockedUseLeft) { return; }
    drawSvg(randomUnlockedUse);
    animateSvg(randomUnlockedUse);
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
        checkOnlineMode()
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
    duration = duration ? 1000 : (isXturn ? 2000 : 1500)
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
    isBotTurn = false
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