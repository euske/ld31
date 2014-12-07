// game.js

function Player(game, scene, width, height)
{
  this.speed = 8;
  this.creep = 0.2;
  this.maxjump = 20;
  this.game = game;
  this.scene = scene;
  this.rect = new Rectangle(0, 0, width, height);
  this.jumping = -1;
  this.vx = this.vy = 0;
}

Player.prototype.idle = function (t)
{
  var vx = this.vx;
  var vy = this.vy;

  if (this.jumping < 0) {
    var r = this.rect.inset(this.rect.width/2, this.rect.height/2);
    if (this.scene.checkAny(r.move(-r.width, 0), Tile.Empty)) {
      vx -= this.creep;
    } else if (this.scene.checkAny(r.move(+r.width, 0), Tile.Empty)) {
      vx += this.creep;
    }
    if (this.scene.checkAny(r.move(0, -r.height), Tile.Empty)) {
      vy -= this.creep;
    } else if (this.scene.checkAny(r.move(0, +r.height), Tile.Empty)) {
      vy += this.creep;
    }
  }
  
  var d = this.scene.collide(this.rect, this.speed*vx, this.speed*vy);
  d.x = this.scene.collide(this.rect, this.speed*vx, d.y).x;
  d.y = this.scene.collide(this.rect, d.x, this.speed*vy).y;
  this.rect.x += d.x;
  this.rect.y += d.y;
  this.scene.setCenter(this.rect.inset(-600, -600));
  if (0 <= this.jumping) {
    this.jumping++;
    if (this.maxjump <= this.jumping) {
      this.jumping = -1;
    }
  }
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
		this.rect.width, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
  if (0 <= this.jumping) {
    var t = (this.jumping/this.maxjump)-0.5;
    y -= (0.25-t*t)*6 * this.rect.height;
  }
  ctx.drawImage(this.game.images.sprites,
		0, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

Player.prototype.isDead = function ()
{
  if (0 <= this.jumping) {
    return false;
  }
  var r = this.rect.inset(this.rect.width/2, this.rect.height/2);
  return this.scene.checkAll(r, Tile.Empty);
}

Player.prototype.jump = function ()
{
  if (this.jumping < 0) {
    this.game.audios.jump.play();
    this.jumping = 0;
  }
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
  case 80:			// P
    this.active = !this.active;
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
  this.music = this.audios.intro;
  this.mt = Date.now() + this.music.duration*1000;
  this.music.play();
}

Game.prototype.idle = function ()
{
  this.scene.generate();
  this.player.idle(this.t);
  while (this.player.isDead()) {
    for (var i = 0; i < rnd(10,100); i++) {
      this.scene.rewind();
    }
  }
  if (this.music != null) {
    if (this.mt <= Date.now()) {
      this.music.pause();
      this.music = this.audios.music;
      this.music.play();
      this.mt = Date.now() + this.music.duration*1000;
    }
  }
  this.t++;
}

Game.prototype.focus = function (ev)
{
  this.active = true;
  if (this.music != null) {
    this.music.play();
  }
}

Game.prototype.blur = function (ev)
{
  if (this.music != null) {
    this.music.pause();
  }
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
  this.labels.time.innerHTML = ("Score: "+this.score);
}

Game.prototype.updateHealth = function (d)
{
  this.health += d;
  this.labels.health.innerHTML = ("Health: "+this.health);
}
