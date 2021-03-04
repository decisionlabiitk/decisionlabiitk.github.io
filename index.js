let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")

ctx.beginPath()
ctx.fillStyle = "green"
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.stroke()

let col = canvas.height/6
let row = canvas.height/3

let bush = new Image()
bush.src = 'berry.png'
console.log(canvas.width, canvas.height)
console.log(col, row)
bush.addEventListener(
    "load",
    function()
    {
        ctx.drawImage(bush, col*2+col/2, row/2, col/2, row/2)
        ctx.drawImage(bush, col*3+col/2, row/2, col/2, row/2)
        ctx.drawImage(bush, col+col/2, row+row/2, col/2, row/2)
        ctx.drawImage(bush, col*4+col/2, row+row/2, col/2, row/2)
        ctx.drawImage(bush, col*2+col/2, row*2+row/2, col/2, row/2)
        ctx.drawImage(bush, col*3+col/2, row*2+row/2, col/2, row/2)
    }
)

let player = new Image()
player.src = 'man.png'
player.addEventListener(
    "load",
    function()
    {
        ctx.drawImage(player, col*3, row+row/2, col/2, row/2)
    }
)