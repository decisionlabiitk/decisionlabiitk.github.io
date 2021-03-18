//  Canvas Attributes Set
let canvas = document.querySelector("canvas")
canvas.style.display = "none"
canvas.setAttribute("width", 1250)
canvas.setAttribute("height", 1000)
let ctx = canvas.getContext("2d")   // Get Draw Context
ctx.font = "30px Arial" // Set Font For UI
document.querySelector(".psy_form").style.display = "none"

// Prevent game start
let game_start = false

// Consent And Details Form
let client_name = ''
let gender = ''
let age = 0
document.querySelector(".personal_details > button").addEventListener("click",
    (e) =>
    {
        e.preventDefault()
        if(document.querySelector("#consent").checked)
        {
            client_name = document.querySelector("#client_name").value
            age = document.querySelector("#client_age").value
            document.querySelectorAll(".gen").forEach(
                (g) =>
                {
                    if(g.checked)
                        gender = g.value
                }
            )
            document.querySelector(".personal_details").remove()
            document.querySelector(".psy_form").style.display = "block"
        }
    }
)

// Psychology Form
let form_data = []
document.querySelector(".psy_form > button").addEventListener("click",
    (e) =>
    {
        e.preventDefault()
        document.querySelectorAll("label > input").forEach(
            (b) =>
            {
                if(b.checked)
                    form_data.push({name: b.name, value: b.value})
            }
        )
        document.querySelector("form").remove()
        canvas.style.display = "block"
    }
)

// Difficulty Slider
let difficulty = document.querySelector("#slider")
let sub = document.querySelector("body > div > button")
let p = document.querySelector("#diff")
p.style.display = "none"
sub.style.display = "none"
difficulty.style.display = "none"

//  Colour Entire Screen Green
ctx.beginPath()
ctx.fillStyle = "green"
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.stroke()

//  X, Y Partitions
let col = 1250/6    // Width of one partition
let row = 750/3   // Height of one partition
canvas.width
//  Create a Video element to play during foraging
let vid = document.createElement("video")
vid.src = "harvest.mp4"
vid.loop = true


//  Draw Bushes
let bush = new Image()
bush.src = 'berry.png'
// Set Bush Attributes
let bushes = 
[
    {id: 0, x: 775, y: 710, e: 0, r: 70, rate: 1.1, empty: true},
    {id: 1, x: 475, y: 710, e: 0, r: 70, rate: 1.1, empty: false},
    {id: 2, x: 325, y: 450, e: 0, r: 0, rate: 1.1, empty: true},
    {id: 3, x: 475, y: 190, e: 0, r: 70, rate: 1.1, empty: false},
    {id: 4, x: 775, y: 190, e: 0, r: 0, rate: 1.1, empty: false},
    {id: 5, x: 925, y: 450, e: 0, r: 0, rate: 1.1, empty: true}
]
// Draw Bush on load
bush.addEventListener(
    "load",
    function()
    {
        bushes.forEach(
            rect => 
            {
                ctx.drawImage(bush, rect.x, rect.y, 100, 100) // (image, pos-x, pos-y, width, height)
            }    
        )
    }
)
        

//  Check if Mouse click is inside bush
function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}


//  Consatants Defined
const speed = 300/(6*100)
let dest = -1   // Destination Bush
let p_pos = {x: 625, y: 450}  // Player Position
let pos = {}
let action = ""     // Action
let skip = {x: 0, y: 0}     // X, Y parts of speed
let c = 0   // Counter For Timeskip
let tc = 0  // Counter For Time
let score = 0
let data = []   // Data Collected in array form
let state = 'initiate'  // State of Game
let end = {m: 3, s: 0}  //  End time of Single Playthrough
let plays = 1   // Playthrough Count
let collected = false    // So csv Downloads Just once
let get_difficulty = true
let diff = [];

// Draw Player
let player = new Image()
player.src = 'man.png'
player.addEventListener(
    "load",
    function()
    {
        ctx.drawImage(player, p_pos.x, p_pos.y, 100, 100) // (image, pos-x, pos-y, width, height)
    }
)

// Create a Audio Element for Background Noise
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "forest.wav"
audio.loop = true
document.body.addEventListener("mousemove", // Add Mouse Movement as audio starter
    function () 
    {
        if(!(state === 'initiate'))
            audio.play()
    }
)

