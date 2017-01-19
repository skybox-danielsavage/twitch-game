var PlayerKeyInputCodes = [
  {
    right: Phaser.KeyCode.RIGHT,
    left: Phaser.KeyCode.LEFT,
    jump: Phaser.KeyCode.UP,
  },
  {
    right: Phaser.KeyCode.D,
    left: Phaser.KeyCode.A,
    jump: Phaser.KeyCode.W,
  }
];

var Player = function (game, index, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 5 + index);
  this.index = index;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);

  this.walkSpeed = 100;

  this.game.add.existing(this);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {
  var rightKeyDown = this.game.input.keyboard.isDown(PlayerKeyInputCodes[this.index].right);
  var leftKeyDown = this.game.input.keyboard.isDown(PlayerKeyInputCodes[this.index].left);
  var jumpKeyDown = this.game.input.keyboard.isDown(PlayerKeyInputCodes[this.index].jump);

  if (rightKeyDown) {
    this.body.velocity.x = this.walkSpeed;
  } else if (leftKeyDown) {
    this.body.velocity.x = this.walkSpeed * -1;
  } else {
    this.body.velocity.x = 0;
  }

  if (jumpKeyDown && this.body.onFloor()) {
    this.body.velocity.y = -200;
  }
};

var Gameplay = function () {
  this.player = null;
  this.player2 = null;
};
Gameplay.prototype.init = function() {
  //
};
Gameplay.prototype.preload = function() {
  //
};
Gameplay.prototype.create = function() {
  // closure context
  var that = this;

  // add key captures
  this.game.input.keyboard.addKeyCapture(Phaser.KeyCode.RIGHT);
  this.game.input.keyboard.addKeyCapture(Phaser.KeyCode.LEFT);
  this.game.input.keyboard.addKeyCapture(Phaser.KeyCode.DOWN);
  this.game.input.keyboard.addKeyCapture(Phaser.KeyCode.UP);

  // set gravity
  this.game.physics.arcade.gravity.y = 500;

  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('sheet', 'test16x16_tile');
  this.background = this.map.createLayer('Background');
  this.foreground = this.map.createLayer('Foreground');
  this.map.setCollisionByExclusion([0], true, this.foreground);

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.player = new Player(this.game, 0, 100, 10);
  this.player2 = new Player(this.game, 1, 50, 10);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.foreground, this.player);
  this.game.physics.arcade.collide(this.foreground, this.player2);
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.player2 = null;
};