
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
            anounceWinner()
            clearAllCells()
            return
        }

    }
    for (let i = 0; i < 3; i++) {
        const isRowSet = uses[i + 3].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 3].getAttribute('href') &&
            uses[i + 3].getAttribute('href') === uses[i + 6].getAttribute('href')
        if (isRowSet) {
            anounceWinner()
            clearAllCells()
            return
        }
    }
    if (uses[4].getAttribute('href') &&
        (uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
            uses[4].getAttribute('href') === uses[6].getAttribute('href') ||
            uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
            uses[4].getAttribute('href') === uses[8].getAttribute('href'))) {
                anounceWinner()
                clearAllCells()
                return
    }
     if (fillCellsCounter > 8) {
         clearAllCells()
         alert("Draw")
         return
     }
}

function clearAllCells() {
    isXturn = true
    fillCellsCounter = 0
    for (const use of uses){
        use.removeAttribute('href')
    }
}

function anounceWinner() { 
    alert("Winner " + (!isXturn ? 'X' : 'O') + "!")
}

const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick)

} 
