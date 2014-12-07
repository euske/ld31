// game.js

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
  this.scene.sprites.push(this.player);
  this.ticks = 0;
  this.score = 0;
  this.health = 10;
  this.updateScore(0);
  this.updateHealth(0);
  this.play_music(this.audios.intro);
  this.focus();
}

Game.prototype.idle = function ()
{
  // move everything in the scene (including the player).
  this.scene.idle(this.ticks);
  // readjust the view.
  this.scene.setCenter(this.player.rect.inset(-600, -600));
  // player dead?
  if (this.player.isDead()) {
    this.audios.hurt.play();
    while (this.player.isDead()) {
      for (var i = 0; i < rnd(10,100); i++) {
	this.scene.rewind();
      }
    }
  }
  // play the next music.
  if (this.music != null) {
    if (this.mdur <= this.music.currentTime) {
      this.music.pause();
      this.play_music(this.audios.music);
    }
  }
  // increment the tick count.
  this.ticks++;
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

Game.prototype.play_music = function (music)
{
  return; // disable music for now!
  this.mdur = music.duration;
  if (music.innerHTML) {
    this.mdur += parseFloat(music.innerHTML);
  }
  this.music = music;
  this.music.fastSeek(0);
  this.music.play();
}

Game.prototype.repaint = function (ctx)
{
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.save();
  this.scene.repaint(ctx);
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