//  Set Event for Fixing a Destination Bush
canvas.addEventListener("click", (e) =>
    {
        pos = {x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top}  // Click Position
        bushes.forEach( // Check for each Bush
            (rect, i) =>
            {
                if(isInside(100, 100, rect.x, rect.y, pos.x, pos.y) && action !== 'moving' && dest !== i)
                {
                    action = "moving"
                    dest = i
                    const p = bushes[dest].x - p_pos.x
                    const b = bushes[dest].y - p_pos.y
                    const h = Math.sqrt(p*p + b*b)
                    skip.x = speed * p/h
                    skip.y = speed * b/h                                   
                }
                else if(!(dest === -1) && bushes[dest].x === p_pos.x && bushes[dest].y === p_pos.y && isInside(100, 100, bushes[dest].x, bushes[dest].y, pos.x, pos.y))
                {    
                    state = 'start'
                    action = 'forage'
                    vid.play()
                }
            }
        )
    }
)

//  Set Event for Foraging
document.addEventListener("keypress", (e) =>
    {
        switch(state)
        {
            case 'initiate':
                state = 'initiate2'
                return
        }
        
        if(e.code === 'Space' && state !== 'end' && canvas.style.display !== 'none')
        {
            state = 'start'
            if(isInside(100, 100, bushes[dest].x, bushes[dest].y, p_pos.x, p_pos.y))
            {    
                action = 'forage'
                vid.play()
            }
        }
    }
)

//  Check if Player Reached the target Bush
function reached(p, d, skip)
{
    if(skip.x >= 0 && skip.y >= 0)
        return p.x >= d.x && p.y >= d.y
    else if(skip.x >= 0 && skip.y <= 0)
        return p.x >= d.x && p.y <= d.y
    else if(skip.x <= 0 && skip.y >= 0)
        return p.x <= d.x && p.y >= d.y
    else if(skip.x <= 0 && skip.y <= 0)
        return p.x <= d.x && p.y <= d.y
}

//  Update Rewards and Exploits
function update(patch)
{
    if(bushes[patch].empty)
        return
    bushes.forEach(
        (b, i) =>
        {
            if(i === patch)
                b.r = b.r <= 0 ? 0 : Math.floor(Math.pow(0.95, b.e++) * b.r)   // e gets up by 1 for each calculation
            else if(b.empty)
                return
            else
                b.r = b.r <= 0 ? 3 : b.r>=100 || b.r*b.rate >= 100 ? 100 : Math.floor(b.r*b.rate)

            bushes[i].r = b.r
            bushes[i].e = b.e
        }
    )
}

//  Write Data to a file
function download_csv(data) {
    var csv = 'Bush_id,Exploit,Reward\n'
    data.forEach(
        row => 
        {
            csv += row.join(',')
            csv += "\n"
        }
    )
  
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data.csv';
    hiddenElement.click();
}

//  Submission Button
sub.addEventListener("click",
    (e) =>
    {
        get_difficulty = false
        diff.push(difficulty.value)
        sub.style.display = "none"
        difficulty.style.display = "none"
        p.style.display = "none"
    }
)

