// Ball Game on Canvas 

// Global variables and constants 
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let x = getRndInteger(30, canvas.width-60); //Ball x coordinate.
let y = canvas.height-30; // Ball y coordinate.
let dx = -2; // Ball increment for x.
let dy = -3; // Ball increment for y.
let bx = 10 // Board x coordinate.
let by = canvas.height-10 // Board y coordinate.
let bdx = 7; //Board increment coordinate.
const ballRadius = 10;
let ballColor = 'rgb(255, 199, 71)';
let counter = 2; // Level counter.
let start = false; // Flag for start screen.
let score = 0; // Game score.
let touchedBoard = true; // Touch flag.
let repeatTouch = 0; // Repeate touch flag 
let rightPressed = false; // Default value for right arrow keydown event.
let leftPressed = false; // Default value for left arrow keydown event.
let animationID = undefined; // Default value for animation function.
let bricks = []; // Stores all the bricks.
let brokenBricks = []; // Stores coordinates of the broken bricks.
let music = "l2" // Level music.
let scoreBoardMargin = 15;

// Configuration of the bricks for the levels: initial y, initial x, height increment, width increment, number of rows, number of bricks.
const l1 = [[10,55,30,95,1,6], [55,150,30,95,1,4], [100,245,30,95,1,2], [145,150,30,95,1,4], [190,55,30,95,1,6]]
const l2 = [[10,35,80,95,3,6], [50,85,80,95,2,6]]
const l3 = [[145,55,45,95,2,6], [10,55,45,95,5,6]]
const l4 = [[10,105,30,95,1,2],[10,385,30,95,1,2],[55,55,30,95,1,6],[95,55,30,95,1,6],[140,55,30,95,1,6],[185,105,30,95,1,5],[230,155,30,95,1,4],[275,205,30,95,1,3],[325,301,30,95,1,1]]

function isPlaying(audelem) { return !audelem.paused; } // Checking music status.

/**
 * Creates and stores bricks in the "bricks" array.
 * @param {Number} a Initial y.
 * @param {Number} b Initial x.
 * @param {Number} c y increment.
 * @param {Number} d x increment.
 * @param {Number} e Number of rows.
 * @param {Number} f Number of bricks.
 */
function fillBricks(a, b, c, d, e, f){
    let bh = a;
    let bw = b;
    for (let i=0; i < e; i++) {
        for (let i=0; i < f; i++) {
            bricks.push([bh+scoreBoardMargin, bw])
            bw += d;
        }
        bh += c;
        bw = b;
    }
}

/**
 * Creates bricks for a specific level.
 * @param {Number} r Number of unique row configurations.
 * @param {String} level Level configuration.
 */
function fillBricksRow(r, li){
    bricks = [];
    for(let i=0; i < r; i++){
        fillBricks(li[i][0],li[i][1],li[i][2],li[i][3],li[i][4],li[i][5]);
    }
}

fillBricksRow(l1.length,l1) // Initiate Level 1.

// Draws Start screen.
if (start === false){
    drawBall();
    changeLevel();
    drawShadowBox('white',.8);
    document.getElementById(music).pause();
    drawText( 'PRESS ENTER', canvas.width/2 - (12*8), canvas.height/2, '30px Monospace','Blue');
    animationID = undefined;
}

/**
 * Draws all elements of the game.
 */
function draw() {
    if (!isPlaying(document.getElementById(music))) {document.getElementById(music).play()}
    ctx.globalAlpha = 1;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    animationID = requestAnimationFrame(draw);
    drawScoreBoard();
    changeLevel();
    drawBall();
    drawBoard();
    x += dx;
    y += dy;
    if (rightPressed) { // Moves board.
        bx += bdx;
    } else if (leftPressed) {
        bx += -bdx;
    }

    touchDetection();
    bounce();
    boardBoundary();
    drawBrokenBricks();
    brickHit();
    drawText('S', canvas.width-90,10,'10px Monospace', 'black');
    drawText('c', canvas.width-82,10,'10px Monospace', 'black');
    drawText('o', canvas.width-74,10,'10px Monospace', 'blue');
    drawText('r', canvas.width-66,10,'10px Monospace', 'black');
    drawText('e: ' + score + ' ', canvas.width-58,10,'10px Monospace', 'black');
}

/**
 * Draws scoreboard.
 */
function drawScoreBoard(){
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, 15)
    ctx.fillStyle = 'lightgray';
    ctx.fill();
    ctx.closePath();
}

