
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
// const dyline = document.createElement('svg')
// document.body.appendChild(dyline)
// document.createElement('line')
console.log()

function checkWinner() {
    for (let i = 0; i < 9; i += 3) {
        const isColumnSet = uses[i + 1].getAttribute('href') &&
            uses[i].getAttribute('href') === uses[i + 1].getAttribute('href') &&
            uses[i + 1].getAttribute('href') === uses[i + 2].getAttribute('href')
        if (isColumnSet) {
            let coordOFsvg = 0
            switch (i) {
                case 0:  coordOFsvg=16; break;
                case 3:  coordOFsvg=50; break;
                case 6:  coordOFsvg=82; break;
            }
            const grid = uses[i].parentElement.parentElement
            console.log(grid)
            const top = grid.offsetTop
            const left = grid.offsetLeft
            const width = grid.offsetWidth
            const height = grid.offsetHeight
            document.body.innerHTML += `
            <svg style="top:${top}px; left:${left}px; position: absolute;" width="${width}" height="${height}">
                <line x1="0%" y1="${coordOFsvg}%" x2="100%" y2="${coordOFsvg}%" stroke-width="2%" stroke="black" />
            </svg>`
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
            let coordOFsvg = 0
            switch (i) {
                case 0:  coordOFsvg=16; break;
                case 1:  coordOFsvg=50; break;
                case 2:  coordOFsvg=82; break;
            }

            const grid = uses[i].parentElement.parentElement
            console.log(grid)
            const top = grid.offsetTop
            const left = grid.offsetLeft
            const width = grid.offsetWidth
            const height = grid.offsetHeight
            document.body.innerHTML += `
            <svg style="top:${top}px; left:${left}px; position: absolute;" width="${width}" height="${height}">
                <line x1="${coordOFsvg}%" y1="0%" x2="${coordOFsvg}%" y2="100%" stroke-width="2%" stroke="black" />
            </svg>`

            anounceWinner()
            clearAllCells()
            return
        }
    }
    if (uses[4].getAttribute('href') &&
        uses[2].getAttribute('href') === uses[4].getAttribute('href') &&
        uses[4].getAttribute('href') === uses[6].getAttribute('href')) {
            const grid = uses[4].parentElement.parentElement
            console.log(grid)
            const top = grid.offsetTop
            const left = grid.offsetLeft
            const width = grid.offsetWidth
            const height = grid.offsetHeight
            document.body.innerHTML += `
            <svg style="top:${top}px; left:${left}px; position: absolute;" width="${width}" height="${height}">
                <line x1="0%" y1="100%" x2="100%" y2="0%" stroke-width="2%" stroke="black" />
            </svg>`

                anounceWinner()
                clearAllCells()
                return               
            }
            if  ( uses[4].getAttribute('href') && 
            uses[0].getAttribute('href') === uses[4].getAttribute('href') &&
            uses[4].getAttribute('href') === uses[8].getAttribute('href')) {
                const grid = uses[4].parentElement.parentElement
                console.log(grid)
                const top = grid.offsetTop
                const left = grid.offsetLeft
                const width = grid.offsetWidth
                const height = grid.offsetHeight
                document.body.innerHTML += `
                <svg style="top:${top}px; left:${left}px; position: absolute;" width="${width}" height="${height}">
                    <line x1="0%" y1="0%" x2="100%" y2="100%" stroke-width="2%" stroke="black" />
                </svg>`
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
    
setTimeout( e=> alert("Winner " + (!isXturn ? 'X' : 'O') + "!"), 3000)
    
}

const cells = Array.from(document.getElementsByClassName('cell'));
const uses = cells.map((cell) => cell.firstElementChild);

for (let index = 0; index < cells.length; index++) {
    const cell = cells[index];
    cell.addEventListener('click', onClick)

} 