//  Update Loop
function draw()
{
    let loading = bush.complete && player.complete  // Pause If Resources Not Loaded
    if(!loading)
    {
        alert("loading")
        return
    }
    
    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = "green"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()

    switch(state)
    {
        case 'initiate':
            tc = 0;
            ctx.fillStyle = 'black'
            ctx.fillText("Welcome To The Virtual Foraging Task", col, row/4)
            ctx.fillText("All the shrubs are equi distant from you and from their neighbours.", col, row/2)
            ctx.fillText("Once harvested the shrubs get replenished with different rates.", col, 3*row/4)
            ctx.fillText("All shrubs will not give you berries.", col, row)
            ctx.fillText("You have a total of 3 mins to harvest as much berries as you can.", col, row+row/4)
            ctx.fillText("All shrubs will not give you berries.", col, row+row/2)
            ctx.fillText("Press space to continue", col, row+3*row/4)
            return

        case 'initiate2':
            tc = 0;
            ctx.fillStyle = 'black'
            ctx.fillText("Click on the shrub you want to pick beries from to move there.", col, row/4)
            ctx.fillText("Press Spacebar while on a shrub to collect berries.", col, row/2)
            ctx.fillText("You have a total of 3 mins to harvest as much berries as you can.", col, 3*row/4)
            ctx.fillText("For any adjacent shrub, Travel Time costs 6 sec.", col, row)
            ctx.fillText("For any shrub, Harvesting Time costs 5 sec.", col, row+row/4)
            ctx.fillText("Press space to continue", col, row+row/2)
            return

        case 'start':
            ctx.fillStyle = 'black'
            let seconds = Math.floor(tc/100)
            let minutes = Math.floor(seconds/60)
            seconds = seconds%60
            ctx.fillText(`Time: ${minutes}:${seconds}`, col/4, row/4)
            ctx.fillText("Score: " + score, col/4, row/2.5)
            if(minutes === end.m && seconds === end.s)
            {
                switch(plays)
                {
                    case 1:
                        get_difficulty = true
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        audio.pause()
                        //stress.pause()
                        bush.src = "bush.png"
                        bushes = 
                        [
                            {id: 0, x: 775, y: 812, e: 0, r: 80, rate: 1.1, empty: false},
                            {id: 1, x: 475, y: 812, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 2, x: 263, y: 600, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 3, x: 263, y: 300, e: 0, r: 80, rate: 1.1, empty: false},
                            {id: 4, x: 475, y: 88, e: 0, r: 80, rate: 1.1, empty: false},
                            {id: 5, x: 775, y: 88, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 6, x: 987, y: 300, e: 0, r: 0, rate: 1.1, empty: false},
                            {id: 7, x: 987, y: 600, e: 0, r: 80, rate: 1.1, empty: true},
                        ]
                        return

                    case 2:
                        get_difficulty = true
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        audio.pause()
                        //stress.pause()
                        bush.src = "bush.png"
                        bushes = 
                        [
                            {id: 0, x: 775, y: 710, e: 0, r: 70, rate: 1.1, empty: false},
                            {id: 1, x: 475, y: 710, e: 0, r: 70, rate: 1.3, empty: false},
                            {id: 2, x: 325, y: 450, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 3, x: 475, y: 190, e: 0, r: 70, rate: 1.1, empty: true},
                            {id: 4, x: 775, y: 190, e: 0, r: 0, rate: 1.1, empty: false},
                            {id: 5, x: 925, y: 450, e: 0, r: 0, rate: 1.1, empty: true}
                        ]
                        return

                    case 3:
                        get_difficulty = true
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        audio.pause()
                        //stress.pause()
                        bush.src = "bush.png"
                        bushes = 
                        [
                            {id: 0, x: 775, y: 812, e: 0, r: 80, rate: 1.1, empty: true},
                            {id: 1, x: 475, y: 812, e: 0, r: 0, rate: 1.3, empty: false},
                            {id: 2, x: 263, y: 600, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 3, x: 263, y: 300, e: 0, r: 80, rate: 1.3, empty: false},
                            {id: 4, x: 475, y: 88, e: 0, r: 80, rate: 1.1, empty: true},
                            {id: 5, x: 775, y: 88, e: 0, r: 0, rate: 1.1, empty: false},
                            {id: 6, x: 987, y: 300, e: 0, r: 0, rate: 1.1, empty: false},
                            {id: 7, x: 987, y: 600, e: 0, r: 80, rate: 1.1, empty: true},
                        ]
                        return

                    case 4:
                        get_difficulty = true
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        audio.pause()
                        //stress.pause()
                        bush.src = "bush.png"
                        bushes = 
                        [
                            {id: 0, x: 775, y: 710, e: 0, r: 70, rate: 1.2, empty: false},
                            {id: 1, x: 475, y: 710, e: 0, r: 70, rate: 1.1, empty: true},
                            {id: 2, x: 325, y: 450, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 3, x: 475, y: 190, e: 0, r: 70, rate: 1.3, empty: false},
                            {id: 4, x: 775, y: 190, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 5, x: 925, y: 450, e: 0, r: 0, rate: 1.1, empty: false}
                        ]
                        return

                    case 5:
                        get_difficulty = true
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        audio.pause()
                        //stress.pause()
                        bush.src = "bush.png"
                        bushes = 
                        [
                            {id: 0, x: 775, y: 812, e: 0, r: 80, rate: 1.1, empty: true},
                            {id: 1, x: 475, y: 812, e: 0, r: 0, rate: 1.1, empty: false},
                            {id: 2, x: 263, y: 600, e: 0, r: 0, rate: 1.2, empty: false},
                            {id: 3, x: 263, y: 300, e: 0, r: 80, rate: 1.3, empty: false},
                            {id: 4, x: 475, y: 88, e: 0, r: 80, rate: 1.1, empty: true},
                            {id: 5, x: 775, y: 88, e: 0, r: 0, rate: 1.4, empty: false},
                            {id: 6, x: 987, y: 300, e: 0, r: 0, rate: 1.1, empty: true},
                            {id: 7, x: 987, y: 600, e: 0, r: 80, rate: 1.1, empty: true},
                        ]
                        return

                    default:
                        ++plays
                        data.push([-1, -1, score])
                        get_difficulty = true
                        audio.pause()
                        //stress.pause()
                        tc = 0;
                        state = "end"
                        return
                }
            }
            break
            
        case 'change':
            dest = -1
            action = ''
            tc = 0
            p_pos = {x: 625, y: 450}
            score = 0
            // Update End Condition
            if(get_difficulty)
            {
                ctx.fillStyle = 'black'
                ctx.fillText("Please rate difficulty level of task (1 - 10).", col*1.7, row)
                sub.style.display = "block"
                difficulty.style.display = "block"
                sub.style.display = "block"
                p.style.display = "block"
                p.textContent = difficulty.value
            }
            else
            {
                ctx.fillStyle = 'black'
                ctx.fillText("We will now move to a new forest to forage.", col*2, row)
                ctx.fillText("Press space to continue foraging.", col*2, row+row/4)
            }
            return
        
        case 'end':
            if(get_difficulty)
            {
                ctx.fillStyle = 'black'
                ctx.fillText("Please rate difficulty level of the task (1 - 10).", col*1.7, row)
                sub.style.display = "block"
                difficulty.style.display = "block"
                sub.style.display = "block"
                p.style.display = "block"
                p.textContent = difficulty.value
            }
            else
            {
                if(!collected)
                {
                    collect_data()
                    collected = true
                }
                ctx.fillStyle = 'black'
                ctx.fillText("Thank you for playing.", col*2, row)
            }
            return
    }
    
    switch(action)
    {
        case 'moving':
            bushes.forEach(
                rect => 
                {
                    ctx.drawImage(bush, rect.x, rect.y, 100, 100) // (image, pos-x, pos-y, width, height)
                }    
            )
                
            if(reached(p_pos, bushes[dest], skip))
            {
                action = ''
                p_pos.x = bushes[dest].x
                p_pos.y = bushes[dest].y
                ctx.drawImage(player, p_pos.x, p_pos.y, 100, 100)
                break
            }

            p_pos.x += skip.x
            p_pos.y += skip.y
            ctx.drawImage(player, p_pos.x, p_pos.y, 100, 100) // (image, pos-x, pos-y, width, height)
            
            break

        case 'forage':
            if(c === 440)
            {
                update(dest)
                score += bushes[dest].r
                data.push([bushes[dest].id, bushes[dest].e, bushes[dest].r])
                vid.pause()
            }
            
            if(c > 440)
            {
                ctx.fillStyle = 'white'
                ctx.fillText("+" + bushes[dest].r, bushes[dest].x, bushes[dest].y)
            }
            else
            ctx.drawImage(vid, bushes[dest].x, bushes[dest].y, 100, 100)
            
            if(c === 500)
            {
                action = ''
                c = 0
            }
            c++
            break
                
        default:
            bushes.forEach(
                rect => 
                {
                    ctx.drawImage(bush, rect.x, rect.y, 100, 100) // (image, pos-x, pos-y, width, height)
                }    
            )

            ctx.drawImage(player, p_pos.x, p_pos.y, 100, 100) // (image, pos-x, pos-y, width, height)
    }
    
    tc++
}
setInterval(draw, 10)

let final_data = {}
function collect_data()
{
    final_data.personal_details = {name: client_name, gender: gender, age: age}
    final_data.difficulties = diff
    final_data.psy_details = form_data
    final_data.collection_data = data

    console.log(final_data)
}