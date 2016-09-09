/* Collin Vossman
 * KSU CIS 580
 * Snake Game
*/

/* Global variables */
var frontBuffer = document.getElementById('snake');
var frontCtx = frontBuffer.getContext('2d');
var backBuffer = document.createElement('canvas');
backBuffer.width = frontBuffer.width;
backBuffer.height = frontBuffer.height;
var backCtx = backBuffer.getContext('2d');
var oldTime = performance.now();

var rate = 100;
var timer = 80;

var score = 0;
var gameOver = true;

var scl = 20;
var xSize = backBuffer.height / scl + 2;
var ySize = backBuffer.width / scl + 2;
var tile = new Array(xSize);

var Snake = new Object();
var Food = new Object();
var Obstacles = new Array();

var initialized = false;

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
function loop(newTime) {
  var elapsedTime = newTime - oldTime;
  oldTime = newTime;
  timer += elapsedTime;
  //frameRate(20);
  if (timer >= rate) {
    timer = 0;
    update(elapsedTime);
    render(elapsedTime);

    if (gameOver) return;
    frontCtx.drawImage(backBuffer, 0, 0);
  }
  window.requestAnimationFrame(loop);
}

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {elapsedTime} A DOMHighResTimeStamp indicting
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  // TODO: [Extra Credit] Determine if the snake has run into an obstacle
  move();
  handleFood(elapsedTime);
  handleObstacles();
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {elapsedTime} A DOMHighResTimeStamp indicting
  * the number of milliseconds passed since the last frame.
  */
function render(elapsedTime) {
  backCtx.clearRect(0, 0, backBuffer.width, backBuffer.height);
  backCtx.fillStyle = "grey";
  backCtx.fillRect(0, 0, backBuffer.width, backBuffer.height);

  // TODO: Draw the game objects into the backBuffer

  for (var x = 1; x < xSize - 1; x++) {
    for (var y = 1; y < ySize - 1; y++) {
      switch (tile[x][y]) {
        case "wall":
          backCtx.fillStyle = "black";
          backCtx.fillRect((y - 1) * scl, (x - 1) * scl, scl, scl);
          break;

        case "head":
          backCtx.fillStyle = "green";
          backCtx.fillRect((y - 1) * scl, (x - 1) * scl, scl, scl);
          break;
		  
		case "body":
          backCtx.fillStyle = "green";
          backCtx.fillRect((y - 1) * scl, (x - 1) * scl, scl, scl);
		  /*backCtx.beginPath();
          backCtx.arc(((y - 1) * scl) + (scl / 2), ((x - 1) * scl) + (scl / 2), scl / 2, 0, 2 * Math.PI);
          backCtx.fill();*/
		  break;  
		  
        case "food":
          backCtx.fillStyle = "red";
          backCtx.beginPath();
          backCtx.arc(((y - 1) * scl) + (scl / 2), ((x - 1) * scl) + (scl / 2), scl / 2, 0, 2 * Math.PI);
          backCtx.fill();
          break;
		
      }
    }
  }
  document.getElementById("currScore").innerHTML = score;
}

function spawnSnake() {
  var head = randomPos(5);
  Snake.x = head.x;
  Snake.y = head.y;

  switch (getRandom(0, 3)) {
    case 0:
      Snake.dir = "up";
      Snake.tail = [[Snake.x - 1, Snake.y], [Snake.x - 2, Snake.y]]
      break;

    case 1:
      Snake.dir = "left";
      Snake.tail = [[Snake.x, Snake.y - 1], [Snake.x, Snake.y - 2]]
      break;

    case 2:
      Snake.dir = "down";
      Snake.tail = [[Snake.x + 1, Snake.y], [Snake.x + 2, Snake.y]]
      break;

    case 3:
      Snake.dir = "right";
      Snake.tail = [[Snake.x, Snake.y + 1], [Snake.x, Snake.y + 2]]
      break;
  }

  Snake.nextDir = Snake.dir;
}

function move() {
  var newPos = new Object();
  checkDir();
  switch (Snake.dir) {
    case "up":
      newPos.x = Snake.x - 1;
      newPos.y = Snake.y;
      break;

    case "left":
      newPos.x = Snake.x;
      newPos.y = Snake.y - 1;
      break;

    case "down":
      newPos.x = Snake.x + 1;
      newPos.y = Snake.y;
      break;

    case "right":
      newPos.x = Snake.x;
      newPos.y = Snake.y + 1;
      break;
  }

  newPos.type = tile[newPos.x][newPos.y];

  switch (newPos.type) {
    case "wall":
	  frontCtx.clearRect(0, 0, backBuffer.width, backBuffer.height);
	  frontCtx.fillStyle = "red"; 
      frontCtx.font = "bold 60px Verdana";
      frontCtx.fillText("GAME OVER", backBuffer.width / 2, backBuffer.height / 2);
	  var audio = new Audio('assets/gameover.m4a');
	  audio.play();
      gameOver = true;
      if (score > document.getElementById("highScore").innerHTML) document.getElementById("highScore").innerHTML = score;
      break;
    case "head":
    case "body":
      frontCtx.clearRect(0, 0, backBuffer.width, backBuffer.height);
	  frontCtx.fillStyle = "red"; 
      frontCtx.font = "bold 60px Verdana";
      frontCtx.fillText("GAME OVER", backBuffer.width / 2, backBuffer.height / 2);
	  var audioGameOver = new Audio('assets/gameover.m4a');
	  audioGameOver.play();
      gameOver = true;
      if (score > document.getElementById("highScore").innerHTML) document.getElementById("highScore").innerHTML = score;
      break;

    case "food":
      Snake.tail.push([-1, -1]);
      Food.spawned = false;
      Food.count++;
      score += 10;
	  var audioNom = new Audio('assets/om.m4a');
	  audioNom.play();

    case "open":
      var endX = Snake.tail[Snake.tail.length - 1][0];
      var endY = Snake.tail[Snake.tail.length - 1][1];
      if (endX == -1) endX = Snake.tail[Snake.tail.length - 2][0];
      if (endX == -1) endY = Snake.tail[Snake.tail.length - 2][1];
      tile[endX][endY] = "open";

      for (var i = Snake.tail.length - 1; i > 0; i--) {
        Snake.tail[i][0] = Snake.tail[i - 1][0];
        Snake.tail[i][1] = Snake.tail[i - 1][1];
        tile[Snake.tail[i][0]][Snake.tail[i][1]] = "body";
      }

      Snake.tail[0][0] = Snake.x;
      Snake.tail[0][1] = Snake.y;
      tile[Snake.x][Snake.y] = "body";

      Snake.x = newPos.x;
      Snake.y = newPos.y;
      tile[Snake.x][Snake.y] = "head";
      break;
  }
}

