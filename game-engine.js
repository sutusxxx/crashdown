let game;
let blockBar;

let music;
let clickSound;
let bigClickSound;
let powerUpSound;
let gameOverSound;

let blockProgress;
let time;

const DEFAULT_GAME_SPEED = 200;
let gameSpeed = DEFAULT_GAME_SPEED;

let hours = 0;
let minutes = 0;
let seconds = 0;

let highScore;
let score = 0;

const DEFAULT_POWER_UP = 3;
let powerUps = DEFAULT_POWER_UP;

$(document).ready(function () {
    createGame();
    initBlocks();
    addGameStartEventListeners();
    getHighScore();
});

function createGame() {
    game = $('<div></div>');
    game.appendTo('.container');
    game.attr('id', 'game');

    $('<div id="start"><span>Press any key to start...</span></div>').appendTo(game);

    blockBar = $('#blockBar');
    initSounds();
}

function initSounds() {
    music = $('#backgroundMusic')[0];
    clickSound = $('#clickSound')[0];
    bigClickSound = $('#powerUpSound')[0];
    powerUpSound = $('#powerUpGetSound')[0];
    gameOverSound = $('#gameOverSound')[0];
    music.addEventListener('ended', function () {
        music.pause();
        music.currentTime = 0;
        music.play();
    });
}

function startGame() {
    removeGameStartEventListeners();
    $('#start').remove();
    music.play();
    time = setInterval(setTimer, 1000);
    blockProgress = setInterval(addBlock, gameSpeed);
    $(document).on('click', '.block', function (e) {
        const selectedBlock = $(this);
        let removedBlocks;
        if (e.shiftKey && powerUps > 0) {
            removedBlocks = removeAllByColor(selectedBlock);
            bigClickSound.currentTime = 0;
            bigClickSound.play();
            removePowerUp();
            addScoreWithPowerUp(removedBlocks);
        } else {
            removedBlocks = removeBlocks(selectedBlock);
            if (removedBlocks) {
                clickSound.currentTime = 0;
                clickSound.play();
                addScore(removedBlocks);
            }
        }

        alignBlocksVertically();
        alignBlocksHorizontally();
    });
}

function restartGame() {
    clearGame();
    initBlocks();
    getHighScore();
    startGame();
}

function gameOver() {
    clearInterval(blockProgress);
    clearInterval(time);
    $(document).unbind('click');
    $('<div id="restart"><span>Game Over! Press any key to restart...</span></div>').appendTo(game);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    music.pause();
    music.currentTime = 0;
    gameOverSound.play();
    addRestartGameEventListeners();
}

function clearGame() {
    score = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    setTime();
    setScore();
    gameSpeed = DEFAULT_GAME_SPEED;
    $('#game').empty();
}

function addPowerUp() {
    powerUpSound.play();
    powerUps++;
    $('#powerUp').text(powerUps);
}

function removePowerUp() {
    powerUps--;
    $('#powerUp').text(powerUps);
}

function addScore(removedBlocks) {
    let points;

    if (removedBlocks < 5) points = 5;
    else if (removedBlocks >= 5 && removedBlocks < 10) points = removedBlocks;
    else if (removedBlocks >= 10 && removedBlocks < 15) points = 20;
    else if (removedBlocks >= 15 && removedBlocks < 20) points = 30;
    else if (removedBlocks >= 20 && removedBlocks < 30) points = 2 * removedBlocks;
    else if (removedBlocks >= 30 && removedBlocks < 40) points = 3 * removedBlocks;
    else {
        points = 3 * removedBlocks + 100;
        addPowerUp();
    }

    score += points;
    setScore();
}

function addScoreWithPowerUp(removedBlocks) {
    score += removedBlocks;
    setScore();
}

function setScore() {
    $('#score').text(score)
}

function getHighScore() {
    highScore = localStorage.getItem('highScore') | 0;
    if (highScore) {
        $('<div class="highScore"><span>High Score:</span><span id="highScore"></span></div>').appendTo('.container');
        $('#highScore').text(highScore);
    }
}

function setTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;

        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }
    setTime();
}

function setTime() {
    const time = (hours < 10 ? '0' + hours : hours) + ':' +
        (minutes < 10 ? '0' + minutes : minutes) + ':' +
        (seconds < 10 ? '0' + seconds : seconds);
    $('#timer').text(time);
}

function increaseDifficulty() {
    if (gameSpeed > 100) {
        gameSpeed -= 2;
    } else if (gameSpeed > 50) {
        gameSpeed -= 1;
    }
    clearInterval(blockProgress);
    blockProgress = setInterval(addBlock, gameSpeed);
}

function addGameStartEventListeners() {
    $(window).on('keydown', startGame);
    $(window).on('mousedown', startGame);
}

function addRestartGameEventListeners() {
    $(window).on('keydown', restartGame);
    $(window).on('mousedown', restartGame);
}

function removeGameStartEventListeners() {
    $(window).unbind('mousedown');
    $(window).unbind('keydown');
}