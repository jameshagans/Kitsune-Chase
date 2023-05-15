// export default function create() {
//   // Create a sprite for the bottom platform 
//   bottomPlatform = this.physics.add.sprite(game.config.width / 2, game.config.height, 'platform')

//   // Set origin to center bottom
//   bottomPlatform.setOrigin(0.5, 1); 

//   // Enable physics for the platform
//   this.physics.world.enable(bottomPlatform); 

//   // Make the platform immovable
//   bottomPlatform.body.setImmovable(true); 

//   // Add collision between plater and platform
//   this.physics.add.collider(player, bottomPlatform)
// }