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
function preload() {
  // this.load.image('player', 'assets/sprites/player_placeholder.png');
  this.load.atlas('fox', '../assets/sprites/fox.png', '../assets/sprites/fox.json')
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('stage_one', 'assets/tiles/foxgate-city-day.png')
  this.load.image('stage_one_platform_ground', 'assets/tiles/foxgate-city-day-platform.PNG' )
  this.load.image('stage_one_platform_roof-1-pink', 'assets/tiles/foxgate-city-day-platform-roof-1-pink.PNG' )
  this.load.image('stage_one_platform_roof-2-orange', 'assets/tiles/foxgate-city-day-platform-roof-2-orange.PNG' )
}

function create() {
  const self = this;
  this.socket = io();
  this.cursors = this.input.keyboard.createCursorKeys();

  // Background image 
  const backgroundImage = this.add.image(0, 0, 'stage_one').setOrigin(0)

  // Adjust the scale of the image to fit the screen
  const screenWidth = this.cameras.main.width;
  const screenHeight = this.cameras.main.height;
  const scaleRatio = Math.max(screenWidth / backgroundImage.width, screenHeight / backgroundImage.height);
  backgroundImage.setScale(scaleRatio);

  // Center the image on the screen
  backgroundImage.setPosition(0, 0);

  // Define movement variables
  this.moveInput = 0;
  this.moveSpeed = 1600;
  this.acceleration = 1000;
  this.deceleration = 500

//   //
//   // Platforms
//   //

  // TESTING Log mouse position on click 
  this.input.on('pointerdown', function(pointer) {
    console.log('Mouse Position:', pointer.x, pointer.y);
  });

  this.player = this.matter.add.sprite(200, 200, 'fox').setScale(4);

  const platformGround1 = this.matter.add.image(300, 948, 'stage_one_platform_ground');
  platformGround1.setStatic(true);
  platformGround1.setScale(0.6); // Shrink the platform by a scale 
//   // platformGround1.refreshBody(); // Refresh the body to apply changes
  
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

  // Create a sprite for the bottom platform
  const bottomPlatform = this.matter.add.sprite(game.config.width / 2, game.config.height, 'platform');

  // Set origin to center bottom
  bottomPlatform.setOrigin(0, 0);
  bottomPlatform.setStatic(true);
//   // Enable physics for the platform
//   this.physics.world.enable(bottomPlatform);

//   // Make the platform immovable
//   bottomPlatform.body.setImmovable(true);

  // this.player = this.add.sprite(350, 500, 'fox');
  // this.physics.add.collider(this.player, bottomPlatform);

//   // Player Physics
//   // Add physics properties to player
//   this.player.setCollideWorldBounds(true);

//   // Jump velocity
//   this.jumpVelocity = -600;

//   // Enable collision between the player and different platform groups
//   this.physics.add.collider(this.player, this.platformsGround, null, null, true);
//   this.physics.add.collider(this.player, this.platformsRoof1, null, null, true);
//   this.physics.add.collider(this.player, this.platformsRoof2, null, null, true);
  
//   this.otherPlayers = this.physics.add.group();

//   // // Players joining
//   // this.socket.on('currentPlayers', function(players) {
//   //   Object.keys(players).forEach(function(id) {
//   //     if (players[id].playerId === self.socket.id) {
//   //       addPlayer(self, players[id]);
//   //     } else {
//   //       addOtherPlayers(self, players[id]);
//   //     }
//   //   });
//   // });

//   this.socket.on('newPlayer', function(playerInfo) {
//     addOtherPlayers(self, playerInfo);
//   });
//   this.socket.on('disconnect', function(playerId) {
//     self.otherPlayers.getChildren().forEach(function(otherPlayer) {
//       if (playerId === otherPlayer.playerId) {
//         otherPlayer.destroy();
//       }
//     });
//   });

  

//   this.socket.on('playerMoved', function(playerInfo) {
//     self.otherPlayers.getChildren().forEach(function(otherPlayer) {
//       if (playerInfo.playerId === otherPlayer.playerId) {
//         otherPlayer.setRotation(playerInfo.rotation);
//         otherPlayer.setPosition(playerInfo.x, playerInfo.y);
//       }
//     });
//   });


//   this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
//   this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

//   this.socket.on('scoreUpdate', function(scores) {
//     self.blueScoreText.setText('Blue: ' + scores.blue);
//     self.redScoreText.setText('Red: ' + scores.red);
//   });

//   this.socket.on('starLocation', function(starLocation) {
//     if (self.star) self.star.destroy();
//     self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
//     self.physics.add.overlap(self.player, self.star, function() {
//       this.socket.emit('starCollected');
//     }, null, self);
//   });
}

