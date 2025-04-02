const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');


const canvasWidth = canvas.width;
const canvasHeight = canvas.height;


let gameRun = true;
let gameOver =false;
let restartGame = false;

let enemiesEnabled = true;
let spawnEnemiesAgain = false;

// player variables
let player = {
    x: canvasWidth/2 - 10,  
    y: canvasHeight/2 - 10,
    width: 10,
    height: 10,
    vy: 0,
    vxl: 0,
    vxr: 0,
};


// defines the area on the screen the player can move in
let moveArea = {
    x: player.x +player.width/2,
    y: player.y + player.height/2,
    radius: 50,
}


// treasure variables
let treasuresFound = 0;
let treasureSize = (Math.random() * 40) + 15;
let treasure = {
    x: Math.floor(Math.random() * canvasWidth),
    y: Math.floor(Math.random() * canvasHeight),
    width: treasureSize,
    height: treasureSize,
    found: false,
};


// treasure found circle variables
let circle = {
    x: treasure.x + treasure.width /2,
    y: treasure.y + treasure.height /2,
    radius: 80,
}



// handles treasure states
function drawTreasure(){
    if (!treasure.found){
        ctx.shadowBlur = null;
        ctx.shadowColor = null;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(treasure.x, treasure.y, treasure.width, treasure.height);

        // invisible circle for found range calculation
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(255, 0, 255, 0)';
        ctx.stroke();

        let sizeMultiplier = 3;
        treasure.width = Math.max(15 * sizeMultiplier, 20);
        treasure.height = treasure.width;

        circle.x = treasure.x + treasure.width / 2;
        circle.y = treasure.y + treasure.height / 2;

    if (treasure.width <= 20) {
        circle.radius = 80;
    } else {
        circle.radius = 80 * (treasure.width / 20);
    }
    }
    if (treasure.found) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'black';
    
        // Create a radial gradient centered on the treasure
        var centerX = treasure.x + treasure.width / 2;
        var centerY = treasure.y + treasure.height / 2;
        var radius = Math.max(treasure.width, treasure.height); 
    
        var grd = ctx.createRadialGradient(centerX, centerY, radius * 0.01, centerX, centerY, radius);
        grd.addColorStop(0, "yellow"); // Inner color
        grd.addColorStop(1, "white"); // Outer coloreas
    
        // Apply the gradient as the fill style
        ctx.fillStyle = grd;
        ctx.fillRect(treasure.x, treasure.y, treasure.width, treasure.height);
    }
}

let treasureSpawnX = -canvasWidth;
let treasureSpawnY = -canvasHeight;
let treasureSpawnWidth = 3*canvasWidth;
let treasureSpawnHeight = 3*canvasHeight;

function treasureSpawnArea(){
    treasureSpawnX -= player.vxl;
    treasureSpawnX -= player.vxr;
    treasureSpawnY -= player.vy;
}

// function to respawn treasure at a random place, size, and found radius
function respawnTreasure() {
    treasuresFound++;

    let minX = Math.ceil(treasureSpawnX); 
    let maxX = Math.floor(treasureSpawnX + treasureSpawnWidth); 
    let minY = Math.ceil(treasureSpawnY); 
    let maxY = Math.floor(treasureSpawnY + treasureSpawnHeight);

    treasure.x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    treasure.y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    let sizeMultiplier = (Math.random() * 3) + 1;
    treasure.width = Math.max(15 * sizeMultiplier, 20);
    treasure.height = treasure.width;

    circle.x = treasure.x + treasure.width / 2;
    circle.y = treasure.y + treasure.height / 2;

    if (treasure.width <= 20) {
        circle.radius = 80;
    } else {
        circle.radius = 80 * (treasure.width / 20);
    }
}

// checks collisions,
// to be reworked
function checkCollision() {
    if (player.x < treasure.x + treasure.width &&
        player.x + player.width > treasure.x &&
        player.y < treasure.y + treasure.height &&
        player.y + player.height > treasure.y)
        {
            ctx.clearRect(treasure.x, treasure.y, treasure.width, treasure.height);
            respawnTreasure();
            treasure.found = false;
        }
}


