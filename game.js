const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const startButton = document.getElementById("startButton");

const bird = {
  x: 80,
  y: 250,
  radius: 14,
  velocity: 0,
  gravity: 0.38,
  jump: -6.5
};

let pipes = [];
let score = 0;
let running = false;
let animationId;
let frame = 0;

const pipeWidth = 58;
const pipeGap = 155;
const pipeSpeed = 2.2;

function drawBackground() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  drawCloud(70, 90);
  drawCloud(260, 160);

  // Ground
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - 25, canvas.width, 25);

  ctx.fillStyle = "#8bc34a";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 8);
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 19, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 8, 25, 0, Math.PI * 2);
  ctx.arc(x + 47, y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  const angle = Math.min(0.6, Math.max(-0.5, bird.velocity * 0.07));
  ctx.rotate(angle);

  // Body
  ctx.fillStyle = "#ffdf35";
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = "#f4a623";
  ctx.beginPath();
  ctx.ellipse(-5, 4, 9, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(6, -5, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(8, -5, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = "#ff7043";
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(23, 4);
  ctx.lineTo(12, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = "#35b54a";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(
      pipe.x,
      pipe.top + pipeGap,
      pipeWidth,
      canvas.height - (pipe.top + pipeGap) - 25
    );

    ctx.fillStyle = "#248a37";
    ctx.fillRect(pipe.x - 5, pipe.top - 18, pipeWidth + 10, 18);
    ctx.fillRect(pipe.x - 5, pipe.top + pipeGap, pipeWidth + 10, 18);
  });
}

function addPipe() {
  const minTop = 55;
  const maxTop = canvas.height - pipeGap - 100;
  const top = Math.random() * (maxTop - minTop) + minTop;

  pipes.push({
    x: canvas.width,
    top,
    passed: false
  });
}

function hitPipe(pipe) {
  const birdLeft = bird.x - bird.radius;
  const birdRight = bird.x + bird.radius;
  const birdTop = bird.y - bird.radius;
  const birdBottom = bird.y + bird.radius;

  const overlapsX =
    birdRight > pipe.x && birdLeft < pipe.x + pipeWidth;

  const hitsOpening =
    birdTop > pipe.top && birdBottom < pipe.top + pipeGap;

  return overlapsX && !hitsOpening;
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  messageTitle.textContent = "Game Over!";
  messageText.textContent = "Your score: " + score;
  startButton.textContent = "Play Again";
  message.classList.remove("hidden");
}

function update() {
  if (!running) return;

  frame++;
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (frame % 95 === 0) {
    addPipe();
  }

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score++;
      scoreElement.textContent = score;
    }

    if (hitPipe(pipe)) {
      endGame();
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  if (bird.y + bird.radius >= canvas.height - 30 ||
      bird.y - bird.radius <= 0) {
    endGame();
  }
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
}

function gameLoop() {
  update();
  draw();

  if (running) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function flap() {
  if (running) {
    bird.velocity = bird.jump;
  }
}

function startGame() {
  cancelAnimationFrame(animationId);

  bird.y = 250;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frame = 0;

  scoreElement.textContent = score;
  running = true;

  message.classList.add("hidden");
  gameLoop();
}

startButton.addEventListener("click", startGame);

canvas.addEventListener("click", flap);

document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

draw();