function update() {
//   if (this.player) {
//     const { width, height } = this.sys.game.config;
//     const halfWidth = this.player.width / 2;
//     // const halfHeight = this.player.height / 2;

//     //
//     // Player movement
//     //

//     // Run
//     //
//     let targetSpeed = this.moveInput * this.moveSpeed;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-10)
      // this.player.setFlipX(true); // Flip the sprite horizontally
    }
    // Check for right arrow key press
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(10)
      // this.player.setFlipX(false); // Reset the sprite's flip
    }

//     // Apply acceleration and deceleration
//     if (targetSpeed !== 0) {
//       // Apply acceleration towards the target speed
//       this.player.setAccelerationX(targetSpeed > this.player.body.velocity.x ? this.acceleration : -this.acceleration);
//     } else {
//       // Apply deceleration to gradually stop
//       this.player.setAccelerationX(this.player.body.velocity.x > 0 ? -this.deceleration : this.deceleration);
//     }

//     // Limit maximum velocity
//     if (Math.abs(this.player.body.velocity.x) > this.moveSpeed) {
//       this.player.setVelocityX(this.moveSpeed * Math.sign(this.player.body.velocity.x));
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);    
    if (spaceBar.isDown) {
      this.player.setVelocityY(-25);
    }
  }

//     // Wrap horizontally
//     if (this.player.x < -halfWidth) {
//       // emit player movement
//       const x = this.player.x;
//       const y = this.player.y;
//       const r = this.player.rotation;
//       if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || r !== this.player.oldPosition.rotation)) {
//         this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
//       }
//       // save old position data
//       this.player.oldPosition = {
//         x: this.player.x,
//         y: this.player.y,
//         rotation: this.player.rotation
//       };

//       this.player.x = width + halfWidth;
//     } else if (this.player.x > width + halfWidth) {
//       this.player.x = -halfWidth;
//     }

//     // // Wrap vertically
//     // if (this.player.y < -halfHeight) {
//     //   this.player.y = height + halfHeight;
//     // } else if (this.player.y > height + halfHeight) {
//     //   this.player.y = -halfHeight;
//     // }
//   }
//   // this.physics.world.wrap(this.player, 5);
//   //https://labs.phaser.io/view.html?src=src/physics/arcade/wrap%20sprite.js
// }

// // function addPlayer(self, playerInfo) {
// //   self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);//53px by 40px
// //   if (playerInfo.team === 'blue') {
// //     self.player.setTint(0x0000ff);
// //   } else {
// //     self.player.setTint(0xff0000);
// //   }
// //   self.player.setDrag(100);
// //   self.player.setAngularDrag(100);
// //   self.player.setMaxVelocity(200);
// // }

// // function addOtherPlayers(self, playerInfo) {
// //   const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
// //   if (playerInfo.team === 'blue') {
// //     otherPlayer.setTint(0x0000ff);
// //   } else {
// //     otherPlayer.setTint(0xff0000);
// //   }
// //   otherPlayer.playerId = playerInfo.playerId;
// //   self.otherPlayers.add(otherPlayer);
// // }