// sets numOfTreasures div equal to number of treasure found
function addToTreasureTotal(){
    document.getElementById("numOfTreasures").innerHTML = treasuresFound;
}


// interpolates between 2 colors given a factor
function interpolateColor(color1, color2, factor) {
    let result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
}


// turns array into rgb value
function rgbToCss([r, g, b]) {
    return `rgb(${r},${g},${b})`;
}

// initial close and far colors
let farColor= [0, 0, 255];
let closeColor = [255, 0, 0];



// function to calculate the distance from the treasure to the player, handle if player has foud the treasure, and interpolate color of canvas blur depending on distance
function getDistanceFromTreasureAndInterpolateColor(){
    let xDistance = Math.abs(player.x - treasure.x);
    let yDistance = Math.abs(player.y - treasure.y);
    let distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));  
    if (distance <= circle.radius) {
        treasure.found = true;
    } else {
        treasure.found = false;
    }

    let hotToColdDistance = (Math.round(Math.sqrt(Math.pow(canvasWidth, 2) + Math.pow(4 *canvasHeight, 2))) / 2);
    let distanceFrom0To1 = distance / hotToColdDistance;
    let shadowColor = interpolateColor(closeColor, farColor, distanceFrom0To1);
    let cssColor = rgbToCss(shadowColor);

    let element = document.getElementById("mycanvas");
    let newShadowStyle = `0 0 150px ${cssColor}`;
    let newBorderStyle = `5px solid ${cssColor}`;

    element.style.boxShadow = newShadowStyle;
    element.style.border = newBorderStyle;
}


// moves the treasure at same rate as player
function moveTreasure(){
    treasure.x -= player.vxl;
    treasure.x -= player.vxr;
    treasure.y -= player.vy;
}


// contains the player within a circle located in thge middle of the canvas
function containMovement() {
    const xCenterDistance = canvasWidth / 2;
    const yCenterDistance = canvasHeight / 2;
    const radius = moveArea.radius;

    let playerCenterX = player.x + player.width / 2;
    let playerCenterY = player.y + player.height / 2;
    let distanceFromCenter = Math.sqrt((playerCenterX - xCenterDistance) ** 2 + (playerCenterY - yCenterDistance) ** 2);

    if (distanceFromCenter > radius) {
        const angle = Math.atan2(playerCenterY - yCenterDistance, playerCenterX - xCenterDistance);
        // calculate the intersection point on the circle
        const intersectX = xCenterDistance + radius * Math.cos(angle);
        const intersectY = yCenterDistance + radius * Math.sin(angle);

        player.x = intersectX - player.width / 2;
        player.y = intersectY - player.height / 2;
    }
}

function enableEnemies(){
    if (enemiesEnabled){
        enemiesEnabled = false;
    } else {
        enemiesEnabled = true;
    }
}


class Enemy {
    constructor(x, y, width, height, color, blur, blurColor, speed){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.blur = blur;
        this.blurColor = blurColor;
        this.speed = speed;
    }
    move(){
        // Calculate distance between enemy and player
        let dx = (player.x +player.width / 2) - this.x;
        let dy = (player.y + player.height / 2) - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate unit vector towards player
        let vx = dx / distance;
        let vy = dy / distance;

        if (player.vxl < 0) {
            this.x -= (player.vxl - this.speed);
        }
        if (player.vxr > 0) {
            this.x -= (player.vxr + this.speed);
        }
        if (player.vy < 0) {
            this.y -= (player.vy - this.speed);
        }
        if (player.vy > 0) {
            this.y -= (player.vy + this.speed);
        }
    
        this.x += vx * this.speed;
        this.y += vy * this.speed;
    }
    rotateTowardsPlayer(){
        var angleRadians = Math.atan2((player.y + player.height / 2)  - this.y, (player.x +player.width / 2) - this.x);
        ctx.translate(this.x, this.y);  
        ctx.rotate(angleRadians);    
        ctx.translate(-this.x, -this.y);  
    }
    checkCollision() {
        // Calculate the center of the player
        let playerCenterX = player.x + player.width / 2;
        let playerCenterY = player.y + player.height / 2;
    
    
        // Check if the tip of the enemy collides with the center of the player
        if (Math.abs(playerCenterX - this.x) < player.width / 2 &&
            Math.abs(playerCenterY - this.y) < player.height / 2) {
            gameOver = true;
            gameRun = false;
        }
    }
    spawn(){
        ctx.save();
        ctx.beginPath();
        this.rotateTowardsPlayer();

        ctx.moveTo(this.x - this.height, this.y - this.height);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x - this.height, this.y + this.height);
        ctx.lineTo(this.x - this.width, this.y);

        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.blur;
        ctx.shadowColor = this.blurColor;
        ctx.fill();
        ctx.stroke();
        this.move();
        this.checkCollision();
        ctx.restore();  
    }
}

