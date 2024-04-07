require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const noCache = require('nocache');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// Set up helmet 
app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(noCache())
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


// Set up socket
const io = socket(server);

let gameState = {
  players: [],
  collectible: newCollectible(),
}

function newCollectible() {
  let x = Math.floor(Math.random() * (532.5 - 32.5) + 32.5);
  let y;
  if (x < 227.5 || x > 352.5) {
    y = Math.floor(Math.random() * (390 - 50) + 50);
  } else {
    y = Math.floor(Math.random() * (370 - 50) + 50);
  }
  return {
    x: x,
    y: y,
    value: 1,
    id: Math.floor(Math.random() * 10000000000),
  }
}

function countDown() {
  while (gameState.count >= 0) {
    io.emit('updateGameState', gameState)
    if (gameState.count < 0) delete gameState.count;
    return gameState.count--;
  }
}
setInterval(countDown, 1000);

io.on('connection', client => {
  
  client.emit('init', `You are connected with ID: ${client.id}`);

  client.on('newPlayer', (playerObj) => {
    gameState.players.push(playerObj);
    io.emit('updateGameState', gameState)
  });

  client.on('newGame', (newPlayer) => {
    gameState.players = gameState.players.map(player => player.playerObj.id === newPlayer.playerObj.id ? newPlayer : player);
    gameState.count = 60;
    io.emit('updateGameState', gameState, { resetScore: true });
  })

  client.on('movePlayer', (movedPlayer) => {
    gameState.players = gameState.players.map(player => player.playerObj.id === movedPlayer.playerObj.id ? movedPlayer : player)
    io.emit('updateGameState', gameState)
  });

  client.on('newCollectible', (playerScore) => {
    gameState.collectible = newCollectible();
    io.emit('updateGameState', gameState, { sound: playerScore });
  });

  client.on('disconnect', (reason) => {
    gameState.players = gameState.players.filter(player => player.playerObj.id !== client.id);
    io.emit('updateGameState', gameState)
  });

});


module.exports = app; // For testing
