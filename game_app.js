// Fix Speed up logic accounted for detection logic
// Board angle logic
// Score logic
// Initiation logic with movement up
// Move start/stop logic to a separate function.
// Process when dx = 0;
// try to make the logic of the bound on the board progressive

// Canvas

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
var x = getRndInteger(30, canvas.width-60); //ball coordinate
var y = canvas.height-30; // ball coordinate
let dx = -2; // ball increment coordinate
let dy = -3; // ball increment coordinate
let bx = 10 // board coordinate
let by = canvas.height-10 // board coordinate
let bdx = 7; //board increment coordinate
var ballRadius = 10;
var ballColor = 'rgb(255, 199, 71)';
var counter = 2; // level counter
let LDrawInterval // Blinking for loss message
var start = false; // Flag for start screen
var score = 0; // Counts score for bricks
var touchedBoard = true;

var rightPressed = false; // Default value for keydown event
var leftPressed = false; // Default value for keydown event
var animationID = undefined; // Default value for animation function.
// var animbrick = [] // Stores Destroyed Bricks
let brokenBricks = []; // Broken bricks array

var SBM = 15; // Score Board margin;
let l1 = [[10,55,30,95,1,6], [55,150,30,95,1,4], [100,245,30,95,1,2], [145,150,30,95,1,4], [190,55,30,95,1,6]]
let l2 = [[10,35,80,95,3,6], [50,85,80,95,2,6]] // init y, init x, h increment, w inc, n rows, n bricks
let l3 = [[145,55,45,95,2,6], [10,55,45,95,5,6]]
let l4 = [[10,105,30,95,1,2],[10,385,30,95,1,2],[55,55,30,95,1,6],[95,55,30,95,1,6], [140,55,30,95,1,6],[185,105,30,95,1,5],[230,155,30,95,1,4],[275,205,30,95,1,3],[325,301,30,95,1,1]]
let l5 = [[10,55,30,95,1,6], [55,55,30,95,1,5], [95,55,30,95,1,4], [140,55,30,95,1,3],[185,55,30,95,1,2]]


var bricks = [];

function isPlaying(audelem) { return !audelem.paused; }

function fillBricks(a, b, c, d, e, f){
    let bh = a;
    let bw = b;
    for (let i=0; i < e; i++) {
        for (let i=0; i < f; i++) {
            bricks.push([bh+SBM, bw])
            bw += d;
        }
        bh += c;
        bw = b;
    }
}

function fillBricksRow(r, li){
    bricks = [];
    for(let i=0; i < r; i++){
        fillBricks(li[i][0],li[i][1],li[i][2],li[i][3],li[i][4],li[i][5]);
    }
}

fillBricksRow(l3.length,l3) // Initiate Level 1

if (start === false){
    drawBall();
    drawBricks();
    drawShadowBox('white',.8);
    document.getElementById('bgmusic').pause();
    drawText( 'PRESS ENTER', canvas.width/2 - (12*8), canvas.height/2, '30px Monospace','Blue');
    animationID = undefined;
}
let p;
// Draws all
function draw() {
    if (!isPlaying(document.getElementById('bgmusic'))) {document.getElementById('bgmusic').play()}
    ctx.globalAlpha = 1;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    animationID = requestAnimationFrame(draw);
    drawScoreBoard();
    drawBricks();
    drawBall();
    drawBoard();
    x += dx;
    y += dy;
    if (rightPressed) { // Moves board
        bx += bdx;
    } else if (leftPressed) {
        bx += -bdx;
    }
    // for(i = 0; i < animbrick.length; i++) {
    //     drawBrickDust(animbrick[i][0], animbrick[i][1]);
    // }

    touchDetection();
    bounce();
    boardBoundary();
    drawBrokenBricks();
    brickHit();
    drawText('Score:' + score + ' ', canvas.width-100,10,'10px Monospace', 'black');
}

function drawScoreBoard(){
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, 15)
    ctx.fillStyle = 'lightgray';
    ctx.fill();
    ctx.closePath();
}

// Draws ball
function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

// Board movement: records state of a key when it's pressed
addEventListener('keydown', function (event){
    if(event.key === 'ArrowRight'){
        rightPressed = true;
    } else if(event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'Enter' && animationID > 0) {
        start = 'running';
        cancelAnimationFrame(animationID);
        animationID = undefined;
        drawShadowBox('lightgray', 0.75);
        drawText('PAUSE', canvas.width/2 - (5*8), canvas.height/2, '30px Monospace', 'black');
        document.getElementById('bgmusic').pause();
    } else if (event.key === 'Enter' && animationID === undefined) {
        document.getElementById('bgmusic').setAttribute('loop', '');
        document.getElementById('bgmusic').play();
        requestAnimationFrame(draw);
    } else if (event.key === 'Enter' && animationID === 'obosralsya') {
        fillBricksRow(l1.length,l1);
        x = getRndInteger(30, canvas.width-30); //ball coordinate
        y = canvas.height-200; // ball coordinate
        dx = -2; // ball increment coordinate
        dy = -3; // ball increment coordinate
        requestAnimationFrame(draw);
        document.getElementById('bgmusic').play();
    }

})


// Board movement: cancels state of a key when it's unpressed
addEventListener("keyup", function (event){
    if(event.key === 'ArrowRight'){
        rightPressed = false;
    } else if(event.key === 'ArrowLeft')
        leftPressed = false;
})