/**
 * Draws ball.
 */
function drawBall(){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

// Keyboard events: board movement, start, pause.
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
        document.getElementById(music).pause();
    } else if (event.key === 'Enter' && animationID === undefined) {
        document.getElementById(music).setAttribute('loop', '');
        document.getElementById(music).play();
        requestAnimationFrame(draw);
    } else if (event.key === 'Enter' && animationID === 'failed') {
        fillBricksRow(l1.length,l1);
        x = getRndInteger(30, canvas.width-30);
        y = canvas.height-200;
        dx = -2;
        dy = -3;
        touchedBoard = true;
        brokenBricks = [];
        repeatTouch = 0;
        requestAnimationFrame(draw);
        music = "l2";
        document.getElementById(music).play();
    }
})


// Keyboard events: cancels state of a key.
addEventListener("keyup", function (event){
    if(event.key === 'ArrowRight'){
        rightPressed = false;
    } else if(event.key === 'ArrowLeft')
        leftPressed = false;
})

/**
 * Draws board.
 */
function drawBoard(){
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(bx, by, 80, 3 );
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(bx, by+3, 80, 7);
    ctx.closePath();
    if (y > canvas.height){
        document.getElementById(music).pause();
        cancelAnimationFrame(animationID);
        drawShadowBox('lightgrey',1)
        drawText('TRY AGAIN', canvas.width/2 - (9*8), canvas.height/2, '30px Monospace', 'black')
        drawText('PRESS ENTER', canvas.width/2 - (11*8), canvas.height/2+40, '30px Monospace', 'blue')
        animationID = 'failed';
        counter = 2;
        score = 0;
    }
}

/**
 * Ball bouncing logic.
 */
function bounce(){
    if((y + dy) < ballRadius){
        dy = -dy;
        changeColor();
        document.getElementById ('hit').cloneNode(true).play();
    } else if((x + dx) < ballRadius || (x + dx) > canvas.width - ballRadius){
        dx = -dx;
        changeColor();
        document.getElementById ('hit').cloneNode(true).play();
    }
}

/**
 * Randomizer
 */
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

/**
 * Random color.
 */
function changeColor(){
    ballColor = 'rgb(' + getRndInteger(1,255) + ',' + getRndInteger(1,255) + ',' + getRndInteger(1,255) + ')'
}

/**
 * Detects screen boundaries for the board.
 */
function boardBoundary() {
    if (bx >= canvas.width - 80) {
        bx = canvas.width - 80;
    } else if (bx <= 0){
        bx = 0;
    }
}

/**
 * Detects board touch.
 */
function touchDetection() {
    for (let i = 0; i < 41; i++) {
        if (((y + ballRadius) >= by) && ((x + ballRadius) >= bx + i && x <= bx + i)) {
            dy = -3;
            dx = (2 * (1-(i / 40)))*-1;
            document.getElementById ('hit').play();
            touchedBoard = true;
            repeatTouch = 0;
        }
    }
    for (let i = 41; i >= 40 && i < 80; i++) {
        if (((y + ballRadius) >= by) && (x >= bx + i && (x-ballRadius) <= bx + i)) {
            dy = -3;
            dx = (2 * ((i-40) / 40));
            document.getElementById ('hit').play();
            touchedBoard = true;
            repeatTouch = 0;
        }
    }

}

/**
 * Draws one brick with fixhed length.
 * @param {Number} brx x coordinate of a brick.
 * @param {Number} bry y coordinate of a brick.
 */
function drawBrick(brx, bry){
    ctx.beginPath();
    ctx.rect(brx, bry, 80, 20);
    specialBricks(brx, bry);
    ctx.fill();
    ctx.closePath();
}

/**
 * Changes level.
 */
