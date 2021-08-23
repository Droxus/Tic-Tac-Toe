const elements = document.querySelectorAll('img')
const onclicklistner = (e) => {
    e.target.setAttribute('src', isXturn ? imgX : imgO)
    isXturn = !isXturn
    e.target.removeEventListener('click', onclicklistner)
}
let isXturn = true
const imgX = 'https://www.pngitem.com/pimgs/m/72-726040_cross-brush-png-wrong-red-cross-png-transparent.png'
const imgO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Red_circle.svg/1200px-Red_circle.svg.png'
for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    element.addEventListener('click', onclicklistner)

}