function checkDir() {
  if (Snake.nextDir == Snake.dir) return;
  switch (Snake.dir) {
    case "up":
      if (Snake.nextDir == "down") Snake.nextDir = "up";
      break;
    case "left":
      if (Snake.nextDir == "right") Snake.nextDir = "left";
      break;
    case "down":
      if (Snake.nextDir == "up") Snake.nextDir = "down";
      break;
    case "right":
      if (Snake.nextDir == "left") Snake.nextDir = "right";
      break;
  }
  Snake.dir = Snake.nextDir;
}

//food generator
function handleFood(elapsedTime) {
  Food.timer += elapsedTime;
  

  if (Food.timer >= Food.rate) {
    Food.timer = 0;
    Food.rate = getRandom(100, 500);

    var newPos = randomPos(1);
    Food.x = newPos.x;
    Food.y = newPos.y;

    Food.spawned = true;

    tile[Food.x][Food.y] = "food";
  }
}

//obstacle generator
function handleObstacles() {
  if (Snake.tail.length - 15 >= Obstacles.length) {
    var newObstacle = randomPos(1);
    Obstacles.push(newObstacle);
    tile[newObstacle.x][newObstacle.y] = "wall";
  }
}

/* Initialize the game */
function initializeGame() {
  frontCtx.fillStyle = "grey";
  frontCtx.fillRect(0, 0, backBuffer.width, backBuffer.height);
  frontCtx.fillStyle = "black";
  frontCtx.font = "bold 40px Verdana";
  frontCtx.textAlign = "center";
  frontCtx.textBaseline = "middle";
  frontCtx.fillText("Press Space", backBuffer.width / 2, backBuffer.height / 2);

  for (var x = 0; x < xSize; x++) {
    tile[x] = new Array(ySize);
    for (var y = 0; y < ySize; y++) {
      tile[x][y] = (x == 0 || x == xSize - 1 || y == 0 || y == ySize - 1) ? "wall" : "open";
    }
  }

  score = 0;

  spawnSnake();

  Food.rate = 50;
  Food.timer = 50;
  Food.lastSpawn = oldTime;
  Food.spawned = false;
  Food.x = -1;
  Food.y = -1;
  Food.value = 5;
  Food.count = 0;

  Obstacles = new Array();

  initialized = true;
  gameOver = !initialized;
}

/* Launch the game */
function startGame() {
  initialized = false;
  window.requestAnimationFrame(loop);
}

//movement
window.onkeydown = function (event) {
  switch (event.keyCode) {

    // UP
    case 38:
    case 87:
      event.preventDefault();
      Snake.nextDir = "up";
      break;
	  
    // DOWN
    case 40:
    case 83:
      event.preventDefault();
      Snake.nextDir = "down";
      break;
    // LEFT
    case 37:
    case 65:
      event.preventDefault();
      Snake.nextDir = "left";
      break;

    // RIGHT
    case 39:
    case 68:
      event.preventDefault();
      Snake.nextDir = "right";
      break;

    // SPACE
    case 32:
      event.preventDefault();
      if (initialized) startGame();
      break;
	case 80: //p
   	  togglePause();
      break; 
  }
}

//random number generator
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

//random position generator
function randomPos(limit) {
  var pos = { x: -1, y: -1 }
  do {
    pos.x = getRandom(limit, (xSize - 1) - limit);
    pos.y = getRandom(limit, (ySize - 1) - limit);
  } while (tile[pos.x][pos.y] != "open")
  return pos;
}

// Attempt at adding puase funcitonality
/*
function pauseGameKeyHandler(e) { 
      var keyCode = e.keyCode;
      switch(keyCode){ 
        case 80: //p
          togglePause();
          break; 
      }
    }
	
function togglePause(e) {
	if (keyCode == 80) {
		pause();
	} else if (!paused) {
		pause();
	} else if (paused) {
		resume();
	}
};

function pause() {
	paused = true;
	pauseTime = Date.now();

	var pausedElement = document.getElementById( 'paused' );

	if( pausedElement ) {
		pausedElement.style.width = world.width + 'px';
		pausedElement.style.height = world.height + 'px';
	}

	document.body.className = 'paused';
}

function resume() {
	var wasPaused = paused;

	paused = false;
	time += Date.now() - pauseTime;

	if( wasPaused ) {
		timeLastFrame = Date.now();
		animate();
	}

	document.body.className = '';
}*/

initializeGame();