import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


// Get canvas
let canvas = document.getElementById('game-window');
let ctx = canvas.getContext('2d');


// Load images for background, players and collectible
var backgroundReady = false;
var backgroundImage = new Image();
backgroundImage.onload = function () {backgroundReady = true};
backgroundImage.src = "./public/images/background.png";

var playerPablloReady = false;
var playerPablloImage = new Image();
playerPablloImage.onload = function () {playerPablloReady = true};
playerPablloImage.src = "./public/images/player-pabllo.png";

var playerAnittaReady = false;
var playerAnittaImage = new Image();
playerAnittaImage.onload = function () {playerAnittaReady = true};
playerAnittaImage.src = "./public/images/player-anitta.png";

var playerLuisaReady = false;
var playerLuisaImage = new Image();
playerLuisaImage.onload = function () {playerLuisaReady = true};
playerLuisaImage.src = "./public/images/player-luisa.png";

var collectibleReady = false;
var collectibleImage = new Image();
collectibleImage.onload = function (){collectibleReady = true};
collectibleImage.src = "./public/images/collectible2.png";

var turboReady = false;
var turboImage = new Image();
turboImage.onload = function (){turboReady = true};
turboImage.src = "./public/images/turbo.png";

var arrowReady = false;
var arrowImage = new Image();
arrowImage.onload = function (){arrowReady = true};
arrowImage.src = "./public/images/arrow.png";

var winnerReady = false;
var winnerImage = new Image();
winnerImage.onload = function (){winnerReady = true};
winnerImage.src = "./public/images/winner.png";


// Global Variables
let player, collectible, chosenAvatar;
let selector = 1;

const avatarWidth = 15;

const gamePage = {
    menu: 1,
    start: 2,
    gameover: 3,
}
let gameView = gamePage.menu;

const avatarsObj = {
    "pabllo": {
        id: 0,
        audio: new Audio('./public/audios/audio-pabllo.mp3'),
        image: playerPablloImage,
        x: (canvas.width / 4) - (avatarWidth / 2) - 10,
    },
    "anitta": {
        id: 1,
        audio: new Audio('./public/audios/audio-anitta.mp3'),
        image: playerAnittaImage,
        x: (canvas.width / 2) - (avatarWidth / 2),
    },
    "luisa": {
        id: 2,
        audio: new Audio('./public/audios/audio-luisa.mp3'),
        image: playerLuisaImage,
        x: (3 * canvas.width / 4) - (avatarWidth / 2) + 10,
    },
}


// Socket connection
const socket = io('https://luisclaudioc.github.io/multiplayer-game-modo-turbo/');

socket.on('init', handleInit);

socket.on('connect', () => {
    player = new Player({ 
        x: 0,
        y: canvas.height / 2 - 10, 
        score: 0, 
        id: socket.id, 
        vel: 20, 
        avatar: "",
    });
    gameView = gamePage.menu;
    socket.emit('newPlayer', { playerObj: player }); 
});

socket.on('updateGameState', (gameState, playerScore) => {
    if (!backgroundReady || !playerPablloReady || !playerAnittaReady || !playerLuisaReady || !collectibleReady || !arrowReady || !turboReady) {
        setTimeout(() => {
            init(gameState);
        }, "100")
    } else {
        if (playerScore) {
            if (playerScore.sound && gameView === gamePage.start) avatarsObj[playerScore.sound].audio.play();
            if (playerScore.resetScore) {
                player.score = 0;
                socket.emit('movePlayer', { playerObj: player });
            }
        }
        if (gameState.count === 0 && gameView === gamePage.start) handleGameOver(); 
        init(gameState);
    }
});


// Functionality
function init(gameState) {
    render(gameState);
}

