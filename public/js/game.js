const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1600,
  height: 1150,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 100 }
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
  this.load.image('player', 'assets/sprites/player_placeholder.png');
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

  // Background image 
  const backgroundImage = this.add.image(0, 0, 'stage_one').setOrigin(0)

  // Adjust the scale of the image to fit the screen
  const screenWidth = this.cameras.main.width;
  const screenHeight = this.cameras.main.height;
  const scaleRatio = Math.max(screenWidth / backgroundImage.width, screenHeight / backgroundImage.height);
  backgroundImage.setScale(scaleRatio);

  // Center the image on the screen
  backgroundImage.setPosition(0, 0);

  //
  // Platforms
  //

  // TESTING Log mouse position on click 
  this.input.on('pointerdown', function(pointer) {
    console.log('Mouse Position:', pointer.x, pointer.y);
  });

  // Create groups for different platform types
  this.platformsGround = this.physics.add.staticGroup();
  this.platformsRoof1 = this.physics.add.staticGroup();
  this.platformsRoof2 = this.physics.add.staticGroup();

  // Create individual platforms and add them to their respective groups
  // Note: (x,y coordinates drop asset from CENTER of asset)
  const platformGround1 = this.platformsGround.create(250, 948, 'stage_one_platform_ground');
  platformGround1.setScale(0.6); // Shrink the platform by a scale 
  // platformGround1.refreshBody(); // Refresh the body to apply changes
  
  const platformGround2 = this.platformsGround.create(750, 948, 'stage_one_platform_ground');
  platformGround2.setScale(0.6); // Shrink the platform by a scale 

  const platformGround3 = this.platformsGround.create(1150, 1048, 'stage_one_platform_ground');
  platformGround3.setScale(0.6); // Shrink the platform by a scale

  const platformGround4 = this.platformsGround.create(1650, 1048, 'stage_one_platform_ground');
  platformGround4.setScale(0.6); // Shrink the platform by a scale 


  const platformRoof1 = this.platformsRoof1.create(1376, 565, 'stage_one_platform_roof-1-pink');
  platformRoof1.setScale(0.6); // Shrink the platform by a scale 
  // Adjust the values of x and y to position the platform

  const platformRoof2 = this.platformsRoof2.create(356, 561, 'stage_one_platform_roof-2-orange');
  platformRoof2.setScale(0.6); // Shrink the platform by a scale
  // Adjust the values of x and y to position the platform

  // Create a sprite for the bottom platform
  const bottomPlatform = this.physics.add.sprite(game.config.width / 2, game.config.height, 'platform');

  // Set origin to center bottom
  bottomPlatform.setOrigin(0, 0);

  // Enable physics for the platform
  this.physics.world.enable(bottomPlatform);

  // Make the platform immovable
  bottomPlatform.body.setImmovable(true);

  this.player = this.physics.add.sprite(350, 500, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  this.physics.add.collider(this.player, bottomPlatform);

  // Player Physics
  // Add physics properties to player
  this.player.setCollideWorldBounds(true);

  // Jump velocity
  this.jumpVelocity = -600;

  // Enable collision between the player and different platform groups
  this.physics.add.collider(this.player, this.platformsGround, null, null, true);
  this.physics.add.collider(this.player, this.platformsRoof1, null, null, true);
  this.physics.add.collider(this.player, this.platformsRoof2, null, null, true);
  
  this.otherPlayers = this.physics.add.group();

  // // Players joining
  // this.socket.on('currentPlayers', function(players) {
  //   Object.keys(players).forEach(function(id) {
  //     if (players[id].playerId === self.socket.id) {
  //       addPlayer(self, players[id]);
  //     } else {
  //       addOtherPlayers(self, players[id]);
  //     }
  //   });
  // });

  this.socket.on('newPlayer', function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();

  this.socket.on('playerMoved', function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });


  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  this.socket.on('scoreUpdate', function(scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('starLocation', function(starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(self.player, self.star, function() {
      this.socket.emit('starCollected');
    }, null, self);
  });

  
}

function update() {
  if (this.player) {
    const { width, height } = this.sys.game.config;
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;

    // Update player's velocity based on input
    let velocityX = 0;
    if (this.cursors.left.isDown /*|| this.cursors.a.isDown*/) {
      velocityX = -150;
    } else if (this.cursors.right.isDown /*|| this.cursors.d.isDown*/) {
      velocityX = 150;
    }
    this.player.setVelocityX(velocityX);

    if (this.cursors.up.isDown /*|| this.cursors.w.isDown*/) {
      this.physics.velocityFromRotation(this.player.rotation + 1.5, 100, this.player.body.acceleration);
    } else {
      this.player.setAcceleration(0);
    }
    
    // Check for jump key press
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.player.setVelocityY(this.jumpVelocity);
    }

    // // Update ships's velocity based on input
    // if (this.cursors.left.isDown) {
    //   this.player.setAngularVelocity(-150);
    // } else if (this.cursors.right.isDown) {
    //   this.player.setAngularVelocity(150);
    // } else {
    //   this.player.setAngularVelocity(0);
    // }

    // if (this.cursors.up.isDown) {
    //   this.physics.velocityFromRotation(this.player.rotation + 1.5, 100, this.player.body.acceleration);
    // } else {
    //   this.player.setAcceleration(0);
    // }


    // Wrap horizontally
    if (this.player.x < -halfWidth) {
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

      this.player.x = width + halfWidth;
    } else if (this.player.x > width + halfWidth) {
      this.player.x = -halfWidth;
    }

    // // Wrap vertically
    // if (this.player.y < -halfHeight) {
    //   this.player.y = height + halfHeight;
    // } else if (this.player.y > height + halfHeight) {
    //   this.player.y = -halfHeight;
    // }
  }
  // this.physics.world.wrap(this.player, 5);
  //https://labs.phaser.io/view.html?src=src/physics/arcade/wrap%20sprite.js
}

// function addPlayer(self, playerInfo) {
//   self.player = self.physics.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);//53px by 40px
//   if (playerInfo.team === 'blue') {
//     self.player.setTint(0x0000ff);
//   } else {
//     self.player.setTint(0xff0000);
//   }
//   self.player.setDrag(100);
//   self.player.setAngularDrag(100);
//   self.player.setMaxVelocity(200);
// }

// function addOtherPlayers(self, playerInfo) {
//   const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
//   if (playerInfo.team === 'blue') {
//     otherPlayer.setTint(0x0000ff);
//   } else {
//     otherPlayer.setTint(0xff0000);
//   }
//   otherPlayer.playerId = playerInfo.playerId;
//   self.otherPlayers.add(otherPlayer);
// }

