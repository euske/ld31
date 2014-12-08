// actor.js
// Actor: any in-game object that's animated (including Player).
// All Actors belong to the Scene object.

// Actor: Base class for anything that moves.
function Actor(rect)
{
  // Mandatory fields.
  this.alive = true;
  this.layer = 0;
  this.rect = rect;
}

Actor.prototype.idle = function (ticks)
{
}

Actor.prototype.repaint = function (ctx, x, y)
{
  // NEED TO BE OVERRIDEN
  ctx.drawImage(image,
		0, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

// Transition: Actor
function Transition(sprites, ticks, rect, delay, callback)
{
  this.sprites = sprites;
  this.ticks = ticks;
  this.layer = 1;
  this.rect = rect;
  this.delay = delay;
  this.callback = callback;
  this.sprite_index = 0;
  this.i = 0;
  this.alive = true;
}

Transition.prototype.idle = function (ticks)
{
  var i = Math.floor((ticks-this.ticks)/this.delay);
  if (this.i != i) {
    this.i = i;
    if (this.callback) {
      this.callback(i);
    }
  }
}

Transition.prototype.repaint = function (ctx, x, y)
{
  // draw the thing.
  ctx.drawImage(this.sprites,
		this.sprite_index*this.rect.width, 0,
		this.rect.width, this.sprites.height,
		x, y,
		this.rect.width, this.sprites.height);
}

// Player is an Actor.
function Player(game, scene, ticks, spritesize)
{
  this.game = game;
  this.scene = scene;
  this.ticks = ticks;
  this.spritesize = spritesize;
  this.layer = 0;
  this.alive = true;
  this.ready = false;
  this.rect = new Rectangle(0, 0, spritesize, spritesize);
  
  this.vx = this.vy = 0;
  this.maxjump = 20;		// max duration of jumping.
  this.jumping = -1;		// jump counter.
}

Player.prototype.idle = function (ticks)
{
  var vx = this.vx;
  var vy = this.vy;

  if (this.jumping < 0) {
    // slipping effect.
    var ratio = 0.75;
    var slipping = 0.2;
    var r = this.rect.inset(this.rect.width*ratio, this.rect.height*ratio);
    if (this.scene.checkAny(r.move(-r.width, 0), Tile.Empty)) {
      vx -= slipping;
    } else if (this.scene.checkAny(r.move(+r.width, 0), Tile.Empty)) {
      vx += slipping;
    }
    if (this.scene.checkAny(r.move(0, -r.height), Tile.Empty)) {
      vy -= slipping;
    } else if (this.scene.checkAny(r.move(0, +r.height), Tile.Empty)) {
      vy += slipping;
    }
  }
  
  var speed = 8;
  var d = this.scene.collide(this.rect, speed*vx, speed*vy);
  d.x = this.scene.collide(this.rect, speed*vx, d.y).x;
  d.y = this.scene.collide(this.rect, d.x, speed*vy).y;
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
		Sprite.PlayerShadow*this.spritesize, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
  // draw the player.
  if (0 <= this.jumping) {
    // add the jumping height.
    var t = (this.jumping/this.maxjump)-0.5;
    y -= (0.25-t*t)*6 * this.rect.height;
  }
  ctx.drawImage(this.game.images.sprites,
		Sprite.Player*this.spritesize, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

Player.prototype.isDead = function ()
{
  //return false;			// disable dying.
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