// Draws board
function drawBoard(){
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(bx, by, 80, 3 );
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(bx, by+3, 80, 7);
    ctx.closePath();
    if (y > canvas.height){
        document.getElementById('bgmusic').pause();
        cancelAnimationFrame(animationID);
        drawShadowBox('lightgrey',1)
        drawText('POTRACHENO', canvas.width/2 - (10*8), canvas.height/2, '30px Monospace', 'black')
        animationID = 'obosralsya';
        counter = 2;
        score = 0;
    }
}

// Ball bouncing logic
function bounce(){
    if(y + dy < ballRadius){
        dy = -dy;
        changeColor();
        document.getElementById ('hit').cloneNode(true).play();
    } else if(x + dx < ballRadius || x + dx > canvas.width - ballRadius){
        dx = -dx;
        changeColor();
        document.getElementById ('hit').cloneNode(true).play();
    }
}

// Randomizer
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

// Change color randomly
function changeColor(){
    ballColor = 'rgb(' + getRndInteger(1,255) + ',' + getRndInteger(1,255) + ',' + getRndInteger(1,255) + ')'
}

//Detects board boundaries
function boardBoundary() {
    if (bx >= canvas.width - 80) {
        bx = canvas.width - 80;
    } else if (bx <= 0){
        bx = 0;
    }
}

function touchDetection() {
    for (let i = 0; i < 41; i++) {
        if ((y + ballRadius >= by) && (x + ballRadius >= bx + i && x <= bx + i)) {
            dy = -3;
            dx = (2 * (1-(i / 40)))*-1;
            document.getElementById ('hit').play();
            touchedBoard = true;
            tbt = 0;
        }
    }
    for (let i = 41; i >= 40 && i < 80; i++) {
        if ((y + ballRadius >= by) && (x >= bx + i && x-ballRadius <= bx + i)) {
            dy = -3;
            dx = (2 * ((i-40) / 40));
            document.getElementById ('hit').play();
            touchedBoard = true;
            tbt = 0;
        }
    }

}

// Draw Bricks
function drawBrick(brx, bry){
    ctx.beginPath();
    ctx.rect(brx, bry, 80, 20);
    specialBall(brx, bry);
    ctx.fill();
    ctx.closePath();
}

//
function drawBricks(){
    if (bricks.length === 0) { //New Level
        let l = 'l'+counter;

        document.getElementById('bgmusic').pause();
        cancelAnimationFrame(animationID);

        setTimeout(draw,3000);
        fillBricksRow(eval(l).length,eval(l));
        x = getRndInteger(30, canvas.width-30); //ball coordinate
        y = canvas.height-200; // ball coordinate
        for(let i=0; i < bricks.length; i++) {
            drawBrick(bricks[i][1], bricks[i][0]);
        }
        drawShadowBox('lightgrey', 0.85);
        drawText('Level ' + counter, canvas.width/2 - (8*8), canvas.height/2, '30px Monospace', 'black');
        drawText('Your Score:' + score, canvas.width/2 - (8*16), canvas.height/2 + 30, '30px Monospace','black');
        let dy = -3; // ball increment coordinate
        counter += 1;
        // dx < 0 ? dx += -0.14 : dx += 0.14; // ball increment coordinate
        // dy < 0 ? dy += -0.21 : dy += -dy*2-0.21; // ball increment coordinate
    } else {
        for(let i=0; i < bricks.length; i++) {
            drawBrick(bricks[i][1], bricks[i][0]);
        }
    }
}

let tbt = 0;

// Brick hit detection
function brickHit(){
    for(let i=0; i<=bricks.length-1; i++){
        if((y-ballRadius*2 <= bricks[i][0]+10 && y+ballRadius >= bricks[i][0]) && (x >= bricks[i][1] && x <= bricks[i][1]+80)) {
            brokenBricks.push([bricks[i][0],bricks[i][1],60])
            scoreLogic();
            bricks.splice(i, 1);
            dy = -dy;
            changeColor();

            if (tbt === 0) {
                tbt = 1;
            } else if (tbt === 1 && touchedBoard === true) {
                touchedBoard = false;
                tbt = 0;
            }

            document.getElementById ('hit').cloneNode(true).play();
            break;
        }
    }
}

function drawText(t,x,y,f,ss){
    ctx.font = f;
    ctx.fillStyle = ss;
    ctx.globalAlpha = 1;
    ctx.fillText(t, x, y);
}
function specialBall(brx, bry){
    // Level 3
    if(counter === 4 && bry > 150){
        ctx.fillStyle = 'lightgray';
    // Level 4
    } else if (counter === 5) {
        ctx.fillStyle = 'red';
    }
    // Level 2
    else if (counter === 3) {
        ctx.fillStyle = 'orange';
    }
    // Level 1
    else if (counter === 2) {
        ctx.fillStyle = 'lightblue';
    }
    else ctx.fillStyle = ballColor;
}

function drawShadowBox(c,a){
    ctx.beginPath()
    ctx.fillStyle = c;
    ctx.globalAlpha = a;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.closePath();
}

function scoreLogic(){
    if (touchedBoard === false) {
        score += 200;
    } else score += 100;
}

/**
 * Get broken bricks coordinates and display time (60fps) from the brokenBricks list,
 * and draws at the position of a brick for a second.
 */
function drawBrokenBricks(){
    if (brokenBricks.length > 0){
        let l = brokenBricks;
        for (let i=0; i < l.length; i++) {
            if (l[i][2] > 0) {
                touchedBoard === true ? 1+1 : drawText('2x', l[i][1]+12+getRndInteger(15,20), l[i][0], '20px Monospace', 'black');
                brokenBricks[i][2] -= 1;
            } else {
                brokenBricks.splice(0, 1)
            }
        }
    }
}