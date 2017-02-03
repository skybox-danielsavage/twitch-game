// GOALS FOR TODAY:
//
// Zach: get a prototype player sprite going :)
//       some simple animations too
//       variations, too!
// 
// Daniel: Create a "game state", describing what the players
//         need to do. (timer, items, etc.)

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
    right: Phaser.KeyCode.NUMPAD_6,
    left: Phaser.KeyCode.NUMPAD_4,
    jump: Phaser.KeyCode.NUMPAD_8,
    throw: Phaser.KeyCode.NUMPAD_5
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

  if (index === 0) { this.width = 24; }

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

  if (this.index !== 0) {
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
  }
};

var Gameplay = function () {
  this.player = null;
  this.player2 = null;
  this.player3 = null;
  this.player4 = null;
  this.players = [];

  this.gameLogic = null;

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

  this.gameLogic = new GameLogic(this.game);

  this.player = new Player(this.game, 0, 240, 10, this.throwObjects);
  this.player2 = new Player(this.game, 1, 48, 10, this.throwObjects);
  this.player3 = new Player(this.game, 2, 64, 10, this.throwObjects);
  this.player4 = new Player(this.game, 3, 96, 10, this.throwObjects);
  this.players = [this.player, this.player2, this.player3, this.player4];
  this.game.camera.follow(this.players[0]);

  this.ui = this.game.add.group();
  this.ui.fixedToCamera = true;
  this.ui.timerText = this.game.add.bitmapText(16, 16, 'font','GET READY!!', 8);
  this.ui.addChild(this.ui.timerText);
  this.ui.shoppingItems = [];
  for (var i = 0; i < 10; i++) {
    var newShoppingItem = this.game.add.bitmapText(this.game.width - 32, 32 + 16 * i, 'font', 'foo', 8);
    this.ui.addChild(newShoppingItem);
    this.ui.shoppingItems.push(newShoppingItem);
    newShoppingItem.align = 'right';
    newShoppingItem.anchor.x = 1;
  }

  this.gameLogic.startGame();
  for (var i = 0; i < this.gameLogic.shoppingList.length; i++) {
    var to = new ThrowObject(this.game, 200 + 100 * i, 25);
    this.throwObjects.addChild(to);
    this.throwObjects.addToHash(to);

    var label = this.game.add.bitmapText(8, -16, 'font', this.gameLogic.shoppingList[i], 8);
    to.addChild(label);
    to.textLabel = this.gameLogic.shoppingList[i];
  }
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.foreground, this.players);
  this.game.physics.arcade.collide(this.foreground, this.throwObjects);

  this.game.physics.arcade.overlap(this.players[0], this.throwObjects, function (shoppingCartPlayer, throwObject) {
    if (throwObject.body.onFloor()) { return; }

    throwObject.kill();
    var v = this.gameLogic.shoppingList.indexOf(throwObject.textLabel);
    console.log(v);
    this.gameLogic.shoppingList.splice(v, 1);
  }, undefined, this);

  this.ui.timerText.text = this.gameLogic.secondsLeft + ' seconds left!!';
  for (var i = 0; i < this.ui.shoppingItems.length; i++) {
    if (i < this.gameLogic.shoppingList.length) {
      this.ui.shoppingItems[i].text = this.gameLogic.shoppingList[i];
    } else {
      this.ui.shoppingItems[i].text = '';
    }
  }
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.player2 = null;
  this.player3 = null;
  this.player4 = null;
  this.players = null;

  this.throwObjects = null;
};