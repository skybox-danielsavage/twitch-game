var ShoppingList = function (items) {
  this.shoppingItems = items;
};
ShoppingList.prototype.getItems = function() {
  return this.shoppingItems;
};


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
  },
  {
    right: Phaser.KeyCode.L,
    left: Phaser.KeyCode.J,
    jump: Phaser.KeyCode.I,
    throw: Phaser.KeyCode.K
  },
  {
    right: Phaser.KeyCode.H,
    left: Phaser.KeyCode.F,
    jump: Phaser.KeyCode.T,
    throw: Phaser.KeyCode.G
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
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 4 + index);
  this.index = index;
  this.throwObjects = throwObjects;
  this.carrying = null;
  this.facingRight = true;

  this.wasThrowKeyDown = false;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);

  this.walkSpeed = 100;

  if (this.index === 0) {
    this.width = 32;
  }

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

  if (throwKeyDown && this.wasThrowKeyDown === false && this.index !== 0) {
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
  this.player3 = null;
  this.player4 = null;
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

  this.shoppingList = new ShoppingList(['apple', 'eggs', 'milk', 'cabbage', 'television', 'toilet paper']);

  this.ui = this.game.add.group();
  this.ui.fixedToCamera = true;
  this.ui.shoppingListView = this.game.add.group();
  this.ui.shoppingListView.x = 8;
  this.ui.shoppingListView.y = 8;
  this.ui.addChild(this.ui.shoppingListView);
  for (var i = 0; i < this.shoppingList.getItems().length; i++) {
    var text = this.game.add.bitmapText(0, i * 10, 'font', this.shoppingList.getItems()[i], 8);
    this.ui.shoppingListView.addChild(text);
  }
  //this.ui.dummyText = this.game.add.bitmapText(16, 16, 'font', 'hello, world!', 8);
  //this.ui.addChild(this.ui.dummyText);

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

  this.player = new Player(this.game, 0, 220, 10, this.throwObjects);
  this.player2 = new Player(this.game, 1, 69, 10, this.throwObjects);
  this.player3 = new Player(this.game, 2, 70, 10, this.throwObjects);
  this.player4 = new Player(this.game, 3, 50, 10, this.throwObjects);
  this.players = [this.player, this.player2, this.player3, this.player4];

  this.effectEmitter = this.game.add.emitter(0, 0, 30);
  this.effectEmitter.gravity = 0;
  this.effectEmitter.makeParticles('test16x16', 2);
  this.effectEmitter.lifespan = 1000;
  this.effectEmitter.maxRotation = 0;
  this.effectEmitter.minRotation = 0;
  this.effectEmitter.setScale(0.20, 0.25, 0.20, 0.25)

  for (var i = 0; i < 4; i++) {
    var to = new ThrowObject(this.game, 25 + 50 * i, 25);
    this.throwObjects.addChild(to);
    this.throwObjects.addToHash(to);
  }

  this.game.world.bringToTop(this.ui);

  this.game.camera.follow(this.players[0]);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.foreground, this.players);
  this.game.physics.arcade.collide(this.foreground, this.throwObjects);

  this.game.physics.arcade.overlap(this.throwObjects, this.players, function (player, throwObject) {
    throwObject.kill();

    for (var i = 0; i < 10; i++) {
      this.effectEmitter.emitParticle(this.player.centerX, this.player.y - this.player.height / 5);
    }
  }, function (player, throwObject) {
    return (player.index === 0 && (throwObject.body.velocity.y > 2));
  }, this);

};
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.player2 = null;
  this.player3 = null;
  this.player4 = null;
  this.players = null;

  this.throwObjects = null;
};
