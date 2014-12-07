// sprite.js

function Sprite(game, scene, width, height)
{
  this.rect = new Rectangle(0, 0, width, height);
}

Sprite.prototype.idle = function (ticks)
{
}

Sprite.prototype.repaint = function (ctx, x, y)
{
}

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

Player.prototype.idle = function (ticks)
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

Player.prototype.repaint = function (ctx, x, y)
{
  // draw the shadow.
  ctx.drawImage(this.game.images.sprites,
		this.rect.width, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
  // draw the player.
  if (0 <= this.jumping) {
    // add the jumping height.
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
