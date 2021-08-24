
let fillCellsCounter = 0
function clearAllCells() {
    isXturn = true
    fillCellsCounter = 0
    for (const element of elements){
        element.removeAttribute('alt')
        element.removeAttribute('src')
    }
}
function anounceWinner(element) { 

        if (element.complete) {

            alert("Winner " + element.alt + "!")
            return
        }
        function imageonload(e) {
            alert("Winner " + element.alt + "!")
            element.removeEventListener('load', imageonload)
        }
        element.addEventListener('load', imageonload)
       


}
const onclicklistner = (e) => {
    let cross  = e.target.getElementsByTagName('use'); console.log(e)
    if (cross[0].href !== '') return
    cross[0].setAttribute('href', isXturn ? '#Cross' : 'Circle')  //src
    e.target.setAttribute('alt', isXturn ? 'X' : 'O')
    isXturn = !isXturn
    fillCellsCounter++
    checkWinner(e)

}
function checkWinner(e) {
    for (let i = 0; i < 9; i += 3) {
        const a = elements[i + 1].alt !== '' &&
            elements[i].alt === elements[i + 1].alt &&
            elements[i + 1].alt === elements[i + 2].alt
        if (a) {
            anounceWinner(e.target)
            clearAllCells()

        }

    }
    for (let i = 0; i < 3; i++) {
        const b = elements[i + 3].alt !== '' &&
            elements[i].alt === elements[i + 3].alt &&
            elements[i + 3].alt === elements[i + 6].alt
        if (b) {
            anounceWinner(e.target)
            clearAllCells()
        }
    }
    if (elements[4].alt !== '' &&
        (elements[2].alt === elements[4].alt &&
            elements[4].alt === elements[6].alt ||
            elements[0].alt === elements[4].alt &&
            elements[4].alt === elements[8].alt)) {
                anounceWinner(e.target)
                clearAllCells()
    }
     if (fillCellsCounter > 8) {
         clearAllCells()
         alert("Draw")
     }
}

const elements = document.getElementsByClassName('cell') //img
// const cross = elements.getElementsByTagName('use')
// const circle = elements.getElementsByTagName('circle')

let isXturn = true
// const imgX = 'https://www.pngkit.com/png/full/205-2056204_tic-tac-toe-x-tic-tac-toe-x.png'
// const imgO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Red_circle.svg/1200px-Red_circle.svg.png'

for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    element.addEventListener('click', onclicklistner)

} 
