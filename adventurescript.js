
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
const enemy2 = document.getElementById("enemy2");
const gameOverText = document.getElementById('gameover');
const scoreblock = document.getElementById("score");
const powerupEl = document.getElementById('powerup'); 
const portalvid = document.getElementById("portalvid")
const backgrounds=[
    "bg-google",
    "bg-midnnight",
    "bg-reddit"

];
const minimum_enemydist=90;
const repel =0.6;
const safetynet =180;
const tokens=6;
let keycollected =0;
let keydrops=[]



let currentbackgroundindex = 0;



const acceleration = 0.87; // 
const friction = 0.90;
const birdFlapFrames = ["wing_up26.png", "wing_down26.png"]; 

document.body.classList.add('hide-cursor');

let playerX = 200, playerY = 200;
let enemyX = 600, enemyY = 600;
let enemy2X = 0 , enemy2Y = 0;

let pVelx = 0, pVely = 0;
let eVelx = 0, eVely = 0;
let e2Velx=0, e2Vely=0;
let enemyAcceleration = 0.7;
let enemyFriction = 0.92; // 
let level = 1;
//chuck in spped mutlply aswell
let speedmult = 1;

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

let powerupact = false;
let invis = false;

// Wander variables
let wanderx = 0;
let wandery = 0;
let wandertime = 0;