let allEnemies = [];

function generateEnemies() {
    let minX = -canvasWidth;
    let maxX = 2 * canvasWidth;

    let minY = -canvasHeight;
    let maxY = 2 * canvasHeight;

    let x, y, xDistance, yDistance, distance;

    do {
        x = Math.random() * (maxX - minX) + minX;
        y = Math.random() * (maxY - minY) + minY;

        xDistance = Math.abs(player.x - x);
        yDistance = Math.abs(player.y - y);
        distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    } while (distance < 750);

    let width = parseFloat((Math.random() * 20 + 7).toFixed(4));
    let height = parseFloat((Math.random() * 20 + 7).toFixed(4));


    let speed = Math.random() * 2 / 2;
    if (speed < 0.2){
        speed = 0.25;
    }

    let blurColor = 'white';
    let color = 'white';
    let blur = Math.random() * 20 + 10;

    let enemy = new Enemy(x, y, width, height, color, blur, blurColor, speed);
    allEnemies.push(enemy);
}

generateEnemies();

function spawnEnemiesOverTime() {
    let delay;
    function scheduleSpawn() {
        setTimeout(() => {
            if (allEnemies.length < 50){
                generateEnemies(); // Spawn enemies
                delay = Math.max(5000); 
                if (gameRun && enemiesEnabled){
                    scheduleSpawn(); 
                }
                console.log(allEnemies.length)
            } 
            
        }, delay);
    }
    scheduleSpawn(); 
}

function increaseEnemySpeed() {
    setInterval(() => {
        for (let i = 0; i < allEnemies.length; i++) {
            allEnemies[i].speed += 0.1;
        }
    }, 3000); 
}

if (gameRun && enemiesEnabled){
    spawnEnemiesOverTime();
    increaseEnemySpeed();
}
let normalMove = true;
let waveMove = false;
let spiralMove = false;
let lissajousMove = false;
let orbitalDecayMove = false;

