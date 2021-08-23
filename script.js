const elements = document.querySelectorAll('img')
console.log(elements[0])
const onclicklistner = (e) => {
    e.target.setAttribute('src', isXturn ? imgX : imgO)
    e.target.setAttribute('alt', isXturn ? 'X' : 'O')
    isXturn = !isXturn
    e.target.removeEventListener('click', onclicklistner)
    checkWinner()

}
function checkWinner() {
    for (let i=0; i<9; i+=3) {
        const a = elements[i+1].alt !== '' &&
        elements[i].alt===elements[i+1].alt &&
        elements[i+1].alt===elements[i+2].alt
        console.log(a)
       if (a) {
            alert("Winner " + elements[i].alt + "!")
        }
    
    }
    for (let i=0; i<3; i++) {
        const b = elements[i+3].alt !== '' &&
        elements[i].alt===elements[i+3].alt &&
        elements[i+3].alt===elements[i+6].alt
        console.log(b)
       if (b) {
            alert("Winner " + elements[i].alt + "!")
        }
    }
    if ( elements[4].alt !== '' &&
        (elements[2].alt===elements[4].alt &&
        elements[4].alt===elements[6].alt || 
        elements[0].alt===elements[4].alt &&
        elements[4].alt===elements[8].alt))
        {
            alert("Winner " + elements[4].alt + "!")    
        }
}
let isXturn = true
const imgX = 'https://www.pngitem.com/pimgs/m/72-726040_cross-brush-png-wrong-red-cross-png-transparent.png'
const imgO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Red_circle.svg/1200px-Red_circle.svg.png'
for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    element.addEventListener('click', onclicklistner)

}