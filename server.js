const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server); // Use the Server class

const players = {};

const star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
const scores = {
  p1: 0,
  p2: 0
};

let timer = 90; 

let connectedPlayers = 0;

app.use(express.static(__dirname + '/public'));
app.use('*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  connectedPlayers += 1;
console.log(connectedPlayers)

  if(connectedPlayers === 2) {
    socket.emit('twoPlayers')
  }
  
  // create a new player and add it to our players object
  const playerLength = Object.keys(players);
  if (playerLength.length < 2) {
    if (playerLength.length === 0) {
      // Assign to red team if there are no players
      players[socket.id] = {
        rotation: 0,
        x: 356,
        y: 565,
        playerId: socket.id,
        team: 'red'
      };
    } else {
      // Assign to the opposite team if there is already a player
      const existingPlayer = players[playerLength[0]];
      const newPlayerTeam = existingPlayer.team === 'red' ? 'blue' : 'red';
      const newPlayerX = existingPlayer.team === 'red' ? 1375 : 356; // Change the x-coordinate for the opposite team
      players[socket.id] = {
        rotation: 0,
        x: newPlayerX,
        y: 565,
        playerId: socket.id,
        team: newPlayerTeam
      };
    }
  } else {
    console.log('player limit reached');
    socket.disconnect(true);
    return;
  }
  
  // ...
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  console.log('Players: ', players);

  // send the star object to the new player
  // socket.emit('starLocation', star);
  // send the current scores
  socket.emit('scoreUpdate', scores);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  console.log('players:', players);


  socket.on('disconnect', function() {
    console.log('user disconnected: ', socket.id);

    // Decrement the number of connected players
    connectedPlayers--;
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnected', socket.id);

  });

    function reduceTimer () {
      setInterval(() => {
        timer--;
        if(timer <= 0) { 
          io.emit('gameOver')
        }
        io.emit('timeUpdate', timer);
      }, 1000)
    }

    if(connectedPlayers > 1) {
      reduceTimer()
    }

  // when a player moves, update the player data
  // socket.on('playerMovement', function(movementData) {

  //   players[socket.id].x = movementData.x;
  //   players[socket.id].y = movementData.y;
  //   players[socket.id].rotation = movementData.rotation;
  //   // emit a message to all players about the player that moved
  //   socket.broadcast.emit('playerMoved', players[socket.id]);



    // socket.on('starCollected', function () {
    //   if (players[socket.id].team === 'red') {
    //     scores.red += 10;
    //   } else {
    //     scores.blue += 10;
    //   }
    //   star.x = Math.floor(Math.random() * 700) + 50;
    //   star.y = Math.floor(Math.random() * 500) + 50;
    //   io.emit('starLocation', star);
    //   io.emit('scoreUpdate', scores);
    // });
  // });

  // Function to check if two players overlap
  function checkOverlap(player1, player2) {
    const distanceX = Math.abs(player1.x - player2.x);
    const distanceY = Math.abs(player1.y - player2.y);
    const overlapThreshold = 50; // Adjust this threshold as needed

    return distanceX <= overlapThreshold && distanceY <= overlapThreshold;
  }
  
  // when a player moves, update the player data
  socket.on('playerMovement', function(movementData) {
    const currentPlayer = players[socket.id];
    currentPlayer.x = movementData.x;
    currentPlayer.y = movementData.y;
    currentPlayer.rotation = movementData.rotation;

    // Emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', currentPlayer);

    // Check for overlap between the two players
    const playerIds = Object.keys(players);
    if (playerIds.length === 2) {
      const player1 = players[playerIds[0]];
      const player2 = players[playerIds[1]];

      // Check if players overlap based on their positions
      const overlap = checkOverlap(player1, player2);
      if (overlap) {
        scores.p1 += 0.5;
        io.emit('scoreUpdate', scores);

        // Players are overlapping, perform necessary actions
        io.emit('playersOverlap'); // Emit an event when players overlap
        console.log('Players are overlapping!');
        // You can store a variable or perform any required actions here
      }
      return overlap;
    }
  });

  // socket.on('escaped',() => {
  //   scores.p2 += 0.5;
  //   io.emit('scoreUpdate', scores);
  // })

});




server.listen(3000, function() {
  console.log(`Listening on ${server.address().port}`);
});