// class to create multiple objects easily
class Object {
    constructor(x, y, width, height, color, blur, blurColor, speed, opacity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.blur = blur;
        this.blurColor = blurColor;
        this.speed = speed;
        this.opacity = opacity;
    }
    // moves objects in direction depending on players direction
    move() {
        if (player.vxl < 0 || player.vxr > 0 || player.vy > 0 || player.vy < 0) {
            if (normalMove){
                if (player.vxl < 0) {
                this.x -= (player.vxl - this.speed);
                }
                if (player.vxr > 0) {
                    this.x -= (player.vxr + this.speed);
                }
                if (player.vy < 0) {
                    this.y -= (player.vy - this.speed);
                }
                if (player.vy > 0) {
                    this.y -= (player.vy + this.speed);
                }
            }
            if (waveMove){

                if (player.vxl < 0) {
                    
                    let inputXLeft = (0.05 * this.y - this.speed) / 100;
                    inputXLeft = Math.max(-1, Math.min(1, inputXLeft)); 
                    this.x += 5 * Math.acos(inputXLeft);
                }
                if (player.vxr > 0) {

                    let inputXRight = (0.05 * this.y - this.speed) / 100; 
                    inputXRight = Math.max(-1, Math.min(1, inputXRight)); 
                    this.x -= 5 * Math.acos(inputXRight);
                }
                if (player.vy < 0) {
                    
                    let inputYDown = (0.05 * this.x - this.speed) / 100; 
                    inputYDown = Math.max(-1, Math.min(1, inputYDown)); 
                    this.y += 10 * Math.acos(inputYDown);
                }
                if (player.vy > 0) {
                    
                    let inputYUp = (0.05 * this.x - this.speed) / 100; 
                    inputYUp = Math.max(-1, Math.min(1, inputYUp)); 
                    this.y -= 10 * Math.acos(inputYUp);
                }
            }
            if (spiralMove) {

                
                let angle = Math.atan2((player.y + player.height / 2) - this.y, (player.x + player.width / 2) - this.x);
                
                let time = Date.now();
                let spiralRadius = 5 * Math.sin(time / 1000) + 10;
            
                this.x += spiralRadius * Math.cos(angle);
                this.y += spiralRadius * Math.sin(angle);
            
                this.x += 10 * Math.sin(time / 500);
            
                this.y += 10 * Math.cos(time / 500);
            }
        }
    }
    // spawns objects with given values
    spawn(){
        const prevShadowBlur = ctx.shadowBlur;
        const prevShadowColor = ctx.shadowColor;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.blur;
        ctx.shadowColor = this.blurColor;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
        ctx.shadowBlur = prevShadowBlur;
        ctx.shadowColor = prevShadowColor;
        this.move();
    }
}

// initializing empty lists to be used for changing various things
let allColors = [];
let newObjs = [];
let objsSizes = [];
let objsSpeeds = [];
let objsInfo = [];
let blurColors = [];
let defaultBlur = true;
let blurSamePallete = false;
let blurWhite = false;
let blurBlack = false;

let sizeAdjustments = {
    overall: 1,
    width: 1,
    height: 1
};

function generateObjects() {
    let minX = -canvasWidth;
    let maxX = 2 * canvasWidth;
    let x = Math.random() * (maxX - minX) + minX;
   
    let minY = -canvasHeight;
    let maxY = 2 * canvasHeight;
    let y = Math.random() * (maxY - minY) + minY;

    let baseWidth = parseFloat((Math.random() * 30 + 10).toFixed(4));
    let baseHeight = parseFloat((Math.random() * 30 + 10).toFixed(4));

    let width = baseWidth * sizeAdjustments.overall * sizeAdjustments.width;
    let height = baseHeight * sizeAdjustments.overall * sizeAdjustments.height;

    let speed = Math.random()* 3;

    let color = chooseColor();
    let blur = (Math.random() * 15) +10;

    let blurColor;

    if (defaultBlur){
        blurColor = color;
    } else if (blurSamePallete){
        chooseColor();
    } else if (blurWhite){
        blurColor = 'white';
    } else if (blurBlack){
        blurColor = 'black';
    }

    let opacity = 1;
    
    let obj = new Object(x, y, width, height, color, blur, blurColor, speed, opacity);
    objsInfo.push([baseWidth, baseHeight, speed, blur]);
    newObjs.push(obj);
}

function chooseColor() {
    if (allColors.length === 0) {
        return rgbToCss([Math.random() * 255, Math.random() * 255, Math.random() * 255]);
    } else {
        let choice = Math.floor(Math.random() * allColors.length);
        return allColors[choice];
    }
}


