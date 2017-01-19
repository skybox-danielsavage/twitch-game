var Gameplay = function () {
  this.player = null;
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

  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('sheet', 'test16x16_tile');
  this.background = this.map.createLayer('Background');
  this.foreground = this.map.createLayer('Foreground');
  this.map.setCollisionByExclusion([0], true, this.foreground);

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);
};
Gameplay.prototype.update = function () {
  //
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
};