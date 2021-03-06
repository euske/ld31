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
function Player(game, scene, rect, hitbox)
{
  this.game = game;
  this.scene = scene;
  this.rect = rect;
  this.hitbox = hitbox;
  this.layer = 0;
  this.alive = true;
  
  this.vx = this.vy = 0;
  this.maxjump = 20;		// max duration of jumping.
  this.jumping = -1;		// jump counter.

  // animation flags
  this.sprite_index = 0;
  this.shadow_index = 0;
  this.spawning = -1;		// spawning frame
  this.melting = -1;
}

Player.prototype.move = function (vx, vy)
{
  var speed = 6;
  var ratio = 0.85;
  var slipping = 0.2;
  var bounds = this.rect.inset(this.rect.width*ratio, this.rect.height*ratio);
  
  // Slipping Effect
  if (this.jumping < 0) {
    if (this.scene.checkAny(bounds.move(-bounds.width, 0), Tile.Empty)) {
      vx -= slipping;
    } else if (this.scene.checkAny(bounds.move(+bounds.width, 0), Tile.Empty)) {
      vx += slipping;
    }
    if (this.scene.checkAny(bounds.move(0, -bounds.height), Tile.Empty)) {
      vy -= slipping;
    } else if (this.scene.checkAny(bounds.move(0, +bounds.height), Tile.Empty)) {
      vy += slipping;
    }
  }

  // Wall Pushing Effect
  // (Vertical checks need tweaking.
  //  Run up towards the bottom of a wall and you'll see what I mean)
  if (this.scene.checkAny(bounds.move(-bounds.width/2, 0), Tile.WallTop) ||
      this.scene.checkAny(bounds.move(-bounds.width/2, 0), Tile.WallBottom)) {
    vx += slipping;
  } else if (this.scene.checkAny(bounds.move(+bounds.width/2, 0), Tile.WallTop) ||
	     this.scene.checkAny(bounds.move(+bounds.width/2, 0), Tile.WallBottom)) {
    vx -= slipping;
  }
  if (this.scene.checkAny(bounds.move(0, -bounds.height/2), Tile.WallTop) ||
      this.scene.checkAny(bounds.move(0, -bounds.height/2), Tile.WallBottom)) {
    vy += slipping;
  } else if (this.scene.checkAny(bounds.move(0, +bounds.height/2), Tile.WallTop) ||
	     this.scene.checkAny(bounds.move(0, +bounds.height/2), Tile.WallBottom)) {
    vy -= slipping;
  }
  
  var bounds = new Rectangle(this.rect.x+this.hitbox.x, this.rect.y+this.hitbox.y,
			     this.hitbox.width, this.hitbox.height);
  // move 
  var d = this.scene.collideTiles(bounds, speed*vx, speed*vy);
  d.x = this.scene.collideTiles(bounds, speed*vx, d.y).x;
  d.y = this.scene.collideTiles(bounds, d.x, speed*vy).y;
  this.rect.x += d.x;
  this.rect.y += d.y;
  if (0 <= this.jumping) {
    this.jumping++;
    if (this.maxjump <= this.jumping) {
      this.jumping = -1;	// jump end.
    }
  }

  // pick anything?
  if (this.scene.pick(bounds)) {
    this.game.audios.pick.currentTime = 0;
    this.game.audios.pick.play();
  }
}