function spawnAllObjects() {
    let initialAmount = newObjs.length > 0 ? newObjs.length : 4000;
    for (let i = 0; i < initialAmount; i++) {
        generateObjects();
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

spawnAllObjects();

let sizeSlider = document.getElementById("sizeRange");
sizeSlider.addEventListener('input', function() {
    sizeAdjustments.overall = this.value / 30;
    adjustObjectSizes();
});


function adjustObjectSizes() {
    newObjs.forEach((obj, index) => {
        obj.width = parseFloat((objsInfo[index][0] * sizeAdjustments.overall * sizeAdjustments.width).toFixed(4));
        obj.height = parseFloat((objsInfo[index][1] * sizeAdjustments.overall * sizeAdjustments.height).toFixed(4));
    });
}

function changeNumObjects(num) {
    let currentSize = num - newObjs.length;

    if (currentSize > 0) {
        for (let i = 0; i < currentSize; i++) {
            generateObjects();  
        }
    } else {
        let removeCount = Math.abs(currentSize);
        for (let i = 0; i < removeCount; i++) {
            if (newObjs.length > 0) {
                let random = Math.floor(Math.random() * newObjs.length);
                newObjs.splice(random, 1)[0];
                objsInfo.splice(random, 1)[0]
            }
        }
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

// changing overall size, width, and shape
let widthSlider = document.getElementById("widthRange");
let heightSlider = document.getElementById("heightRange");

widthSlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    changeObjectsWidth(sliderValue);
}


heightSlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    changeObjectsHeight(sliderValue);
}

function changeObjectsWidth(num) {
    sizeAdjustments.width = (num / 30);
    adjustObjectSizes();
}


function changeObjectsHeight(num) {
    sizeAdjustments.height = (num / 30);
    adjustObjectSizes();
}


// changing all objects speed
let speedSlider = document.getElementById("speedRange");


speedSlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    changeObjectsSpeed(sliderValue);
}



function changeObjectsSpeed(num) {
    let multiplier = num / 30;
    for (let i = 0; i < newObjs.length; i++) {
        let objSpeed = objsInfo[i][2];
        newObjs[i].speed = objSpeed * multiplier * 2;
    }
}

// changing number of objects
let objSlider = document.getElementById("objRange");


objSlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    changeNumObjects(sliderValue);
}

// changing all objects blur size
let blurSlider = document.getElementById("blurRange");


blurSlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    changeObjectsBlur(sliderValue);
}

function changeObjectsBlur(num) {
    for (let i = 0; i < newObjs.length; i++) {
        let multiplier = num / objsInfo[i][3];
        let objBlur = objsInfo[i][3];
        newObjs[i].blur = objBlur * multiplier * 2;
    }
}

// changing all objects opacity
let opacitySlider = document.getElementById("opacityRange");

opacitySlider.oninput = function() {
    let sliderValue = parseInt(this.value);
    let opacityChange = sliderValue / 100;
    changeObjectsOpacity(opacityChange);
}

function changeObjectsOpacity(opacity) {
    for (let i = 0; i < newObjs.length; i++) {
        newObjs[i].opacity = opacity;
    }
}

function randomizeOpacity(){
    for (let i = 0; i < newObjs.length; i++) {
        newObjs[i].opacity = Math.random();
    }
}

