const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1600,
  height: 1150,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: { y: 5 },
      setBounds: {
        left: true,
        right: true,
        top: true,
        bottom: true
      }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let canJump = true;
let justJumped = false;
let inAir = false;
let doubleJump = false;

function preload() {
  // this.load.image('player', 'assets/sprites/player_placeholder.png');
  this.load.atlas('fox', '../assets/sprites/fox.png', '../assets/sprites/fox.json');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('stage_one', 'assets/tiles/foxgate-city-day.png');
  this.load.image('stage_one_platform_ground', 'assets/tiles/foxgate-city-day-platform.PNG');
  this.load.image('stage_one_platform_roof-1-pink', 'assets/tiles/foxgate-city-day-platform-roof-1-pink.PNG');
  this.load.image('stage_one_platform_roof-2-orange', 'assets/tiles/foxgate-city-day-platform-roof-2-orange.PNG');
}


function create() {
  //const player = this.physics.add.sprite(350, 0, 'player'); 
  const self = this;
  this.socket = io();
  this.otherPlayers = this.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();
     // Players joining
     this.socket.on('currentPlayers', function(players) {
      Object.keys(players).forEach(function(id) {
        if (players[id].playerId === self.socket.id) {
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });

    this.socket.on('newPlayer', function(playerInfo) {
      addOtherPlayers(self, playerInfo);
    });
    
    this.socket.on('disconnected', function(playerId) {
      self.otherPlayers.getChildren().forEach(function(otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
  
  
    this.socket.on('playerMoved', function(playerInfo) {
      self.otherPlayers.getChildren().forEach(function(otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
  

  // Background image 
  const backgroundImage = this.add.image(0, 0, 'stage_one').setOrigin(0);

  // Adjust the scale of the image to fit the screen
  const screenWidth = this.cameras.main.width;
  const screenHeight = this.cameras.main.height;
  const scaleRatio = Math.max(screenWidth / backgroundImage.width, screenHeight / backgroundImage.height);
  backgroundImage.setScale(scaleRatio);

  // Center the image on the screen
  backgroundImage.setPosition(0, 0);


  //Game Timer 
  this.timerSeconds = 120; // 2 minutes in seconds
  this.timerText = this.add.text(300, 16, '', { fontSize: '32px', fill: '#000' });

  this.timer = setInterval(() => {
    this.timerSeconds--;

    this.timerText.setText('Time: ' + this.timerSeconds);

    if (this.timerSeconds <= 0) {
      alert('Game Over!!');
      //handleGameOver();
      clearInterval(this.timer); // Stop the timer
    }
  }, 1000); // Update the timer every second (1000 milliseconds)


  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  this.socket.on('scoreUpdate', function(scores) {
    self.blueScoreText.setText('Player 1: ' + scores.blue);
    self.redScoreText.setText('Player 2: ' + scores.red);
  });

  // Define movement variables
  this.moveInput = 0;
  this.moveSpeed = 1600;
  this.acceleration = 1000;
  this.deceleration = 500;

  // TESTING Log mouse position on click 
  this.input.on('pointerdown', function(pointer) {
    console.log('Mouse Position:', pointer.x, pointer.y);
  });

  this.player = this.matter.add.image(200, 200, 'fox').setScale(4);
  this.canJump = true;

  const platformGround1 = this.matter.add.image(300, 948, 'stage_one_platform_ground');
  platformGround1.setStatic(true);
  platformGround1.setScale(0.6); // Shrink the platform by a scale 

  const platformGround2 = this.matter.add.image(768, 948, 'stage_one_platform_ground');
  platformGround2.setStatic(true);

  platformGround2.setScale(0.6); // Shrink the platform by a scale 

  const platformGround3 = this.matter.add.image(1150, 1048, 'stage_one_platform_ground');
  platformGround3.setStatic(true);
  platformGround3.setScale(0.6); // Shrink the platform by a scale

  const platformGround4 = this.matter.add.image(1650, 1048, 'stage_one_platform_ground');
  platformGround4.setStatic(true);
  platformGround4.setScale(0.6); // Shrink the platform by a scale 


  const platformRoof1 = this.matter.add.image(1376, 565, 'stage_one_platform_roof-1-pink');
  platformRoof1.setStatic(true);
  platformRoof1.setScale(0.6); // Shrink the platform by a scale 
  // Adjust the values of x and y to position the platform

  const platformRoof2 = this.matter.add.image(356, 561, 'stage_one_platform_roof-2-orange');
  platformRoof2.setStatic(true);
  platformRoof2.setScale(0.6); // Shrink the platform by a scale
  // Adjust the values of x and y to position the platform

  const platformRoof3 = this.matter.add.image(906, 261, 'stage_one_platform_roof-2-orange');
  platformRoof3.setStatic(true);
  platformRoof3.setScale(0.6); // Shrink the platform by a scale
  // Adjust the values of x and y to position the platform

  // Create a sprite for the bottom platform
  const bottomPlatform = this.matter.add.sprite(game.config.width / 2, game.config.height, 'platform');

  // Set origin to center bottom
  bottomPlatform.setOrigin(0, 0);
  bottomPlatform.setStatic(true);
}


function update() {
  this.player.setOnCollide

  this.player.body.isSensor = false; // Enable collisions
  this.player.body.restitution = 0; // Set restitution to 0 to prevent bouncing off surfaces
  this.player.body.airFriction = 0.2;
  this.player.body.friction = 0.15;
  const maxSpeed = 12;
  let acceleration = 1.5;

  if (this.cursors.left.isDown) {
    this.player.setVelocityX(this.player.body.velocity.x - acceleration);
    this.player.setFlipX(true); // Flip the sprite horizontally
  }
  // Check for right arrow key press
  else if (this.cursors.right.isDown) {
    this.player.setVelocityX(this.player.body.velocity.x + acceleration);
    this.player.setFlipX(false); // Reset the sprite's flip
  }

  if (this.player.body.velocity.x > maxSpeed) {
    this.player.setVelocityX(maxSpeed);
  } else if (this.player.body.velocity.x < -maxSpeed) {
    this.player.setVelocityX(-maxSpeed);
  }

  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  if (spaceBar.isDown) {
    if (canJump) {
      this.player.setVelocityY(-30); // Adjust the desired jump velocity
      canJump = false;
      justJumped = true;
    }

    if (doubleJump) {
      this.player.setVelocityY(-30); // Adjust the desired jump velocity
      doubleJump = false;
      justJumped = false;
    }
  }

  if (!spaceBar.isDown && justJumped) {
    doubleJump = true;
  }

  this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    canJump = true;
    justJumped = false;
    doubleJump = false;
  });

  // emit player movement
  const x = this.player.x;
  const y = this.player.y;
  const r = this.player.rotation;
  if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || r !== this.player.oldPosition.rotation)) {
    this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
  }
  // save old position data
  this.player.oldPosition = {
    x: this.player.x,
    y: this.player.y,
    rotation: this.player.rotation
  };

    
}
  //KEEP IN CASE WE ADD COLLECTABLE ITEMS
  // this.socket.on('starLocation', function(starLocation) {
  //   if (self.star) self.star.destroy();
  //   self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
  //   self.physics.add.overlap(self.player, self.star, function() {
  //     this.socket.emit('starCollected');
  //   }, null, self);
  // });

function addPlayer(self, playerInfo) {
  console.log('playerInfo: ', playerInfo)
  self.player = self.matter.add.image(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
}

function addOtherPlayers(self, playerInfo) {
  console.log('OtherplayerInfo: ', playerInfo)
  const otherPlayer = self.add.image(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setDisplaySize(100, 80);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}



