
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
        const isColumnSet = uses[i + 1].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 1].getAttribute('href') &&
            uses[i + 1].getAttribute('href') === uses[i + 2].getAttribute('href')
        if (isColumnSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const gridBoundingClientRect = uses[i].parentNode.parentNode.getBoundingClientRect();
            const svg = document.getElementById('secondary');
            const line = document.getElementById('strikethrough');
            // line.setAttribute('x1', '0');
            // line.setAttribute('y1', '0');
            line.setAttribute('x2', '100%');
            line.setAttribute('y2', '0');
            svg.style.top = cellBoundingClientRect.top + cellBoundingClientRect.height / 2;
            svg.style.left = cellBoundingClientRect.left;
            svg.style.height = '5%';
            svg.style.width = gridBoundingClientRect.width;
            svg.style.display = 'block';
            finish()
            return
        }

    }
    for (let i = 0; i < 3; i++) {
        const isRowSet = uses[i + 3].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 3].getAttribute('href') &&
            uses[i + 3].getAttribute('href') === uses[i + 6].getAttribute('href')
        if (isRowSet) {
            const cellBoundingClientRect = uses[i].parentNode.getBoundingClientRect();
            const gridBoundingClientRect = uses[i].parentNode.parentNode.getBoundingClientRect();
            const svg = document.getElementById('secondary');
            const line = document.getElementById('strikethrough');
            // line.setAttribute('x1', '0');
            // line.setAttribute('y1', '0');
            line.setAttribute('x2', '0');
            line.setAttribute('y2', '100%');
            // line.setAttribute('stroke', 'black');
            // line.setAttribute('stroke-width', '2%');
            svg.style.top = cellBoundingClientRect.top;
            svg.style.left = cellBoundingClientRect.left + cellBoundingClientRect.width / 2;
            svg.style.height = gridBoundingClientRect.height;
            svg.style.width = '5%';
            svg.style.display = 'block';
            finish()
            return
        }
    }

    if (!uses[4].getAttribute('href')) { return }

    if (uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[6].getAttribute('href')) {
        finish()
        return
    }
    if (uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[8].getAttribute('href')) {
        finish()
        return
    }

    if (fillCellsCounter > 8) finish();
}

function finish() {
    setTimeout(() => {
        anounceWinner();
        clearAllCells();
    }, 1000)
}

function clearAllCells() {
    isXturn = true
    fillCellsCounter = 0
    for (const use of uses){
        use.removeAttribute('href')
    }
    const svg = document.getElementById('secondary');
    svg.style.display = 'none';
    svg.removeChild(svg.firstChild);
}

function anounceWinner() {
    fillCellsCounter < 9 ? alert("Winner " + (!isXturn ? 'X' : 'O') + "!") : alert("Draw");
}

const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick)

} 