Player.prototype.animu = function (ticks)
{
  // animu~
  var PlayerSpawnDuration = (Sprite.PlayerSpawnEnd-Sprite.PlayerSpawnStart);
  var PlayerDeathDuration = (Sprite.PlayerDeathEnd-Sprite.PlayerDeathStart);
  var PlayerJumpStartDuration = (Sprite.PlayerJumpHang-Sprite.PlayerJumpStart);
  var PlayerJumpEndDuration = (Sprite.PlayerJumpEnd-Sprite.PlayerJumpHang);
  var PlayerMoveDuration = (Sprite.PlayerMoveEnd-Sprite.PlayerMoveStart);
  var PlayerIdleDuration = (Sprite.PlayerIdleEnd-Sprite.PlayerIdleStart);
  var ticks2 = Math.floor(ticks/2); // ticks in 1/2 speed
  var ticks4 = Math.floor(ticks/4); // ticks in 1/4 speed
  var ticks8 = Math.floor(ticks/8); // ticks in 1/8 speed

  if (0 <= this.spawning) {
    // Player is Spawning
    this.sprite_index = Sprite.PlayerSpawnStart+(ticks8 % PlayerSpawnDuration);//this.spawning;
    this.shadow_index = Sprite.ShadowSpawnStart+(ticks8 % PlayerSpawnDuration);//this.spawning;
    this.spawning++;
    if (PlayerSpawnDuration <= this.spawning) {
      this.spawning = -1;
    }
  } else if (0 <= this.melting) {
    // Player is Melting
    this.sprite_index = Sprite.PlayerDeathStart+this.melting;
    this.shadow_index = Sprite.ShadowDeathStart+this.melting;
    this.melting++;
    if (PlayerDeathDuration <= this.melting) {
      this.melting = -1;
    }
  } else if (0 <= this.jumping) {
    // Player is jumping
    if (this.jumping < PlayerJumpStartDuration) {
      // Beginning of Jump
      this.sprite_index = Sprite.PlayerJumpStart+this.jumping;
      this.shadow_index = Sprite.ShadowIdle-this.jumping;
    } else if (this.jumping < this.maxjump-PlayerJumpEndDuration) {
      // Middle of jump
      this.sprite_index = Sprite.PlayerJumpHang;
      this.shadow_index = Sprite.ShadowJumpHang;
    } else {
      // Ending of Jump
      this.sprite_index = (Sprite.PlayerJumpHang+this.jumping-
			   (this.maxjump-PlayerJumpEndDuration));
      this.shadow_index = (Sprite.ShadowJumpHang+this.jumping-
			   (this.maxjump-PlayerJumpEndDuration));
    }
    /* Shadow Jump notes:
       Jump starts at 4, goes to 1 and hangs there, then goes back to 4 when
       the player falls. (Idle -> JumpHang -> Idle)
    */
    this.shadow_index = Sprite.ShadowJumpHang;
  } else if (this.vx != 0 || this.vy != 0) {
    // Running on the ground
    this.sprite_index = Sprite.PlayerMoveStart+(ticks2 % PlayerMoveDuration);
    this.shadow_index = Sprite.ShadowIdle;
  } else {
    // Player is not pressing any inputs (Idle Animation)
    this.sprite_index = Sprite.PlayerIdleStart+(ticks4 % PlayerIdleDuration);
    this.shadow_index = Sprite.ShadowIdle;
  }
}

Player.prototype.idle = function (ticks)
{
  if (!this.isDisabled()) {
    this.move(this.vx, this.vy);
  }
  this.animu(ticks);
}

Player.prototype.repaint = function (ctx, x, y)
{
  // draw the shadow.
  ctx.drawImage(this.game.images.sprites_shadow,
		this.shadow_index*this.rect.width, 0,
		this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);

  if (0 <= this.jumping) {
    // add the jumping height.
    var t = (this.jumping/this.maxjump)-0.5;
    y -= (0.25-t*t)*6 * this.rect.height;
  }
  // draw the player.
  ctx.drawImage(this.game.images.sprites_player,
		this.sprite_index*this.rect.width, 0,
		this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

Player.prototype.isDead = function ()
{
  //return false;			// disable dying.
  if (0 <= this.jumping) { //	MOVE THIS TO A HURT FUNCTION LATER (when one exists)
    return false;
  }
  var r = this.rect.inset(this.rect.width/2, this.rect.height/2);
  return this.scene.checkAll(r, Tile.Empty);
}

// Returns true if the player is in spawning/despawning.
Player.prototype.isDisabled = function ()
{
  return (0 <= this.spawning ||
	  0 <= this.melting);
}

Player.prototype.jump = function ()
{
  if (this.jumping < 0) {
    this.game.audios.jump.currentTime = 0;
    this.game.audios.jump.play();
    this.jumping = 0;
  }
}

Player.prototype.spawn = function ()
{
  this.spawning = 0;
}

Player.prototype.melt = function ()
{
  this.melting = 0;
}