function render(gameState) {
    switch (gameView) {
        case 1:
            if (backgroundReady) ctx.drawImage(backgroundImage, 0, 0);
            if (playerPablloReady) ctx.drawImage(playerPablloImage, (canvas.width / 2) - (avatarWidth / 2) - 45, 100);
            if (playerAnittaReady) ctx.drawImage(playerAnittaImage, (canvas.width / 2) - (avatarWidth / 2), 100);
            if (playerLuisaReady) ctx.drawImage(playerLuisaImage, (canvas.width / 2) - (avatarWidth / 2) + 45, 100);
            if (arrowReady) ctx.drawImage(arrowImage, (canvas.width / 2) - 45 + ( 45 * selector  ) - (avatarWidth / 2), 70);
            if (turboReady) ctx.drawImage(turboImage, (canvas.width / 2) - 12.5, 240);
            ctx.fillStyle = "white"
            ctx.textAlign = "center";
            ctx.font = "16px Courier New";
            ctx.fillText(`Select your player: ${selector === 0 ? "Pabllo Vittar" : selector === 1 ? "Anitta" : "Luisa Sonza"}`, canvas.width / 2, 180);
            ctx.font = "25px Courier New";
            ctx.fillText(`Press enter to start`, canvas.width / 2, 350);
        break;
        
        case 2:
            if (backgroundReady) ctx.drawImage(backgroundImage, 0, 0);
            collectible = new Collectible(gameState.collectible);
            if (player.collision(collectible)) {
                socket.emit('newCollectible');
            }
            if (collectibleReady) ctx.drawImage(collectibleImage, collectible.x, collectible.y);
            if (playerPablloReady && playerAnittaReady && playerLuisaReady) {
                for (let playerAvatar of gameState.players) {
                    if (playerAvatar.playerObj.avatar) ctx.drawImage(avatarsObj[playerAvatar.playerObj.avatar].image, playerAvatar.playerObj.x, playerAvatar.playerObj.y);
                }
            }
            ctx.textAlign = "left";
            ctx.font = "19px Courier New";
            ctx.fillText(`Your score: ${player.score} | Rank position: ${player.calculateRank(gameState.players)}`, 20, 36);
            ctx.textAlign = "right";
            ctx.fillText(`Time: ${gameState.count}`, 580, 36);
        break;
            
        case 3:
            if (backgroundReady) ctx.drawImage(backgroundImage, 0, 0);
            ctx.textAlign = "center";
            ctx.font = "25px Courier New";
            ctx.fillText(`Time is up!`, canvas.width / 2, 100);
            ctx.font = "20px Courier New";
            ctx.fillText(`Your score: ${player.score}`, canvas.width / 2, 150);
            let position = player.calculateRank(gameState.players)
            ctx.fillText(`Your position: ${position}`, canvas.width / 2, 180);
            if (winnerReady && position[0] === "1") ctx.drawImage(winnerImage, canvas.width / 2 - 20, 240);
            if (turboReady && position[0] !== "1") ctx.drawImage(turboImage, (canvas.width / 2) - 12.5, 240);
            ctx.font = "25px Courier New";
            ctx.fillText(`Press enter to restart`, canvas.width / 2, 350);
        break;
    }
}

function handleKeydown(e) {
    if (gameView === gamePage.menu) {
        switch (e.key) {
            case "Enter":
                handleGameStart();
                return;
            case "ArrowRight": 
                if (selector === 2) selector = 0;
                else selector++;
                render();
            break;
            case "ArrowLeft":
                if (selector === 0) selector = 2;
                else selector--;
                render();
            break;
            default: 
            break;
        }
    }
    if (gameView === gamePage.start) {
        player.movePlayer(e.key, player.vel);
        checkCollision();
        socket.emit('movePlayer', { playerObj: player });
    }
    if (gameView === gamePage.gameover && e.key === "Enter") {
        handleGameRestart();
        return;
    }
}
document.addEventListener("keydown", handleKeydown);

function checkCollision() {
    if (player.collision(collectible)) {
        player.score++;
        socket.emit('newCollectible', player.avatar);
    }
}

function handleGameStart() {
    chosenAvatar = Object.keys(avatarsObj)[selector];
    player.avatar = chosenAvatar;
    player.x = avatarsObj[chosenAvatar].x;
    gameView = gamePage.start;
    socket.emit('newGame', { playerObj: player });
}

function handleGameOver() {
    gameView = gamePage.gameover;
    player.avatar = "";
    player.x = 0;
    player.y = canvas.height / 2 - 10;
    selector = 1;
}

function handleGameRestart() {
    gameView = gamePage.menu;
    player.score = 0;
    socket.emit('newGame', { playerObj: player });
}

function handleInit(serverMsg) {
    console.log(serverMsg);
}