function changeLevel(){
    if (bricks.length === 0) { // New Level.
        document.getElementById(music).pause();
        let l = 'l'+counter;

        cancelAnimationFrame(animationID); // Stops animation.

        fillBricksRow(eval(l).length,eval(l));
        x = getRndInteger(30, canvas.width-30);
        y = canvas.height-200;
        for(let i=0; i < bricks.length; i++) {
            drawBrick(bricks[i][1], bricks[i][0]);
        }
        // Draws screen between levels.
        drawShadowBox('lightgrey', 0.85);
        drawText('Level ' + counter, canvas.width/2 - (11*8), canvas.height/2 - 20, '45px Monospace', 'black');
        drawText('S', canvas.width/2 - 44,canvas.height/2 + 30,'30px Monospace', 'black');
        drawText('c', canvas.width/2 - 24,canvas.height/2 + 30,'30px Monospace', 'black');
        drawText('o', canvas.width/2 - 0,canvas.height/2 + 30,'30px Monospace', 'blue');
        drawText('r', canvas.width/2 + 20,canvas.height/2 + 30,'30px Monospace', 'black');
        drawText('e', canvas.width - (8*16)-158,canvas.height/2 + 30,'30px Monospace', 'black');
        drawText(score + '', canvas.width/2 - String(score).length*7.2,canvas.height/2 + 60,'30px Monospace', 'black');

        dy = -3;
        counter += 1;

        if(counter === 6) {
            document.getElementById(music).pause();
            cancelAnimationFrame(animationID);
            brokenBricks = [];
            drawShadowBox('lightgrey',1)
            drawText('I. C. WINNER!', canvas.width/2 - (13.5*8), canvas.height/2, '30px Monospace', 'black')
            return
        }
        setTimeout(draw,3000);
        music = "l"+counter;
        brokenBricks = [];
    } else {
        for(let i=0; i < bricks.length; i++) {
            drawBrick(bricks[i][1], bricks[i][0]);
        }
    }
}

/**
 * Detects brick hit.
 */
function brickHit(){
    for(let i=0; i<=bricks.length-1; i++){
        if((y-ballRadius*2 <= bricks[i][0]+10 && y+ballRadius >= bricks[i][0]) && (x+10 >= bricks[i][1] && x-10 <= bricks[i][1]+80)) {
            brokenBricks.push([bricks[i][0],bricks[i][1],60])
            scoreLogic();
            bricks.splice(i, 1);
            dy = -dy;
            changeColor();

            if (repeatTouch === 0) {
                repeatTouch = 1;
            } else if (repeatTouch === 1 && touchedBoard === true) {
                touchedBoard = false;
                repeatTouch = 0;
            }

            document.getElementById ('hit').cloneNode(true).play();
            break;
        }
    }
}

/**
 * Draws Text
 * @param {Text} t Text.
 * @param {Number} x x coordinate.
 * @param {Number} y y coordinate.
 * @param {Text} f Font.
 * @param {Text} ss Fill style.
 * @param {Number} a Alpha channel value from 0 to 1.
 */
function drawText(t,x,y,f,ss,a){
    ctx.font = f;
    ctx.fillStyle = ss;
    if (a !== undefined) {
        a = 0.01666 * a
    } else a = 1;
    ctx.globalAlpha = a;
    ctx.fillText(t, x, y);
}

/**
 * Draws brick rows with unique attributes, if specified.
 * @param {Number} brx x coordinate of a row.
 * @param {Number} bry y coordinate of a row.
 */
function specialBricks(brx, bry){
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
        ctx.fillStyle = ballColor;
    }
    else ctx.fillStyle = ballColor;
}

/** 
 * Draws shadowbox.
 */ 
function drawShadowBox(c,a){
    ctx.beginPath()
    ctx.fillStyle = c;
    ctx.globalAlpha = a;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    ctx.closePath();
}

let bonusHits = 1;
function scoreLogic(){
    
    if (touchedBoard === false) {
        bonusHits +=1
        score += 100*bonusHits;
    } else {
        score += 100;
        bonusHits = 1;
    }
}

/**
 * Gets broken bricks coordinates and display time from the brokenBricks list.
 * Then draws score at the position of a brick for a second and deletes a brick from the brokenBricks.
 */
function drawBrokenBricks(){
    if (brokenBricks.length > 0){
        for (let i=0; i < brokenBricks.length; i++) {
            if (brokenBricks[i][2] > 0) {
                if (touchedBoard === true) {
                    drawText('100', brokenBricks[i][1] + 12 + getRndInteger(15, 20), brokenBricks[i][0], '20px Monospace', "blue", brokenBricks[i][2]);
                } else {
                    if (brokenBricks[i][3] === undefined) {
                        brokenBricks[i].push(bonusHits)
                    }
                    drawText(  100 * brokenBricks[i][3] +'', brokenBricks[i][1] + 12 + getRndInteger(15, 20), brokenBricks[i][0], '20px Monospace', ballColor, brokenBricks[i][2]);
                }
                brokenBricks[i][2] -= 1;
            } else {
                brokenBricks.splice(0, 1)
            }
        }
    }
}