// game.js

function Player(game, scene, width, height)
{
  this.speed = 8;
  this.game = game;
  this.scene = scene;
  this.rect = new Rectangle(0, 0, width, height);
  this.vx = this.vy = 0;
}

Player.prototype.idle = function ()
{
  var vx = this.speed*this.vx;
  var vy = this.speed*this.vy;
  var d = this.scene.collide(this.rect, vx, vy);
  d.x = this.scene.collide(this.rect, vx, d.y).x;
  d.y = this.scene.collide(this.rect, d.x, vy).y;
  this.rect.x += d.x;
  this.rect.y += d.y;
  this.scene.setCenter(this.rect.inset(100, 100));
  if (this.scene.pick(this.rect)) {
    this.game.audios.pick.play();
    this.game.updateScore(+1);
  }
}

Player.prototype.repaint = function (ctx)
{
  var x = this.rect.x - this.scene.window.x;
  var y = this.rect.y - this.scene.window.y;
  ctx.drawImage(this.game.images.sprites,
		0, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

function Game(canvas, images, audios, labels)
{
  this.canvas = canvas;
  this.images = images;
  this.audios = audios;
  this.labels = labels;
  this.active = false;
  this.key_left = false;
  this.key_right = false;
  this.key_up = false;
  this.key_down = false;
}

Game.prototype.keydown = function (ev)
{
  switch (ev.keyCode) {
  case 37:			// LEFT
  case 65:			// A
  case 72:			// H
    this.key_left = true;
    this.player.vx = -1;
    break;
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this.key_right = true;
    this.player.vx = +1;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
    this.key_up = true;
    this.player.vy = -1;
    break;
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
    this.key_down = true;
    this.player.vy = +1;
    break;
  case 13:			// ENTER
  case 32:			// SPACE
  case 90:			// Z
  case 88:			// X
    this.action();
    break;
  case 112:			// F1
    break;
  }
}

Game.prototype.keyup = function (ev)
{
  switch (ev.keyCode) {
  case 37:			// LEFT
  case 65:			// A
  case 72:			// H
    this.key_left = false;
    this.player.vx = (this.key_right) ? +1 : 0;
    break;
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this.key_right = false;
    this.player.vx = (this.key_left) ? -1 : 0;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
    this.key_up = false;
    this.player.vy = (this.key_down) ? +1 : 0;
    break;
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
    this.key_down = false;
    this.player.vy = (this.key_up) ? -1 : 0;
    break;
  }
}

Game.prototype.init = function ()
{
  var tilesize = 32;
  var width = canvas.width/tilesize;
  var height = canvas.height/tilesize;
  var map = new Array(height*2);
  for (var i = 0; i < map.length; i++) {
    var row = new Array(width*2);
    for (var j = 0; j < map.length; j++) {
      row[j] = Tile.Floor;
    }
    map[i] = row;
  }
  var tilemap = new TileMap(tilesize, this.images.tiles, map);
  this.scene = new Scene(tilemap, width, height);
  this.player = new Player(this, this.scene, tilesize, tilesize);
  this.scene.setCenter(this.player.rect);
  this.t = 0;
  this.score = 0;
  this.health = 10;
  this.updateScore(0);
  this.updateHealth(0);
  this.focus();
}

Game.prototype.idle = function ()
{
  if ((this.t % 3) == 0) {
    this.scene.generate();
  }
  this.player.idle();
  this.t++;
}

Game.prototype.focus = function (ev)
{
  this.active = true;
  this.audios.music.play();
}

Game.prototype.blur = function (ev)
{
  this.audios.music.pause();
  this.active = false;
}

Game.prototype.repaint = function (ctx)
{
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.save();
  this.scene.repaint(ctx);
  this.player.repaint(ctx);
  if (!this.active) {
    var size = 50;
    ctx.fillStyle = 'rgba(0,0,64, 0.5)'; // gray out
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'lightgray';
    ctx.beginPath();
    ctx.moveTo(this.canvas.width/2-size, this.canvas.height/2-size);
    ctx.lineTo(this.canvas.width/2-size, this.canvas.height/2+size);
    ctx.lineTo(this.canvas.width/2+size, this.canvas.height/2);
    ctx.fill();
  }
  ctx.restore();
}

Game.prototype.action = function ()
{
  this.player.jump();
}

Game.prototype.updateScore = function (d)
{
  this.score += d;
  this.labels.score.innerHTML = ("Score: "+this.score);
}

Game.prototype.updateHealth = function (d)
{
  this.health += d;
  this.labels.health.innerHTML = ("Health: "+this.health);
}
