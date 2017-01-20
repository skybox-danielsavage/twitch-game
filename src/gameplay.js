var PlayerKeyInputCodes = [
  {
    right: Phaser.KeyCode.RIGHT,
    left: Phaser.KeyCode.LEFT,
    jump: Phaser.KeyCode.UP,
    throw: Phaser.KeyCode.DOWN
  },
  {
    right: Phaser.KeyCode.D,
    left: Phaser.KeyCode.A,
    jump: Phaser.KeyCode.W,
    throw: Phaser.KeyCode.S
  }
];

var ThrowObject = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 2);

  this.game.physics.enable(this, Phaser.Physics.ARCADE);

  this.body.drag.x = 1;
  this.body.friction = 1;

  this.game.add.existing(this);
};
ThrowObject.prototype = Object.create(Phaser.Sprite.prototype);
ThrowObject.prototype.constructor = ThrowObject;
ThrowObject.prototype.update = function () {
  if (this.body.onFloor()) {
    this.body.velocity.x = 0;
  }
};

var Player = function (game, index, x, y, throwObjects) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 5 + index);
  this.index = index;
  this.throwObjects = throwObjects;
  this.carrying = null;
  this.facingRight = true;

  this.wasThrowKeyDown = false;

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
  var throwKeyDown = this.game.input.keyboard.isDown(PlayerKeyInputCodes[this.index].throw);

  if (rightKeyDown) {
    this.body.velocity.x = this.walkSpeed;
    this.facingRight = true;
  } else if (leftKeyDown) {
    this.body.velocity.x = this.walkSpeed * -1;
    this.facingRight = false;
  } else {
    this.body.velocity.x = 0;
  }

  if (jumpKeyDown && this.body.onFloor()) {
    this.body.velocity.y = -200;
  }

  if (throwKeyDown && this.wasThrowKeyDown === false) {
    if (this.carrying === null) {
      for (var i = 0; i < this.throwObjects.children.length; i++) {
        var to = this.throwObjects.children[i];

        if (this.position.distance(to) < this.width / 2 && to.body.onFloor()) {
          //to.body.velocity.y = -200;
          this.carrying = to;
          to.body.allowGravity = false;
          to.immovable = true;
          this.addChild(to);
          to.x = 0;
          to.y = -16;
          break;
        }
      }
    } else {
      this.throwObjects.addChild(this.carrying);
      this.carrying.body.allowGravity = true;
      this.carrying.body.immovable = false;
      this.carrying.body.velocity.set(this.facingRight ? 100 : -100, -200);
      this.carrying.x = this.x;
      this.carrying.y = this.y - 16;
      this.carrying = null;
    }

    this.wasThrowKeyDown = true;
  } else if (throwKeyDown === false && this.wasThrowKeyDown === true) {
    this.wasThrowKeyDown = false;
  }
};

var Gameplay = function () {
  this.player = null;
  this.player2 = null;
  this.players = [];

  this.throwObjects = null;
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
  this.foreground.resizeWorld();
  this.map.setCollisionByExclusion([0], true, this.foreground);

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.throwObjects = this.game.add.group();

  this.player = new Player(this.game, 0, 100, 10, this.throwObjects);
  this.player2 = new Player(this.game, 1, 50, 10, this.throwObjects);
  this.players = [this.player, this.player2];

  for (var i = 0; i < 5; i++) {
    var to = new ThrowObject(this.game, 25 + 50 * i, 25);
    this.throwObjects.addChild(to);
    this.throwObjects.addToHash(to);
  }

  this.game.camera.follow(this.players[0]);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.foreground, this.players);
  this.game.physics.arcade.collide(this.foreground, this.throwObjects);
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.player2 = null;
  this.players = null;

  this.throwObjects = null;
};