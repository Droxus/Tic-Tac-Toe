
let fillCellsCounter, isXturn, TimeOutId, gameMode, isBotTurn,
    finished, friendID, connection, myID;

const buttonConnect = document.getElementById('connect');
const grid = document.getElementById('grid');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);
const svgStrikethrough = document.getElementById('strikethrough');
const select = document.getElementsByName('gameMode')[0];
const buttonPressToCopyID = document.getElementById('copyID');
const buttonPressToPlayAgain = document.getElementById('playAgain');
const buttonPressToPasteID = document.getElementById('pasteID');
const inputFrndID = document.getElementById('friendId');
const inputMyID = document.getElementById('myID');
const buttonSwitchTheme = document.getElementById('switchTheme');
const MODE = {
    BOT_HARD: 'Insane bot',
    BOT_EASY: 'Easy bot',
    PVP_ONLINE: 'Online PvP',
    PVP_OFFLINE: 'Local PvP',
};
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const onlineControlsPanel = document.getElementById('online-controls');

// ========================= Setup =========================
for (const mode in MODE) {
    const option = document.createElement('option');
    option.innerText = option.value = MODE[mode];
    select.appendChild(option);
}

window.onclick = onWindowClick;
window.onload = onWindowLoad;

select.addEventListener('input', onSelect);
buttonConnect.addEventListener('click', onConnection);
buttonSwitchTheme.addEventListener('click', switchTheme);
buttonPressToCopyID.addEventListener('click', copyID);
buttonPressToPlayAgain.addEventListener('click', playAgain);
buttonPressToPasteID.addEventListener('click', pasteID);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick);
    cell.addEventListener('mouseenter', onEnter);
    cell.addEventListener('mouseleave', onLeave);
}

reset();
checkBotTurn();
checkOnlineMode();
// =========================================================

// ==================== Event Listeners ====================
function onSelect(event) {
    reset();
    checkBotTurn();
    checkOnlineMode();
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

function onWindowLoad(event) {
    // TODO check user's prefered color theme and reflect it on the page
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
    const isOnlineMode = gameMode === MODE.PVP_ONLINE;
    if (isOnlineMode) {
        peer = new Peer(undefined, { debug: 3 });
        peer.on('open', function (id) {
            myID = id;
            inputMyID.innerText = myID;
        });
        peer.on('connection', function (conn) {
            connection = conn;
            onConnectionOpen()
        });
        showOnlineControls();
    } else {
        hideOnlineControls();
    }
}
function onConnectionOpen() {
    connection.on('open', function () {
        connection.on('data', function (obj) {
            isXturn = obj.isXturn

            uses.filter(use => !isSvgFilled(use)).forEach(use => setSvgLocked(use, false))

            occupyCell(uses[obj.index]);
            changeTurn();
        });
    });
}
function onConnection(event) {
    friendID = inputFrndID.value;
    connection = peer.connect(friendID);
    onConnectionOpen()

}
function switchTheme() {
    const root = document.documentElement;
    const isDarkModeEnabled = root.hasAttribute('data-theme');
    if (isDarkModeEnabled) {
        root.removeAttribute('data-theme');
        buttonSwitchTheme.innerText = 'Dark Theme';
    } else {
        root.setAttribute('data-theme', 'dark');
        buttonSwitchTheme.innerText = 'Light Theme';
    }
}
function playAgain() {
    reset();
}
function pasteID() {
    navigator.clipboard.readText().then(function (clipText) {
        inputFrndID.value = clipText;
    });
}

function copyID() {
    navigator.clipboard.writeText(myID);
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
            makeOnlinePlayerMove(event);

        } break;
        default: {
            makePlayerMove(event);
        }
    }
    changeTurn();
}
function makeOnlinePlayerMove(event) {
    makePlayerMove(event);
    const cell = event.currentTarget;
    const index = cells.indexOf(cell);
    connection.send({ isXturn: isXturn, index: index });
    uses.forEach(use => setSvgLocked(use, true))
}
function makePlayerMove(event) {
    const svg = event.currentTarget;
    const use = svg.firstElementChild;
    occupyCell(use);
}

function makeEasyBotMove() {
    const unlockedUses = uses.filter(use => !isSvgLocked(use));
    const randomUnlockedUseIndex = Math.floor(Math.random() * unlockedUses.length);
    const randomUnlockedUse = unlockedUses[randomUnlockedUseIndex];
    const isAnyRandomUnlockedUseLeft = !!randomUnlockedUse;
    if (!isAnyRandomUnlockedUseLeft) { return; }
    occupyCell(randomUnlockedUse);
}

function canCompleteLine(index1, index2, index3) {
    return !isSvgLocked(uses[index3]) && isSvgLocked(uses[index1]) && uses[index1].getAttribute('href') === uses[index2].getAttribute('href');
}

