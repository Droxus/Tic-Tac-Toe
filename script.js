
let fillCellsCounter = 0
let isXturn = true

function onClick(event) {
    const svg = event.currentTarget;
    const use = svg.firstElementChild;
    let hrefValue = use.getAttribute('href');
    const hasElementBeenAlreadyUsed = !!hrefValue;
    if (hasElementBeenAlreadyUsed) return
    hrefValue = isXturn ? '#cross' : '#circle';
    use.setAttribute('href', hrefValue);
    use.animate([
        {strokeDashoffset: 1000},
        {strokeDashoffset: 0}
    ], {
        duration: isXturn ? 2000 : 1500,
        easing: 'ease-out',
        fill: 'forwards'     
    })
    use.style.strokeDasharray = 1000

    fillCellsCounter++
    isXturn = !isXturn
    checkWinner()
}

function checkWinner() {
    for (let i = 0; i < 9; i += 3) {
        const isRowSet = uses[i + 1].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 1].getAttribute('href') &&
            uses[i + 1].getAttribute('href') === uses[i + 2].getAttribute('href')
        if (isRowSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const top = cellBoundingClientRect.top + cellBoundingClientRect.height / 2;
            const left = cellBoundingClientRect.left;
            strikethrough(0, 0, '100%', 0, top, left, '5%');
            announceWinner()
            return
        }

    }
    for (let i = 0; i < 3; i++) {
        const isColumnSet = uses[i + 3].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 3].getAttribute('href') &&
            uses[i + 3].getAttribute('href') === uses[i + 6].getAttribute('href')
        if (isColumnSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const top = cellBoundingClientRect.top;
            const left = cellBoundingClientRect.left + cellBoundingClientRect.width / 2;
            strikethrough(0, 0, 0, '100%', top, left, undefined, '5%');
            announceWinner()
            return
        }
    }

    if (!uses[4].getAttribute('href')) { return }

    if (uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[6].getAttribute('href')) {
        const top = uses[2].parentNode.getBoundingClientRect().top;
        const left = uses[6].parentNode.getBoundingClientRect().left;
        strikethrough('100%', 0, 0, '100%', top, left);
        announceWinner()
        return
    }
    if (uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[8].getAttribute('href')) {
        const cellBoundingClientRect = uses[0].parentNode.getBoundingClientRect();
        const top = cellBoundingClientRect.top;
        const left = cellBoundingClientRect.left;
        strikethrough(0, 0, '100%', '100%', top, left);
        announceWinner()
        return
    }

    if (fillCellsCounter > 8) announceDraw();
}

function strikethrough(x1, y1, x2, y2, top, left, height, width) {
    const gridBoundingClientRect = grid.getBoundingClientRect();
    const svg = svgStrikethrough;
    let line = svg.firstElementChild;
    if (!line) {
        line = document.createElementNS('http://www.w3.org/2000/svg','line');
        svg.appendChild(line);
    }
    line.setAttribute('x1', '' + x1);
    line.setAttribute('y1', '' + y1);
    line.setAttribute('x2', '' + x2);
    line.setAttribute('y2', '' + y2);
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '2%');
    svg.style.top = top;
    svg.style.left = left;
    svg.style.height = height || gridBoundingClientRect.height;
    svg.style.width = width || gridBoundingClientRect.width;
    svg.style.display = 'block';
    line.animate([
        {strokeDashoffset: 1000},
        {strokeDashoffset: 0}
    ], {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards'     
    })
    line.style.strokeDasharray = 1000
}

function announceWinner() {
    setTimeout(() => {
        alert("Winner " + (!isXturn ? 'X' : 'O') + "!")
        clearAllCells();
    }, 2000)
}

function announceDraw() {
    setTimeout(() => {
        alert("Draw");
        clearAllCells();
    }, 2000)
}

function clearAllCells() {
    isXturn = true
    fillCellsCounter = 0
    for (const use of uses){
        use.removeAttribute('href')
    }
    svgStrikethrough.style.display = 'none';
}

const grid = document.getElementsByClassName('grid')[0];
const svgStrikethrough = document.getElementById('strikethrough');
const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick)

} 