let score = 0;
let keys = {};
let immune=false;

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gamearea');
    level = 1;
    enemy2.style.display = "none";
        gameArea.classList.remove(...backgrounds,"bg-default");
        gameArea.classList.add("bg-google");
        currentbackgroundindex=0;
    
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
function deathfunction(){
  running = false;
  paused = true;         
  gameOverText.style.display = "block";
  backgroundmusic.pause();
  document.body.classList.remove("hide-cursor");
}
function resetGame() {
    // Reset positions
    playerX = window.innerWidth / 2 - 17;
    playerY = window.innerHeight / 2 - 17;
    enemyX = 100; 
    enemyY = 100;

    // Reset state/stats
    pVelx = 0; pVely = 0; eVelx = 0; eVely = 0;
    e2Velx=0; e2Vely=0;
    score = 0;
    scoreblock.textContent = "Score: 0";
    enemyspeedboost = 1;
    stamina = maxStamina;
    invis = false;
    player.style.opacity = "1";
    level = 1;
    enemy2.style.display="none";
    clearKeys();
    keycollected = 0;
    speedmult = 1;
   immune = false;

    gameA.classList.remove(...backgrounds, "bg-default");
    gameA.classList.add("bg-google");
    currentbackgroundindex = 0;




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
function keepapart(){
    if(level < 2)return;
    const dx= enemy2X-enemyX;
    const dy = enemy2Y-enemyY
    const dist = Math.hypot(dx,dy);
    if (dist===0) return;

if (dist < minimum_enemydist) {
    const overlap = minimum_enemydist - dist;
    const nx = dx / dist;
    const ny = dy / dist;

    enemyX  -= nx * overlap * 0.5 * repel;
    enemyY  -= ny * overlap * 0.5 * repel;
    enemy2X += nx * overlap * 0.5 * repel;
    enemy2Y += ny * overlap * 0.5 * repel;
    //still keep inside as usua
    enemyX  = Math.max(0, Math.min(enemyX,  window.innerWidth  - 32));
    enemyY  = Math.max(0, Math.min(enemyY,  window.innerHeight - 32));
    enemy2X = Math.max(0, Math.min(enemy2X, window.innerWidth  - 32));
    enemy2Y = Math.max(0, Math.min(enemy2Y, window.innerHeight - 32));

     enemy.style.left  = enemyX + "px";
    enemy.style.top   = enemyY + "px";
    enemy2.style.left = enemy2X + "px";
    enemy2.style.top  = enemy2Y + "px";

}
}
function clearKeys(){
  keydrops.forEach(k => k.remove());
  keydrops = [];
  keycollected = 0;
}
function spawnkeys(){
    clearKeys();
    const size=14;
     const padding = 25;

  for (let i = 0; i < tokens; i++){
    const keyEl = document.createElement("div");
    keyEl.className = "keydrop";

    const x = padding + Math.random() * (window.innerWidth  - size - padding * 2);
    const y = padding + Math.random() * (window.innerHeight - size - padding * 2);

    keyEl.style.left = x + "px";
    keyEl.style.top  = y + "px";

    gameA.appendChild(keyEl);
    keydrops.push(keyEl);
  }
}
function  changethebackg(){
    const currentclass = backgrounds[currentbackgroundindex];

    gameA.classList.remove(...backgrounds,"bg-default");
    //turns out have to use some modulo wtv the hell that means
    currentbackgroundindex =  (currentbackgroundindex+1)% backgrounds.length;
    const newclass =backgrounds[currentbackgroundindex];
    gameA.classList.add(newclass);
}
function safetynetaway(isEnemy2){
    const ex = isEnemy2 ? enemy2X:enemyX;
    const ey = isEnemy2 ? enemy2Y:enemyY;

    const dx = ex - playerX;
  const dy = ey - playerY;
  const dist = Math.hypot(dx, dy);

  if (dist === 0) return;

  if (dist < safetynet) {
    const need = safetynet- dist;
    const nx = dx / dist;
    const ny = dy / dist;

    const newX = ex + nx * need;
    const newY = ey + ny * need;

    if (isEnemy2) {
      enemy2X = Math.max(0, Math.min(newX, window.innerWidth - 32));
      enemy2Y = Math.max(0, Math.min(newY, window.innerHeight - 32));
      enemy2.style.left = enemy2X + "px";
      enemy2.style.top  = enemy2Y + "px";
    } else {
      enemyX = Math.max(0, Math.min(newX, window.innerWidth - 32));
      enemyY = Math.max(0, Math.min(newY, window.innerHeight - 32));
      enemy.style.left = enemyX + "px";
      enemy.style.top  = enemyY + "px";
    }
  }
}

function startportal(){
    paused = true;
    backgroundmusic.pause();
    document.body.classList.remove("hide-cursor");

    player.style.display = "none";
    enemy.style.display="none";
    enemy2.style.display="none"
    powerupEl.style.display = "none";


    portalvid.classList.remove("portalhidden");
    portalvid.currentTime = 0;

    function playVideoOnce() {
        portalvid.play().catch(e => {
            console.error("Video playback failed:", e);
            setTimeout(portalvid.onended, 1500); 
        });
        portalvid.removeEventListener('loadeddata', playVideoOnce);
    }
    portalvid.addEventListener('loadeddata', playVideoOnce);
    portalvid.load();
}
    portalvid.addEventListener("ended",() => {
        changethebackg();
        score +=99;
        level += 1;
        if(level >= 2){
            enemy2.style.display="block";
            e2Velx=0;
            e2Vely= 0;
            spawnenemy2();
            safetynetaway(false);
            if (level>=2)safetynetaway(true);
            keepapart();
        }
        if (level === 3){
            spawnkeys();
            } else {
             clearKeys();
            }

        scoreblock.textContent = "score:"+ score;
        stamina=maxStamina;
        //so then i hide away the vid
        portalvid.classList.add("portalhidden");
        player.style.display = "block";
        enemy.style.display = "block";//power up naturally comes in or somethin
//start it bakc uo again
        paused = false;
        document.body.classList.add("hide-cursor")
        if (musicHasStarted){
            backgroundmusic.play();
        }

;


    });
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
    if (keys['ArrowUp']) pVely -= acceleration*speedmult;
    if (keys['ArrowDown']) pVely += acceleration*speedmult;
    if (keys['ArrowLeft']) pVelx -= acceleration*speedmult;
    if (keys['ArrowRight']) pVelx += acceleration*speedmult;
    
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
    flipcharachter();
}
function spawnenemy2(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const margin = 100;

  // opposite side of the PLAYER
  enemy2X = (playerX < w/2) ? (w - margin) : margin;
  enemy2Y = (playerY < h/2) ? (h - margin) : margin;

  enemy2X = Math.max(0, Math.min(enemy2X, w - 32));
  enemy2Y = Math.max(0, Math.min(enemy2Y, h - 32));

  enemy2.style.left = enemy2X + "px";
  enemy2.style.top  = enemy2Y + "px";
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
function moveEnemy2() {
    const dx = playerX - enemy2X;
    const dy = playerY - enemy2Y;
    const angle = Math.atan2(dy,dx);

    e2Velx += Math.cos(angle) * enemyAcceleration * enemyspeedboost;
    e2Vely += Math.sin(angle) * enemyAcceleration * enemyspeedboost;
    
    e2Velx *= enemyFriction;
    e2Vely *= enemyFriction;
    enemy2X += e2Velx;
    enemy2Y += e2Vely;

    enemy2.style.left = enemy2X + "px";
    enemy2.style.top = enemy2Y + "px";
    //copy in wander thing for him aswell
    if(invis){
        enemy2X +=(Math.random()-0.5)*4
         enemy2Y+=(Math.random()-0.5)*4

         enemy2X =Math.max(0,Math.min(enemy2X,window.innerWidth-32))
         enemy2Y =Math.max(0,Math.min(enemy2Y,window.innerHeight-32))

         enemy2.style.left = enemy2X + "px";
         enemy2.style.top = enemy2Y + "px";


    }
}

function usepowerup() {
    invis = true;
    player.style.opacity = "0.3";
    setTimeout(() => {
        invis = false;
        player.style.opacity = "1";
    } , 1450);
}
function checkkeys(){
    if(level !==3) return;
    const p=player.getBoundingClientRect();
    for (let i = keydrops.length - 1; i>=0; i--){
    const k = keydrops[i].getBoundingClientRect();
    const hit = !(
        p.right<k.left|| p.left>k.right||
        p.bottom<k.top||p.top>k.bottom
    );
    if(hit){
        keydrops[i].remove();
        keydrops.splice(i,1);
        keycollected++;

        pickup.currentTime= 0 ;
        pickup.play().catch(()=>{})
    }
    }
    if (keycollected>= tokens){
        window.location.href ="win.html";
    }
}
//collision stuff
function collisiondetection() {
  const pRect = player.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();

  // enemy collision
  const enemyOverlap = !(
    pRect.right < enemyRect.left ||
    pRect.left > enemyRect.right ||
    pRect.bottom < enemyRect.top ||
    pRect.top > enemyRect.bottom
  );
  if (level>=2){
    const enemy2Rect = enemy2.getBoundingClientRect()
;
  const enemy2overlap = !(
    pRect.right < enemy2Rect.left ||
    pRect.left > enemy2Rect.right ||
    pRect.bottom < enemy2Rect.top ||
    pRect.top > enemy2Rect.bottom
  );//bassically make it then so that if overlapped and invis act then all stuff haopens
  if(enemy2overlap && !invis&& !immune) {
deathfunction();
    return;

  }
}

  if (enemyOverlap && !invis && !immune) {
    deathfunction();
    return;
  }
  if (powerupact) {
    const powerupRect = powerupEl.getBoundingClientRect();

    const puOverlap = !(
      pRect.right < powerupRect.left ||
      pRect.left > powerupRect.right ||
      pRect.bottom < powerupRect.top ||
      pRect.top > powerupRect.bottom
    );

    if (puOverlap) {
      usepowerup();
      powerupEl.style.display = "none";
      powerupact = false;

      pickup.currentTime = 0;
      pickup.play().catch(() => {});

      setTimeout(spawninvis, 7000);
    }
  }
  //check if collided with bird through hit datasert
  const bird = document.querySelector(".midnightbird");
  if (bird) {
    const birdRect = bird.getBoundingClientRect();
    const birdOverlap = !(
      pRect.right < birdRect.left ||
      pRect.left > birdRect.right ||
      pRect.bottom < birdRect.top ||
      pRect.top > birdRect.bottom
    );

    if (birdOverlap && !bird.dataset.hit) {
      bird.dataset.hit = "true";
      triggerBirdEffect(bird);
    }
  }
}

//shoulda added this earlier
function flipcharachter(){
  if (pVelx > 0.2) player.style.transform = "scaleX(1)";
  else if (pVelx < -0.2) player.style.transform = "scaleX(-1)";
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
    checkkeys();

    if(level>=2) moveEnemy2();
    
    moveEnemy();

    keepapart();
    collisiondetection();

        // Update stamina bar
        stamina = Math.min(maxStamina, stamina + staminarate);
        document.getElementById('staminabar').style.width = (stamina / maxStamina * 100) + '%';
    }

    requestAnimationFrame(gameLoop);
 }
 function triggerBirdEffect(bird){
    if(level>=3){
        speedmult*=1.1;
        immune= true;
        //three seconds
        setTimeout(() =>{
            immune=false;
            player.style.boxShadow="none";
        },3000);
        bird.dataset.hit="true";
         bird.style.transition = "transform 0.35s, opacity 0.35s"
    bird.style.transform += "rotate(720deg) scale(1.5)";
    bird.style.opacity="0";
    pickup.currentTime=0;
    pickup.play().catch(() =>{});

    return;
    }

bird.dataset.hit = true;
    bird.style.transition = "transform 0.35s, opacity 0.35s"
    bird.style.transform += "rotate(720deg) scale(1.5)";
    bird.style.opacity = "0"; 
    
    // feedback on score get rid of for video thing
    startportal();
    pickup.currentTime = 0;
    pickup.play().catch(e => {});
                                    }
