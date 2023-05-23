const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  title: 'Kitsune-Chase',
  width: 1600,
  height: 905,
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
  this.load.spritesheet('fox', '../assets/sprites/fox-V2.png', { frameWidth: 24, frameHeight: 18 });
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.image('other', 'assets/enemyBlack5.png');
  // this.load.image('stage_one', 'assets/tiles/foxgate-city-day.png');
  this.load.image('stage_one_platform_ground', 'assets/tiles/foxgate-city-day-platform.PNG');
  this.load.image('stage_one_platform_roof-1-pink', 'assets/tiles/foxgate-city-day-platform-roof-1-pink.PNG');
  this.load.image('stage_one_platform_roof-2-orange', 'assets/tiles/foxgate-city-day-platform-roof-2-orange.PNG');
  this.load.audio('jump', '../assets/sounds/jump-3.wav');
  this.load.audio('music', '../assets/sounds/music.mp3');
  this.load.audio('walk', '../assets/sounds/run-sound-1.wav');
  this.load.audio('start', '../assets/sounds/start.mp3');
  this.load.audio('end', '../assets/sounds/tag-sound-2.wav');
  this.load.audio('start', '../assets/sounds/tag-sound-1.wav');
  this.load.image('stage_one', 'assets/tiles/big-map.png');
}


function create() {
  const self = this;
  this.socket = io();
  this.otherPlayers = this.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();
  this.startSound = this.sound.add('start');

  // Players joining create players
  this.socket.on('currentPlayers', function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
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

      // Play tag sound (NOT WORKING)
      // this.tagSound.play();
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
      start: 16,
      end: 23
    }),
    repeat: -1
  });

  this.anims.create({
    key:"jump",
    frameRate: 8,
    frames: this.anims.generateFrameNumbers("fox", {
      start: 8,
      end: 15
    }),
  });


  this.jumpSound = this.sound.add('jump');
  this.bgMusic = this.sound.add('music');
  this.walkSound = this.sound.add('walk');
  this.bgMusic.play({volume: 0.05, loop: true});
  this.startSound = this.sound.add('start');
  // game timer display
  this.timerText = this.add.text(1100, 48, '', { fontSize: '42px', fill: '#fa399a',  fontFamily: 'PressStart2P' });

  
  this.socket.on('gameOver', () => {
    $(".gameOverPage").css({"display" : "block"});
    $(".gameOverText").html("P2 wins!");
  })

  $(() => {
    $(".start").on("mouseenter", () => {
      $(".start").css({"font-size": "6vw"});
    });
  
    $(".start").on("mouseleave", () => {
      $(".start").css({"font-size": "5vw"});
    });
  
    $(".start").on("click", () => {
      this.startSound.play({volume: 0.5});
      $(".startPage").css({"display": "none"});
    });

    $(".restart").on("click", () => {
      $(".gameOverPage").css({"display": "none"});
      this.startSound.play({volume: 0.5});
    });

    $(".restart").on("mouseenter", () => {
      $(".restart").css({"font-size": "4vw"});
    });

    $(".restart").on("mouseleave", () => {
      $(".restart").css({"font-size": "3vw"});
    });

  }); 
    

  this.blueScoreText = this.add.text(200, 48, '', { fontSize: '42px', fill: '#fa399a', fontFamily: 'PressStart2P' });
 // this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  this.socket.on('scoreUpdate', function(scores) {
    self.blueScoreText.setText('Tag count: ' + Math.ceil(scores.p1));
   //self.redScoreText.setText('P2 Escapee: ' + scores.p2);
    console.log('scores: ', scores);

    if (scores.p1 >= 3) {
      $(() => {
        $(".gameOverPage").css({"display" : "block"});
        $(".gameOverText").html("P1 wins!");
      })
    }
  });
  

  // Platforms

  // Right 1 // Adjust the values of x and y to position the platform
  const platformRoof_R1 = this.matter.add.image(1329, 483, 'stage_one_platform_roof-1-pink');
  platformRoof_R1.setStatic(true);
  platformRoof_R1.setScale(0.3); // Shrink the platform by a scale 

  // Right 2 
  const platformRoof_R2 = this.matter.add.image(1090, 687, 'stage_one_platform_roof-1-pink');
  platformRoof_R2.setStatic(true);
  platformRoof_R2.setScale(0.3); // Shrink the platform by a scale 
 
  // Left 1
  const platformRoof_L1 = this.matter.add.image(380, 525, 'stage_one_platform_roof-2-orange');
  platformRoof_L1.setStatic(true);
  platformRoof_L1.setScale(0.3); // Shrink the platform by a scale

  // Left 2
  const platformRoof_L2 = this.matter.add.image(380, 300, 'stage_one_platform_roof-2-orange');
  platformRoof_L2.setStatic(true);
  platformRoof_L2.setScale(0.3); // Shrink the platform by a scale

  // Left 3
  const platformRoof_L3 = this.matter.add.image(50, 450, 'stage_one_platform_roof-2-orange');
  platformRoof_L3.setStatic(true);
  platformRoof_L3.setScale(0.3); // Shrink the platform by a scale

  // LEft 4
  const platformRoof_L4 = this.matter.add.image(142, 787, 'stage_one_platform_roof-1-pink');
  platformRoof_L4.setStatic(true);
  platformRoof_L4.setScale(0.3); // Shrink the platform by a scale 
  
  // Center 1
  const platformRoof_C1 = this.matter.add.image(906, 261, 'stage_one_platform_roof-2-orange');
  platformRoof_C1.setStatic(true);
  platformRoof_C1.setScale(0.3); // Shrink the platform by a scale

  // Center 2
  const platformRoof_C2 = this.matter.add.image(1005, 261, 'stage_one_platform_roof-2-orange');
  platformRoof_C2.setStatic(true);
  platformRoof_C2.setScale(0.3); // Shrink the platform by a scale
  
  // Add click event listener to the document for ease of finding platform placement
  document.addEventListener('click', function(event) {
  // Get the coordinates of the mouse pointer relative to the document
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  
  // Log the coordinates to the console
  console.log('Mouse coordinates:', mouseX, mouseY);

});

  this.matter.world.on('collisionstart', function(event, bodyA, bodyB) {
    canJump = true;
    justJumped = false;
    doubleJump = false;

  }); 
}


function update() {

  setTimeout(() => {
    this.player.body.isSensor = false;
    this.player.body.restitution = 0;
    this.player.body.airFriction = 0.2;
    this.player.body.friction = 0.15;
    const maxSpeed = 12;
    let acceleration = 1.5;

    this.player.setFixedRotation(true);
  
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
        this.jumpSound.play();
        this.player.play("jump");
        this.player.setVelocityY(-30); // Adjust the desired jump velocity
        canJump = false;
        justJumped = true;
        
      }

      if (doubleJump) {
        this.jumpSound.play();
        this.player.anims.restart();
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

  }, 500);

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











function addPlayer(self, playerInfo) {
  connectedPlayers += 1;
  self.player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setScale(3);
  playerAPosition.push(playerInfo.x, playerInfo.y)
  connectedPlayers++;
  // console.log("SELF PLAYER", self.player)
}

function addOtherPlayers(self, playerInfo) {
  connectedPlayers += 1;
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'fox').setOrigin(0.5, 0.5).setScale(3);
  playerBPosition.push(playerInfo.x, playerInfo.y)
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
  connectedPlayers++;
  // console.log('OTTERPLAYER: ', otherPlayer)
}
