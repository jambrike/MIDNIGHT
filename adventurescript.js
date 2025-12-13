
const backgroundmusic = new Audio("02.mp3");
backgroundmusic.loop = true;
backgroundmusic.volume = 0.58;

const pickup = new Audio("pickup.mp3");
pickup.volume = 0.7;

let musicHasStarted = false;

// variables
const gameA = document.getElementById('gamearea');
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const gameOverText = document.getElementById('gameover');
const scoreblock = document.getElementById("score");
const powerupEl = document.getElementById('powerup'); // Added

const acceleration = 0.87; // 
const friction = 0.90;
const birdFlapFrames = ["wing_up26.png", "wing_down26.png"]; 

document.body.classList.add('hide-cursor');

let playerX = 200, playerY = 200;
let enemyX = 600, enemyY = 600;

let pVelx = 0, pVely = 0;
let eVelx = 0, eVely = 0;
let enemyAcceleration = 0.7;
let enemyFriction = 0.92; // 

// Dash variables
let dashPower = 15;
let dashCooldown = false;
let dashCost = 50; 
let stamina = 100;
let maxStamina = 100;
let staminarate = 0.4; 

// Game State
let paused = false;
let enemyspeedboost = 1;
let running = true;

// Powerup variables
let powerupact = false;
let invis = false;

// Wander variables
let wanderx = 0;
let wandery = 0;
let wandertime = 0;

let score = 0;
let keys = {};

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gamearea');
    const savedBackground = localStorage.getItem('gameBackground');
    if (savedBackground) {
        gameArea.classList.add(savedBackground);
    } else {
        gameArea.classList.add('bg-default');
    }
    
    // Initial setup for positions before gameLoop starts
    playerX = window.innerWidth / 2 - 17;
    playerY = window.innerHeight / 2 - 17;
    enemyX = 100; 
    enemyY = 100;
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";

    spawninvis();
    setInterval(updatescore, 1000);
    setInterval(hackclubbirdfly, 4000);//why was it set to fifteen seconds
    requestAnimationFrame(gameLoop);
});


document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    keys[e.code] = true; // Use code for Space
    
    // MUSIC FIX: This is the ONLY place we try to start music initially
    if (!musicHasStarted && !paused) {
        backgroundmusic.play().catch(error => {
            console.log("Browser blocked audio:", error);
        });
        musicHasStarted = true; 
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// Escape to pause
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && running) {
        togglePause();
    }
});

// Dash trigger & Restart trigger
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){
        if (running && !paused) {
            performDash();
        } else if (!running) {
            resetGame(); // Restart game if game over
        }
    }
});

function togglePause() {
    paused = !paused;

    if (paused) {
        document.body.classList.remove('hide-cursor');
        backgroundmusic.pause();
    } else {
        document.body.classList.add('hide-cursor');
        if (musicHasStarted) {
            backgroundmusic.play();
        }
    }
}

function resetGame() {
    // Reset positions
    playerX = window.innerWidth / 2 - 17;
    playerY = window.innerHeight / 2 - 17;
    enemyX = 100; 
    enemyY = 100;

    // Reset state/stats
    pVelx = 0; pVely = 0; eVelx = 0; eVely = 0;
    score = 0;
    scoreblock.textContent = "Score: 0";
    enemyspeedboost = 1;
    stamina = maxStamina;
    invis = false;
    player.style.opacity = "1";

    // Reset visuals/flow
    running = true;
    paused = false;
    gameOverText.style.display = 'none';
    document.body.classList.add('hide-cursor');
    
    spawninvis(); 
    
    if(musicHasStarted && backgroundmusic) {
        backgroundmusic.currentTime = 0;
        backgroundmusic.play();
    }
    
    requestAnimationFrame(gameLoop);
}


function startBirdFlapCycle(birdElement) {
    let frameIndex = 0;
    
    const flapInterval = setInterval(() => {
        // Cycle between 0 and 1
        frameIndex = 1 - frameIndex; 
        
        birdElement.style.backgroundImage = `url(${birdFlapFrames[frameIndex]})`;

        if (!document.body.contains(birdElement)) {
            clearInterval(flapInterval);
        }
        
    }, 100); // Flapping speed 
    
    return flapInterval; // Return the ID so we can stop it later
}

