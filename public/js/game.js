const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  title: 'Kitsune-Chase',
  width: 1600,
  height: 1200,
  title: "Kitsune-chase",
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
let isReloaded = false;
let connectedPlayers = 0;
const playerAPosition = [];
const playerBPosition = [];

function preload() {
  // this.load.image('player', 'assets/sprites/player_placeholder.png');
  this.load.spritesheet('fox', '../assets/sprites/fox.png', { frameWidth: 32, frameHeight: 32 });
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('other', 'assets/enemyBlack5.png');
  this.load.image('stage_one', 'assets/tiles/foxgate-city-day.png');
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
  let taggerPlayer = null; 
  const self = this;
  this.socket = io();
  this.otherPlayers = this.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();


  // Create jQuery Start Page
  $(() => {
    $(".start").on("mouseenter", () => {
      $(".start").css({"font-size": "6rem"});
    });
  
    $(".start").on("mouseleave", () => {
      $(".start").css({"font-size": "5rem"});
    });
  
    $(".start").on("click", () => {
      $(".startPage").css({"display": "none"});
    });

  }); 


  
    

  // Players joining crete players
  
  this.socket.on('currentPlayers', function(players) {
    
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  // Test
  setTimeout(() => {
    console.log('this.player', this.player);  
  }, 1000); 


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
  
    //reset player positions
    self.player.setPosition(playerAPosition[0], playerAPosition[1]);
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      otherPlayer.setPosition(playerBPosition[0], playerBPosition[1]);
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

  // Background image better scaling

  // Add the background image to the scene
  // backgroundImage = this.add.image(0, 0, 'stage_one').setOrigin(0);

  // // Make the background image interactive for handling resize events
  // backgroundImage.setInteractive();

  // Resize the image initially to fit the screen
  // resizeBackgroundImage.call(this);

  // Listen for window resize events and update the image scale accordingly
  // window.addEventListener('resize', resizeBackgroundImage.bind(this));

  // function resizeBackgroundImage() {
  //   const screenWidth = window.innerWidth;
  //   const screenHeight = window.innerHeight;
  
  //   // Adjust the scale of the image to fit the screen
  //   const scaleRatio = Math.max(screenWidth / backgroundImage.width, screenHeight / backgroundImage.height);
  //   backgroundImage.setScale(scaleRatio);
  
  //   // Center the image on the screen
  //   backgroundImage.setPosition(0, 0);
  // }



  // Animations
  this.anims.create({
    key: "idle",
    frameRate: 8,
    frames: this.anims.generateFrameNumbers("fox", {
      start: 0,
      end: 4
    }),
    repeat: -1
  });

  this.anims.create({
    key: "run",
    frameRate: 16,
    frames: this.anims.generateFrameNumbers("fox", {
      start: 28,
      end: 35
    }),
    repeat: -1
  });

  this.anims.create({

    key:"jump",
    frameRate: 8,
    frames: this.anims.generateFrameNumbers("fox", {
      start: 44,
      end: 52
    }),
  });

  this.anims.create({
    key: "fall",

  });


  // this.timerSeconds = 10; // 2 minutes in seconds
  this.timerText = this.add.text(300, 16, '', { fontSize: '32px', fill: '#000' });

  // this.timer = setInterval(() => {
  //   this.timerSeconds--;

  //   this.timerText.setText('Time: ' + this.timerSeconds);


  //   if (this.timerSeconds <= 0) {
  //     this.socket.emit('escaped');
  //     //handleGameOver();
  //     clearInterval(this.timer); // Stop the timer
  //     location.reload()
  //   }
  // }, 1000); // Update the timer every second (1000 milliseconds)


  //   if (this.timerSeconds <= 0) {
  //     $(() => {
  //       $(".gameOverPage").css({"display" : "block"});
  //     })

  //     alert('Game Over!!');
  //     //handleGameOver();
  //     clearInterval(this.timer); // Stop the timer
  //   }
  // }, 1000); // Update the timer every second (1000 milliseconds)



  // //Game Timer (Moved to server)
  // this.timerSeconds = 120; // 2 minutes in seconds
  // this.timerText = this.add.text(300, 16, '', { fontSize: '32px', fill: '#000' });

  // this.timer = setInterval(() => {
  //   this.timerSeconds--;

  //   this.timerText.setText('Time: ' + this.timerSeconds);


  

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  this.socket.on('scoreUpdate', function(scores) {
    self.blueScoreText.setText('P1 Chaser: ' + scores.p1);
    self.redScoreText.setText('P2 Escapee: ' + scores.p2);
    console.log('scores: ', scores);
  });

  //this.player = this.matter.add.sprite(2000, 2000, 'star').setScale(4);
  


  const platformGround1 = this.matter.add.image(300, 1048, 'stage_one_platform_ground');
  platformGround1.setStatic(true);
  platformGround1.setScale(0.6); // Shrink the platform by a scale 

  const platformGround2 = this.matter.add.image(768, 1048, 'stage_one_platform_ground');
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

  this.matter.world.on('collisionstart', function(event, bodyA, bodyB) {
    canJump = true;
    justJumped = false;
    doubleJump = false;

  });
 
}


function update() {

  this.socket.on('twoPLayers', () => {

  });

  setTimeout(() => {
    this.player.body.isSensor = false;
    this.player.body.restitution = 0;
    this.player.body.airFriction = 0.2;
    this.player.body.friction = 0.15;
    const maxSpeed = 12;
    let acceleration = 1.5;
  
    if (this.cursors.left.isDown) {
      if (this.player.body.velocity.y === 0) {
        this.player.play("run", true);
      }
      this.player.setVelocityX(this.player.body.velocity.x - acceleration);
      this.player.setFlipX(true); // Flip the sprite horizontally
    }
    // Check for right arrow key press
    else if (this.cursors.right.isDown) {
      if (this.player.body.velocity.y === 0) {
        this.player.play("run", true);
      }
      this.player.setVelocityX(this.player.body.velocity.x + acceleration);
      this.player.setFlipX(false); // Reset the sprite's flip
    }
    else if (this.cursors.left.isUp && this.cursors.right.isUp) {
      if (this.player.body.velocity.y === 0) {
        this.player.play("idle", true);
      }
    }


    if (this.player.body.velocity.x > maxSpeed) {
      this.player.setVelocityX(maxSpeed);
    } else if (this.player.body.velocity.x < -maxSpeed) {
      this.player.setVelocityX(-maxSpeed);
    }

    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    if (spaceBar.isDown) {
      if (canJump) {
        this.player.play("jump");
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

  }, 2000);

  this.socket.on('timeUpdate', (timer) => {
    this.timerText.setText('Time: ' + timer);
  });
  this.socket.on('gameOver', () => {
    this.timerText.visible = false;

  });

  // Tagger swap on win
  this.socket.on('playersOverlap', function() {
    // if(this.players.team)
    if (this.taggerPlayer) {
      console.log('Tagger exists')
      // Assign 
    }
  }); 

} // end of update function 




//KEEP IN CASE WE ADD COLLECTABLE ITEMS
// this.socket.on('starLocation', function(starLocation) {
//   if (self.star) self.star.destroy();
//   self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
//   self.physics.add.overlap(self.player, self.star, function() {
//     this.socket.emit('starCollected');
//   }, null, self);
// });

function addPlayer(self, playerInfo) {
  connectedPlayers += 1;
  self.player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setScale(4);
  playerAPosition.push(playerInfo.x, playerInfo.y)
  connectedPlayers++;
  // console.log("SELF PLAYER", self.player)
}

function addOtherPlayers(self, playerInfo) {
  connectedPlayers += 1;
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setDisplaySize(100, 80);
  playerBPosition.push(playerInfo.x, playerInfo.y)
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
  connectedPlayers++;
  // console.log('OTTERPLAYER: ', otherPlayer)
}

function reloadScreen() {
  location.reload()
  return
}



