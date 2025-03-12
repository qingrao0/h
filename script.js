const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const map_width = 284;
const map_height = 512;
const FPS = 60;
let frame = 0;
let pipes = [];
let bird = { x: 40, y: map_height / 2 - 50 };
let gravity = 0.1; // Reduced gravity for slower falling
let velocity = 0;
let gameStarted = false; // Track if the game has started
let gameOver = false;
let startTime = Date.now();
let score = 0;
let initialDelay = true; // Add a delay before gravity starts

// Load images
const bird_wing_up = new Image();
bird_wing_up.src = 'images/bird_wing_up.png';
const bird_wing_down = new Image();
bird_wing_down.src = 'images/bird_wing_down.png';
const background = new Image();
background.src = 'images/background.png';
const pipe_body = new Image();
pipe_body.src = 'images/pipe_body.png';
const pipe_end = new Image();
pipe_end.src = 'images/pipe_end.png';

// Load sounds
const jumpSound = new Audio('sounds/jump.mp3');
const collisionSound = new Audio('sounds/collision.mp3');
const backgroundMusic = new Audio('sounds/background.mp3');
backgroundMusic.loop = true; // Loop background music

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw upper pipe
        for (let m = 0; m < pipe.gapY; m++) {
            ctx.drawImage(pipe_body, pipe.x, m * 32);
        }
        ctx.drawImage(pipe_end, pipe.x, pipe.gapY * 32);

        // Draw lower pipe
        for (let m = pipe.gapY + pipe.gapHeight; m < 16; m++) {
            ctx.drawImage(pipe_body, pipe.x, m * 32);
        }
        ctx.drawImage(pipe_end, pipe.x, (pipe.gapY + pipe.gapHeight) * 32);

        pipe.x -= 1; // Move pipe to the left
    });
}

function drawBird(x, y) {
    if (0 <= frame && frame <= 30) {
        ctx.drawImage(bird_wing_up, x, y);
        frame += 1;
    } else if (30 < frame && frame <= 60) {
        ctx.drawImage(bird_wing_down, x, y);
        frame += 1;
        if (frame === 60) frame = 0;
    }
}

function checkCollision() {
    // Check collision with ground
    if (bird.y + 24 >= map_height) {
        return true;
    }

    // Check collision with pipes
    for (const pipe of pipes) {
        if (
            bird.x + 24 > pipe.x &&
            bird.x < pipe.x + 52 &&
            (bird.y < pipe.gapY * 32 || bird.y + 24 > (pipe.gapY + pipe.gapHeight) * 32)
        ) {
            return true;
        }
    }

    return false;
}

function resetGame() {
    pipes = [];
    bird = { x: 40, y: map_height / 2 - 50 };
    velocity = 0;
    gameStarted = false;
    gameOver = false;
    startTime = Date.now();
    score = 0;
    initialDelay = true; // Reset initial delay
    backgroundMusic.play(); // Restart background music
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Game Over! Press R to Restart', 10, map_height / 2);
        return;
    }

    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000;

    // Generate pipes after 2 seconds
    if (elapsedTime > 2 && pipes.length < 4) {
        const x = pipes.length === 0 ? map_width : pipes[pipes.length - 1].x + 200;
        const gapY = Math.floor(Math.random() * 6) + 2; // Ensure pipes don't appear too high
        const gapHeight = 5; // Gap between pipes
        pipes.push({ x, gapY, gapHeight });
    }

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x < -80) {
        pipes.shift();
        score += 1; // Increase score when passing a pipe
    }

    // Apply gravity only if the game has started
    if (gameStarted) {
        velocity += gravity;
        bird.y += velocity;
    }

    // Check for collision
    if (checkCollision()) {
        if (!gameOver) {
            collisionSound.play(); // Play collision sound
            backgroundMusic.pause(); // Pause background music
        }
        gameOver = true;
    }

    // Draw everything
    ctx.drawImage(background, 0, 0);
    drawPipes();
    drawBird(bird.x, bird.y);

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Press SPACE to Jump', 10, map_height - 40);
    ctx.fillText('Press R to Restart', 10, map_height - 20);

    requestAnimationFrame(gameLoop);
}

// Event listeners for keyboard
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true; // Start the game on first jump
        }
        if (!gameOver) {
            bird.y -= 60; // Increase jump height
            velocity = 0;
            jumpSound.play(); // Play jump sound
        }
    }
    if (event.code === 'KeyR' && gameOver) {
        resetGame();
        gameLoop();
    }
});

// Event listeners for touch (mobile support)
canvas.addEventListener('touchstart', (event) => {
    if (!gameStarted) {
        gameStarted = true; // Start the game on first touch
    }
    if (!gameOver) {
        bird.y -= 60; // Increase jump height
        velocity = 0;
        jumpSound.play(); // Play jump sound
    }
    if (gameOver) {
        resetGame();
        gameLoop();
    }
    event.preventDefault(); // Prevent default touch behavior
});

// Start the game
bird_wing_up.onload = () => {
    backgroundMusic.play(); // Start background music
    gameLoop();
};