const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1000,
  height: 800,
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

const { Pairs } = Matter; 


const game = new Phaser.Game(config);
let canJump = true;
let justJumped = false;
let inAir = false;
let doubleJump = false;

function preload() {
  // Load fox atlas 
  this.load.atlas('fox', '../assets/sprites/fox.png', '../assets/sprites/fox.json');

  // Load png of tileset, assign key, define path 
  this.load.image('base_tiles', 'assets/tiles/tileset-pink.png')

  // Load png of background 
  this.load.image('background', 'assets/tiles/background.png')
  this.load.image('stage_one_platform_ground', 'assets/tiles/foxgate-city-day-platform.PNG');
  this.load.image('stage_one_platform_roof-1-pink', 'assets/tiles/foxgate-city-day-platform-roof-1-pink.PNG');
  this.load.image('stage_one_platform_roof-2-orange', 'assets/tiles/foxgate-city-day-platform-roof-2-orange.PNG');

  // this.load.tilemapTiledJSON('tilemap', 'assets/tiles/tileset-pink.json')

  // Load exported json of tilemap
  // this.load.tilemapTiledJSON('tilemap', 'assets/tiles/tilemap-pink.json')

  // Load exported json tilemap
  // this.load.tilemapTiledJSON('map', 'assets/tiles/tilemap-pink.json')


}


function create() {
  
  //const player = this.physics.add.sprite(350, 0, 'player'); 
  const self = this;
  this.socket = io();
  this.otherPlayers = this.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();
  
  // Define movement variables
  this.moveInput = 0;
  this.moveSpeed = 1600;
  this.acceleration = 1000;
  this.deceleration = 500;
  this.canJump = true;
  
  // Background image 
  const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0);

  // Adjust the scale of the image to fit the screen
  const screenWidth = this.cameras.main.width;
  const screenHeight = this.cameras.main.height;
  const scaleRatio = Math.max(screenWidth / backgroundImage.width, screenHeight / backgroundImage.height);
  backgroundImage.setScale(scaleRatio);

  // Center the image on the screen
  backgroundImage.setPosition(0, 0);

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

  // Event listener for playersOverlap event
  this.socket.on('playersOverlap', function() {
  // Perform game reset logic here
    console.log('Players are overlapping! Resetting the game...');
    // Reset the game by reloading the page or showing a reset screen
    // You can use appropriate game reset logic based on your game requirements
    location.reload(); // Reload the page as an example
  });
  
  // jQuery Start Page
  $(() => {
    $(".start").on("mouseenter", () => {
      $(".start").css({"font-size": "9vw"});
    });
  
    $(".start").on("mouseleave", () => {
      $(".start").css({"font-size": "8vw"});
    });
  
    $(".start").on("click", () => {
      $(".startPage").css({"display": "none"});
    });
  }); 
    
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

  //this.player = this.matter.add.sprite(2000, 2000, 'star').setScale(4);
  


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

  this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    canJump = true;
    justJumped = false;
    doubleJump = false;

  });
 
}




function update() {

  setTimeout(() => {
  
  
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
  
   }, 2000)
 
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
  self.player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  // console.log("SELF PLAYER", self.player)
}

function addOtherPlayers(self, playerInfo) {
  // self.matter.add.sprite will add collision to other player
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setDisplaySize(100, 80);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
  // console.log('OTTERPLAYER: ', otherPlayer)
}



