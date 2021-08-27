
let fillCellsCounter, isXturn, TimeOutId;
const grid = document.getElementById('grid');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);
const svgStrikethrough = document.getElementById('strikethrough');

reset();

function drawElement(use, opacity = '1') {
    use.setAttribute('opacity', opacity);
    let hrefValue = use.getAttribute('href');
    const hasElementBeenAlreadyUsed = !!hrefValue;
    if (hasElementBeenAlreadyUsed) return;
    hrefValue = isXturn ? '#cross' : '#circle';
    use.setAttribute('href', hrefValue);
}

function onEnter(event) {
    clearTimeout(event.target.timeOutId);
    event.target.timeOutId = setTimeout(() => {
        const svg = event.target;
        const use = svg.firstElementChild;
        drawElement(use, '0.3');
    }, 200);
}

function onLeave(event) {
    clearTimeout(event.target.timeOutId);
    const svg = event.currentTarget;
    const use = svg.firstElementChild;
    use.removeAttribute('opacity');
    use.removeAttribute('href');
}

function onClick(event) {
    clearTimeout(event.target.timeOutId);

    const svg = event.currentTarget;
    const use = svg.firstElementChild;

    svg.removeEventListener('mouseenter', onEnter);
    svg.removeEventListener('mouseleave', onLeave);
    svg.removeEventListener('click', onClick);

    drawElement(use);

    use.animate([
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0 }
    ], {
        duration: isXturn ? 2000 : 1500,
        easing: 'ease-out',
        fill: 'forwards'
    });
    use.style.strokeDasharray = 1000;

    fillCellsCounter++;
    isXturn = !isXturn;
    checkWinner();
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
            announceWinner();
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
            announceWinner();
            return;
        }
    }

    if (!uses[4].getAttribute('href')) { return; }

    if (uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[6].getAttribute('href')) {
        const top = uses[2].parentNode.getBoundingClientRect().top;
        const left = uses[6].parentNode.getBoundingClientRect().left;
        strikethrough('100%', 0, 0, '100%', top, left);
        announceWinner();
        return;
    }
    if (uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[8].getAttribute('href')) {
        const cellBoundingClientRect = uses[0].parentNode.getBoundingClientRect();
        const top = cellBoundingClientRect.top;
        const left = cellBoundingClientRect.left;
        strikethrough(0, 0, '100%', '100%', top, left);
        announceWinner();
        return;
    }

    if (fillCellsCounter > 8) announceDraw();
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
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', isDiagonale ? '2%' : '5%');
    svg.style.top = top;
    svg.style.left = left;
    svg.style.height = height || gridBoundingClientRect.height;
    svg.style.width = width || gridBoundingClientRect.width;
    svg.style.display = 'block';
    line.animate([
        { strokeDashoffset: line.getTotalLength() },
        { strokeDashoffset: 0 }
    ], {
        duration: 1000,
        easing: 'linear',
        fill: 'forwards'
    });
    line.style.strokeDasharray = line.getTotalLength();
}
function announceWinner() {
    setTimeout(() => {
        console.log("Winner " + (!isXturn ? 'X' : 'O') + "!");
        reset();
    }, 2000);
}

function announceDraw() {
    setTimeout(() => {
        console.log("Draw");
        reset();
    }, 2000);
}

function reset() {
    isXturn = true;
    fillCellsCounter = 0;
    svgStrikethrough.style.display = 'none';
    for (let index = 0; index < cells.length; index++) {
        const cell = cells[index];
        cell.addEventListener('click', onClick);
        cell.addEventListener('mouseenter', onEnter);
        cell.addEventListener('mouseleave', onLeave);
        cell.firstElementChild.removeAttribute('href');
    }
}