function setSmallParalax(){
    for (let i = 0; i < newObjs.length; i++){
        let speed;
        let area = newObjs[i].width * newObjs[i].height;
        let maxArea = (40 * sizeAdjustments.overall * sizeAdjustments.width) * (40 * sizeAdjustments.overall * sizeAdjustments.height);
        let areaPercent = area / maxArea;
        let testValue = 1-areaPercent;
        speed = 3 * testValue;
        newObjs[i].speed = speed;
        objsInfo[i][2] = speed;  
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

function setLargeParalax(){
    for (let i = 0; i < newObjs.length; i++){
        let speed;
        let area = newObjs[i].width * newObjs[i].height;
        let maxArea = (40 * sizeAdjustments.overall * sizeAdjustments.width) * (40 * sizeAdjustments.overall * sizeAdjustments.height);
        let areaPercent = area / maxArea;
        speed = 3 * areaPercent;  
        newObjs[i].speed = speed;
        objsInfo[i][2] = speed;
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

function setRandomParalax(){
    for (let i = 0; i < newObjs.length; i++){
        let speed = Math.random()* 3;
        newObjs[i].speed = speed;
        objsInfo[i][2] = speed;  
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

function setExperimentalParalax(){
    for (let i = 0; i < newObjs.length; i++){
        let speed;
        let area = newObjs[i].width * newObjs[i].height;
        let maxArea = 1600;
        let areaPercent = area / maxArea;
        let testValue = 1-areaPercent;
        speed = 3 * testValue;
        newObjs[i].speed = speed;
        objsInfo[i][2] = speed;  
    }
    objsInfo.sort((a, b) => a[2] - b[2]);
    newObjs.sort((a, b) => a.speed - b.speed);
}

function clearGame(){
    newObjs = [];
    allEnemies = [];
    objsInfo = [];
}


function loopAndSpawnObjects(){
    for (let i = 0; i < newObjs.length; i++) {
        let obj = newObjs[i];
        obj.spawn();
    }
}

function loopAndSpawnEnemies(){
    if (enemiesEnabled){
        for (let i = 0; i < allEnemies.length; i++) {
            let enemy = allEnemies[i];
            enemy.spawn();
        }
    }
}

function drawPlayer(){
    // player settings
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 20;
    ctx.shadowColor = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // player move area settings
    ctx.beginPath();
    ctx.arc(moveArea.x, moveArea.y, moveArea.radius, 0, Math.PI * 2, false);
    ctx.shadowBlur = null;
    ctx.shadowColor = null;
    ctx.strokeStyle = 'rgba(255, 255, 0, 0)';
    ctx.stroke();
}

let changeMove = false;
let changeNormal = true;
let changeWeird = false;


// MAIN LOOp
function update(){
    if (gameRun){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // player movementx
        player.x += player.vxl;
        player.x += player.vxr;
        player.y += player.vy;

        if (spawnEnemiesAgain){
            spawnEnemiesOverTime();
            spawnEnemiesAgain = false;
        }

        treasureSpawnArea();
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(treasureSpawnX, treasureSpawnY, treasureSpawnWidth, treasureSpawnHeight);


        loopAndSpawnObjects();
        loopAndSpawnEnemies();
        moveTreasure();
        drawTreasure();
        drawPlayer();
        checkCollision();
        getDistanceFromTreasureAndInterpolateColor();
        addToTreasureTotal();
        containMovement();
    }

    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold italic 50px Arial";
        ctx.fillStyle = "white";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 -20);


        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 55);

    }
    if (restartGame){
        treasureSpawnX = -canvasWidth;
        treasureSpawnY = -canvasHeight;
        delay = 3000;
        clearGame();
        treasuresFound = 0;
        spawnEnemiesOverTime();
        addToTreasureTotal();
        generateEnemies();
        spawnAllObjects();
        gameRun = true;
        gameOver = false;
        restartGame = false;
    }
    requestAnimationFrame(update);
}

update();


document.querySelectorAll(".collapsible").forEach(btn => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      content.style.display = content.style.display === "block" ? "none" : "block";
    });
  });
  
  function showSettings() {
    const settings = document.getElementById("settings");
    settings.style.display = settings.style.display === "block" ? "none" : "block";
  }



function setNormalMove(){
    normalMove = true;
    weirdMove = false;
    waveMove = false;
    lissajousMove = false;
    orbitalDecayMove = false;
}

function setWaveMove(){
    normalMove = false;
    spiralMove = false;
    waveMove = true;
    lissajousMove = false;
    orbitalDecayMove = false;
}

function setSpiralMove(){
    normalMove = false;
    waveMove = false;
    spiralMove = true;
    lissajousMove = false;
    orbitalDecayMove = false;
}



function changeColors(){
    for (let i = 0; i < newObjs.length; i++){
        let choice = Math.floor(Math.random() * allColors.length);
        color = allColors[choice];
        newObjs[i].color = color;
    }
}

function setBasic(){
    for (let i = 0; i < newObjs.length; i++){
        let color = rgbToCss([Math.random() * 255, Math.random() * 255, Math.random() * 255]);
        newObjs[i].color = color;
    }
}

function setBabiesBottom(){
    allColors = ['#B0F2B4', '#BAF2E9', '#BAD7F2', '#F2BAC9', '#F2E2BA'];
    changeColors();
}
function setNeon(){
    allColors = ['#4deeea', '#74ee15', '#ffe700', '#f000ff', '#001eff'];
    changeColors();
}