function makeHardBotMove() {
    const numberOfRows = 3;
    const numberOfColumns = numberOfRows;
    const numberOfCells = numberOfRows * numberOfColumns;
    const centerCellIndex = Math.floor(numberOfCells / 2);
    const k1 = 0, k2 = k1 + numberOfColumns - 1, k3 = centerCellIndex, k4 = numberOfCells - numberOfColumns, k5 = numberOfCells - 1;
    let indexOfCellToOccupy = -1;
    // check rows and columns
    for (let i = 0; i < numberOfRows && indexOfCellToOccupy < 0; i++) {
        const i1 = i * numberOfColumns, i2 = i1 + 1, i3 = i2 + 1;
        const j1 = i, j2 = j1 + numberOfRows, j3 = j2 + numberOfRows;
        // check a row no. i
        /**/ if (canCompleteLine(i2, i1, i3)) { indexOfCellToOccupy = i3; }
        else if (canCompleteLine(i2, i3, i1)) { indexOfCellToOccupy = i1; }
        else if (canCompleteLine(i1, i3, i2)) { indexOfCellToOccupy = i2; }
        // check a column no. i
        else if (canCompleteLine(j1, j2, j3)) { indexOfCellToOccupy = j3; }
        else if (canCompleteLine(j1, j3, j2)) { indexOfCellToOccupy = j2; }
        else if (canCompleteLine(j2, j3, j1)) { indexOfCellToOccupy = j1; }
    }

    if (indexOfCellToOccupy > -1) { indexOfCellToOccupy = indexOfCellToOccupy; }
    // check the diagonal from top left to bottom right
    else if (canCompleteLine(k1, k3, k5)) { indexOfCellToOccupy = k5; }
    else if (canCompleteLine(k3, k5, k1)) { indexOfCellToOccupy = k1; }
    else if (canCompleteLine(k5, k1, k3)) { indexOfCellToOccupy = k3; }
    // check the diagonal from top right to bottom left
    else if (canCompleteLine(k2, k3, k4)) { indexOfCellToOccupy = k4; }
    else if (canCompleteLine(k3, k4, k2)) { indexOfCellToOccupy = k2; }
    else if (canCompleteLine(k4, k2, k3)) { indexOfCellToOccupy = k3; }

    else if (!isSvgLocked(uses[4])) { indexOfCellToOccupy = centerCellIndex; }

    else if (isSvgLocked(uses[4]) && uses[4].getAttribute('href') === '#cross' && isSvgLocked(uses[0]) ||
        isSvgLocked(uses[2]) || isSvgLocked(uses[6]) || isSvgLocked(uses[8])) {
        if (!isSvgLocked(uses[0])) { indexOfCellToOccupy = 0; }
        else if (!isSvgLocked(uses[2])) { indexOfCellToOccupy = 2; }
        else if (!isSvgLocked(uses[6])) { indexOfCellToOccupy = 6; }
        else if (!isSvgLocked(uses[8])) { indexOfCellToOccupy = 8; }
    }
    else if (isSvgLocked(uses[4]) && uses[4].getAttribute('href') === '#circle' && isSvgLocked(uses[0]) ||
        isSvgLocked(uses[2]) || isSvgLocked(uses[6]) || isSvgLocked(uses[8])) {
        if (!isSvgLocked(uses[1])) { indexOfCellToOccupy = 1; }
        else if (!isSvgLocked(uses[3])) { indexOfCellToOccupy = 3 }
        else if (!isSvgLocked(uses[5])) { indexOfCellToOccupy = 5; }
        else if (!isSvgLocked(uses[7])) { indexOfCellToOccupy = 7; }
    }
    else if (!isSvgLocked(uses[0])) { indexOfCellToOccupy = 0; }
    else if (!isSvgLocked(uses[2])) { indexOfCellToOccupy = 2; }
    else if (!isSvgLocked(uses[6])) { indexOfCellToOccupy = 6; }
    else if (!isSvgLocked(uses[8])) { indexOfCellToOccupy = 8; }

    indexOfCellToOccupy > -1 ? occupyCell(uses[indexOfCellToOccupy]) : makeEasyBotMove();
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
        checkOnlineMode();
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

function showOnlineControls() {
    onlineControlsPanel.style.display = 'block';
}

function hideOnlineControls() {
    onlineControlsPanel.style.display = 'none';
}
// =========================================================

// ========================= Drawing =========================
function setSvgLocked(use, locked) {
    use.locked = locked;
}
function setSvgFilled(use, filled) {
    use.filled = filled
}
function isSvgFilled(use) {
    return use.filled
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
    duration = duration ? 1000 : (isXturn ? 2000 : 1500);
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

function occupyCell(use) {
    drawSvg(use);
    animateSvg(use);
    setSvgFilled(use, true)
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
    const rootStyle = window.getComputedStyle(document.documentElement);
    const winnerStrokeColor = rootStyle.getPropertyValue(isXturn ? '--circle-stroke-color' : '--cross-stroke-color');
    line.setAttribute('stroke', winnerStrokeColor);
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
function copy(someString) {

}

function reset() {
    isXturn = true;
    fillCellsCounter = 0;
    gameMode = select.value;
    isBotTurn = false;
    svgStrikethrough.style.display = 'none';
    for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        const use = cell.firstElementChild;
        finished = false;
        setSvgFilled(use, false)
        setSvgLocked(use, false);
        use.removeAttribute('href');
        use.removeAttribute('opacity');
    }
}

function finish() {
    finished = true;
    uses.forEach(use => setSvgLocked(use, true));
}