// where the f the function

function movePlayer() {
    if (keys['ArrowUp']) pVely -= acceleration;
    if (keys['ArrowDown']) pVely += acceleration;
    if (keys['ArrowLeft']) pVelx -= acceleration;
    if (keys['ArrowRight']) pVelx += acceleration;
    
    if (paused) return;

    pVelx *= friction;
    pVely *= friction;

    playerX += pVelx;
    playerY += pVely;

    const maxX = window.innerWidth - 35; 
    const maxY = window.innerHeight - 35; 

    if (playerX < 0) { playerX = 0; pVelx *= -0.5; }
    if (playerY < 0) { playerY = 0; pVely *= -0.5; }
    if (playerX > maxX) { playerX = maxX; pVelx *= -0.5; }
    if (playerY > maxY) { playerY = maxY; pVely *= -0.5; }
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}
//hackclub bird use for homepage too id say got iddea from when people sayed theyd do it with em what ya call it like for desktop
function hackclubbirdfly() {
    console.log("HACK CLUB BIRD FUNCTION EXECUTED");// test is if it shows up or wtv
    if(paused || !running) return;

    const bird = document.createElement("div");
    bird.classList.add("midnightbird"); 
    
    // Randomly decide direction (50/50 chance)
    const isFlyingRight = Math.random() < 0.5; 

    let startX, endX;

    if (isFlyingRight) {
        // Flying Left -> Right
        startX = -100;
        endX = window.innerWidth + 100;
        bird.style.transform = "scaleX(-1)"; 
    } else {
        // Flying Right -> Left
        startX = window.innerWidth + 100;
        endX = -100;
        
        bird.style.transform = "scaleX(1)"; 
    }

    const flyH = Math.random() * (window.innerHeight * 0.6); 
    
    bird.style.left = startX + "px";
    bird.style.top = flyH + "px";
    bird.style.backgroundImage = `url(${birdFlapFrames[0]})`;
    
    document.getElementById("gamearea").appendChild(bird);

    const flapTimerID = startBirdFlapCycle(bird);

    requestAnimationFrame(() => {
        bird.style.left = `${endX}px`; 
    });

    setTimeout(() => {
        clearInterval(flapTimerID); 
        if(bird.parentNode) bird.remove();
    }, 4000); 
}


function spawninvis(){
    const size = 22;
    let px = Math.random() * (window.innerWidth - size - 50) + 25; 
    let py = Math.random() * (window.innerHeight - size - 50) + 25;
    const powerup = document.getElementById('powerup');
    powerup.style.left = px + "px";
    powerup.style.top = py + "px";
    powerup.style.display = 'block';
    powerupact = true;
}

function enemyWander(){
    if (wandertime-- <= 0){
        const angle = Math.random() * Math.PI* 2;
        wanderx = Math.cos(angle) * 2;
        wandery = Math.sin(angle) * 2;
        wandertime = 100;
    }
    enemyX += wanderx;
    enemyY += wandery;

    enemyspeedboost *= 0.993;

    enemyX = Math.max(0, Math.min(enemyX, window.innerWidth -32));
    enemyY = Math.max(0, Math.min(enemyY, window.innerHeight -32));

    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
}

function performDash() {
    if (dashCooldown) return; 
    if (stamina < dashCost) return; 
    
    stamina -= dashCost;

    let dashDirX = 0;
    let dashDirY = 0;
    if (keys['ArrowUp']) dashDirY -= 1;
    if (keys['ArrowDown']) dashDirY += 1;
    if (keys['ArrowLeft']) dashDirX -= 1;
    if (keys['ArrowRight']) dashDirX += 1;

    const length = Math.hypot(dashDirX, dashDirY);
    if (length === 0) return; 

    enemyspeedboost*=0.99;

    dashDirX /= length;
    dashDirY /= length;

    pVelx += dashDirX * dashPower;
    pVely += dashDirY * dashPower;



    dashCooldown = true;
    setTimeout(() => {
        dashCooldown = false;
    }, 300); 
}

