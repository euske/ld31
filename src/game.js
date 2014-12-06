// game.js

function Scene(tilemap, width, height)
{
  this.tilemap = tilemap;
  this.buffer = document.createElement('canvas');
  this.buffer.width = width * tilemap.tilesize;
  this.buffer.height = height * tilemap.tilesize;
  this.maprect = new Rectangle(-1, -1, width, height);
}
Scene.prototype.repaint = function (ctx)
{
  ctx.drawImage(this.buffer, 0, 0);
}
Scene.prototype.update = function (rect, margin)
{
  var r = this.tilemap.coord2map(rect.inset(margin, margin));
  var dst = this.maprect.copy();
  if (r.x < dst.x) {
    dst.x = r.x;
  } else if (dst.x+dst.width < r.x+r.width) {
    dst.x = r.x+r.width - dst.width;
  }
  if (r.y < dst.y) {
    dst.y = r.y;
  } else if (dst.y+dst.height < r.y+r.height) {
    dst.y = r.y+r.height - dst.width;
  }
  dst.x = clamp(0, dst.x, this.tilemap.width-dst.width);
  dst.y = clamp(0, dst.y, this.tilemap.height-dst.height);
  if (!this.maprect.equals(dst)) {
    this.maprect = dst;
    this.tilemap.render(this.buffer.getContext('2d'),
			dst.x, dst.y, dst.width, dst.height);
  }
}
Scene.prototype.collide = function (rect, vx, vy)
{
  var f = function (c) { return (c < 0 || c == 1); }
  return this.tilemap.collide(rect, new Point(vx, vy), f);
}
Scene.prototype.pick = function (rect)
{
  var tilemap = this.tilemap;
  var f = function (x,y) { return (tilemap.get(x,y) == 2); };
  var g = function (x,y) { if (tilemap.get(x,y) == 2) { tilemap.set(x,y,0); } };
  if (tilemap.apply(tilemap.coord2map(rect), f)) {
    tilemap.apply(rect, g);
    return true;
  }
  return false;
}

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
  this.scene.update(this.rect, 100);
  if (this.scene.pick(this.rect)) {
    this.game.addscore(+1);
  }
}
Player.prototype.repaint = function (ctx)
{
  ctx.drawImage(this.game.images.sprites,
		0, 0, this.rect.width, this.rect.height,
		this.rect.x, this.rect.y, this.rect.width, this.rect.height);
}

function Game(canvas, images, audios, label)
{
  this.canvas = canvas;
  this.images = images;
  this.audios = audios;
  this.label = label;
  this.active = false;
}

Game.prototype.keydown = function (ev)
{
  switch (ev.keyCode) {
  case 37:			// LEFT
  case 65:			// A
  case 72:			// H
    this.player.vx = -1;
    break;
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this.player.vx = +1;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
    this.player.vy = -1;
    break;
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
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
  case 39:			// RIGHT
  case 68:			// D
  case 76:			// L
    this.player.vx = 0;
    break;
  case 38:			// UP
  case 87:			// W
  case 75:			// K
  case 40:			// DOWN
  case 83:			// S
  case 74:			// J
    this.player.vy = 0;
    break;
  }
}

Game.prototype.init = function ()
{
  var tilesize = 32;
  var map = copyarray([
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,1,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 2,2,0,0, 0,0,0,0],
    
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,0,0, 0,0,0,0],
    [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,2,0, 0,0,0,0, 0,2,2,0],
    [0,0,0,0, 0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    
    [0,0,1,1, 1,1,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 1,1,0,0, 0,0,0,0, 1,1,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,2,0, 0,2,0,0, 0,0,0,0],
    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
  ]);
  var tilemap = new TileMap(tilesize, this.images.tiles, map);
  this.scene = new Scene(tilemap, 10, 5);
  this.player = new Player(this, this.scene, tilesize, tilesize);
  this.scene.update(this.player.rect);
  this.score = 0;
  this.focus();
}

Game.prototype.idle = function ()
{
  this.player.idle();
}

Game.prototype.focus = function (ev)
{
  this.active = true;
  //this.audios.music.play();
}

Game.prototype.blur = function (ev)
{
  //this.audios.music.pause();
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

Game.prototype.addscore = function (d)
{
  this.score += d;
  this.audios.pick.play();
  this.label.innerHTML = ("Score: "+this.score);
}