function setDark(){
    allColors = ['#330909', '#3d450c', '#0f3809', '#09382b', '#090f38', '#210938', '#3d0735'];
    changeColors();
}


function setMintWood(){
    allColors = ['#f3c969', '#edff86', '#fff5b2', '#d4fcc3', '#362c28'];
    changeColors();
}

function setSunset(){
    allColors = ['#640D6B', '#B51B75', '#E65C19', '#F8D082'];
    changeColors();
}

function setNature(){
    allColors = ['#1A4D2E', '#4F6F52', '#E8DFCA', '#F5EFE6'];
    changeColors();
}
function setBHS(){
    allColors = ['yellow', 'purple'];
    changeColors();
}

function setUSA(){
    allColors = ['#002868', '#ff0000', '#fff'];
    changeColors();
}

function setSouthTech(){
    allColors = ['#ff0000', '#222222', 'rgba(230, 230, 230)'];
    changeColors();
}

function setVoid(){
    allColors = [];
    changeColors();
}


function setStarryNight(){
    allColors = ['#29251d', '#2f3774', '#4c6394', '#7ea4b0', '#cdd27e', 'yellow', '#4b7bc4'];
    changeColors();
}

function setHero(){
    allColors = ['#4793AF', '#FFC470', '#DD5746', '#8B322C'];
    changeColors();
}

function setNightSky(){
    allColors = ['#131862', '#2e4482', '#546bab', '#87889c', '#bea9de'];
    changeColors();
}

function setGalaxy(){
    allColors = ['#00076f', '#44008b', '#9f45b0', '#e54ed0', '#ffe4f2'];
    changeColors();
}

function setAbels(){
    allColors = ['#4F7942', '#00796B', '#FFD464', '#6495ED'];
    changeColors();
}

function setSpace(){
    allColors = ['#fff'];
    changeColors();
}

function setVintage(){
    allColors = ['#a0304f', '#8d1638', '#7b0323', '#5b011b', '#3d0112'];
    changeColors();
}

function setKelpOcean(){
    allColors = ['#51CB20', '#76B041', '#639A88', '#3A5683', '#2708A0'];
    changeColors();
}

function setCoolio(){
    allColors = ['#1C110A', '#E4D6A7', '#E9B44C', '#9B2915', '#50A2A7'];
    changeColors();
}
function setBlack(){
    allColors = ['black'];
    changeColors();
}


function changeBlurColors(){
    for (let i = 0; i < newObjs.length; i++){
        if (defaultBlur){
            newObjs[i].blurColor = newObjs[i].color;
        } else if (blurSamePallete){
            let color;
            if (allColors.length == 0){
                color = chooseColor();
            } else{
                let choice = Math.floor(Math.random() * allColors.length);
                console.log(allColors.length)
                color = allColors[choice];
            }
            newObjs[i].blurColor = color;
        } else if (blurWhite){
            newObjs[i].blurColor = 'white';
        } else if (blurBlack){
            newObjs[i].blurColor = 'black';
        }
    }
}

function setBlurDefault(){
    defaultBlur = true;
    blurSamePallete = false;
    blurWhite = false;
    blurBlack = false;
    changeBlurColors();
}

function setBlurSamePallete(){
    defaultBlur = false;
    blurSamePallete = true;
    blurWhite = false;
    blurBlack = false;
    changeBlurColors();
}

function setBlurWhite(){
    defaultBlur = false;
    blurSamePallete = false;
    blurWhite = true;
    blurBlack = false;
    changeBlurColors();
}

function setBlurBlack(){
    defaultBlur = false;
    blurSamePallete = false;
    blurWhite = false;
    blurBlack = true;
    changeBlurColors();
}


function setBasicShadow(){
    farColor = [0, 0, 255];
    closeColor = [255, 0, 0];
}

function setCyanToPink(){
    farColor = [0, 0, 0];
    closeColor = [255, 255, 255];
}

function setNavyToYellow(){
    farColor = [0, 0, 128];
    closeColor = [255, 234, 0];
}

function setGreenToHotPink(){
    farColor = [67, 94, 85];
    closeColor = [245, 65, 97];
}