function moveEnemy() {
    if (invis){
        enemyWander();
        return;
    }

    const dx = playerX - enemyX;
    const dy = playerY - enemyY;
    const angle = Math.atan2(dy,dx);

    eVelx += Math.cos(angle) * enemyAcceleration * enemyspeedboost;
    eVely += Math.sin(angle) * enemyAcceleration * enemyspeedboost;
    
    eVelx *= enemyFriction;
    eVely *= enemyFriction;
    enemyX += eVelx;
    enemyY += eVely;

    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
}

function usepowerup() {
    invis = true;
    player.style.opacity = "0.3";
    setTimeout(() => {
        invis = false;
        player.style.opacity = "1";
    } , 1450);
}
//collision stuff
function collisiondetection(){
    const pRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect(); 

    // --- ENEMY COLLISION ---
    const enemyOverlap = !(pRect.right < enemyRect.left || 
                      pRect.left > enemyRect.right || 
                      pRect.bottom < enemyRect.top || 
                      pRect.top > enemyRect.bottom);
    
    if (enemyOverlap && !invis) {
        gameOverText.style.display = 'block';
        running = false;
        backgroundmusic.pause(); 
        document.body.classList.remove('hide-cursor');
    }
    
    // --- POWERUP COLLISION ---
    if (powerupact){
        const powerupRect = powerupEl.getBoundingClientRect();

        const puOverlap = !(pRect.right < powerupRect.left || 
                          pRect.left > powerupRect.right || 
                          pRect.bottom < powerupRect.top || 
                          pRect.top > powerupRect.bottom);
        
        if (puOverlap) {
            usepowerup();
            powerupEl.style.display = 'none';
            powerupact = false;
            
            pickup.currentTime = 0;
            pickup.play().catch(e => console.log("Sound error"));
            
            setTimeout(spawninvis, 7000); 
        }
    }

    const bird = document.querySelector('.midnightbird');
    
    if (bird) {
        const birdRect = bird.getBoundingClientRect();
        
        const birdOverlap = !(pRect.right < birdRect.left || 
                              pRect.left > birdRect.right || 
                              pRect.bottom < birdRect.top || 
                              pRect.top > birdRect.bottom);

        if (birdOverlap && !bird.dataset.hit) {
            bird.dataset.hit = "true"; //  so code runs once
            triggerBirdEffect(bird);
        }
    }
}
            
    //bassicaly 
    // POWERUP LOGIC Check
    if (powerupact){
        const powerupRect = powerupEl.getBoundingClientRect();

        const puOverlap = !(pRect.right < powerupRect.left || 
                          pRect.left > powerupRect.right || 
                          pRect.bottom < powerupRect.top || 
                          pRect.top > powerupRect.bottom);
        
        if (puOverlap) {
            usepowerup();
            powerupEl.style.display = 'none';
            powerupact = false;
            
            pickup.currentTime = 0;
            pickup.play().catch(e => console.log("Sound error"));
            
            setTimeout(spawninvis, 7000); 
        }
    }


function updatescore(){
    if(paused || !running) return;

    score++;
    scoreblock.textContent = "Score: " + score;
    
    // Difficulty increase
    if (score % 5 === 0){ 
        enemyspeedboost += 0.06; 
    }
}

function gameLoop(){
if (!running) return;
 //dont update if paused
 if(!paused){
    movePlayer();
        moveEnemy();
        collisiondetection();

        // Update stamina bar
        stamina = Math.min(maxStamina, stamina + staminarate);
        document.getElementById('staminabar').style.width = (stamina / maxStamina * 100) + '%';
    }

    requestAnimationFrame(gameLoop);
 }
 function triggerBirdEffect(bird){

    bird.style.transition = "transform 0.35s, opacity 0.35s"
    bird.style.transform += "rotate(720deg) scale(1.5)";
    bird.style.opacity = "0";
    score += 50;
    scoreblock.textContent = "Score: " + score;
    stamina = maxStamina; 
    
    // 3. Visual feedback on score
    scoreblock.style.backgroundColor = "gold";
    setTimeout(() => {
        scoreblock.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    }, 500);

    pickup.currentTime = 0;
    pickup.play().catch(e => {});
}
// Start
