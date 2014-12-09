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
  this.rect = new Rectangle(0, 0, spritesize, spritesize);
  
  this.vx = this.vy = 0;
  this.maxjump = 20;		// max duration of jumping.
  this.jumping = -1;		// jump counter.
  // animation flags
  this.isJumping = false;
  this.spawning = false;
  this.moving = false;
  this.melting = false;
  
  this.pfIndex = 0;
  this.sfIndex = 0;
}

Player.prototype.idle = function (ticks)
{
  var vx = this.vx;
  var vy = this.vy;
  
  var ratio = 0.90;
  var slipping = 0.2;
  var r = this.rect.inset(this.rect.width*ratio, this.rect.height*ratio);
  // Slipping Effect
  if (this.jumping < 0) {
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
  // Wall Pushing Effect (FINISH POST-COMPO)
/*  if (this.scene.checkAny(r.move(-r.width/2, 0), Tile.Wall)) {
	vx += slipping;
  } else if (this.scene.checkAny(r.move(+r.width/2, 0), Tile.Wall)) {
	vx -= slipping;
  }
  if (this.scene.checkAny(r.move(0, -r.height/2), Tile.Wall)) {
    vy += slipping;
  } else if (this.scene.checkAny(r.move(0, +r.height/2), Tile.Wall)) {
    vy -= slipping;
  }
*/
  // Hitbox Dimensions are hardcoded to match the sprite closely
  var hitbox = new Rectangle(this.rect.x +7, this.rect.y +19, 18, 8);
  var speed = 6;
  var d = this.scene.collideTiles(hitbox, speed*vx, speed*vy);
  d.x = this.scene.collideTiles(hitbox, speed*vx, d.y).x;
  d.y = this.scene.collideTiles(hitbox, d.x, speed*vy).y;
  this.rect.x += d.x;
  this.rect.y += d.y;
  if (0 <= this.jumping) {
    this.jumping++;
	this.isJumping = true; // anim flag
    if (this.maxjump <= this.jumping) {
      this.jumping = -1;
    }
  } else {
	this.isJumping = false;
  }
  if (this.scene.pick(hitbox)) {
    this.game.audios.pick.play();
    this.game.updateScore(+1);
  }
}

Player.prototype.repaint = function (ctx, x, y)
{
/*  var pFrame = this.pfIndex;
  var sFrame = this.sfIndex;

  var anim = new Transition(this.game.images.sprites_player, ticks);
  var animShadow = new Transition(this.game.images.sprites_shadow, ticks);
  
  anim.rect = player.rect;
  anim.layer = 1;
  anim.delay = this.game.framerate/2;
	
  animShadow.rect = player.rect;
  animShadow.layer = 0;
  animShadow.delay = this.game.framerate/2;
  
  if (this.isJumping) {
	anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerJumpStart+i;
	  if (Sprite.PlayerJumpEnd < anim.sprite_index) {
		anim.sprite_index = Sprite.PlayerJumpStart;
	  }
	});
	anim.callback = 0;
	
	animShadow.callback = (function(i) {
      animShadow.sprite_index = Sprite.ShadowJumpStart+i;
	  if (Sprite.ShadowJumpEnd < animShadow.sprite_index) {
		animShadow.sprite_index = Sprite.ShadowJumpStart;
	  }
	});
	anim.callback = 0;
	
	pFrame = anim.sprite_index;
	sFrame = animShadow.sprite_index;
	
  } else if (this.isMoving) {
	anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerMoveStart+i;
	  if (Sprite.PlayerMoveEnd < anim.sprite_index) {
		anim.sprite_index = Sprite.PlayerMoveStart;
	  }
	});
	anim.callback = 0;
	
	pFrame = anim.sprite_index;
	sFrame = Sprite.ShadowIdle;
	
  } else if (this.isSpawning) {
	anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerSpawnStart+i;
	  if (Sprite.PlayerSpawnEnd < anim.sprite_index) {
		this.isSpawning = false;
	  }
	});
	anim.callback = 0;
	
	animShadow.callback = (function(i) {
      animShadow.sprite_index = Sprite.ShadowSpawnStart+i;
	  if (Sprite.ShadowSpawnEnd < animShadow.sprite_index) {
		this.isSpawning = false;
	  }
	});
	anim.callback = 0;
	
	pFrame = anim.sprite_index;
	sFrame = animShadow.sprite_index;
	
  } else if (this.isMelting) {
	anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerDeathStart+i;
	  if (Sprite.PlayerDeathEnd < anim.sprite_index) {
		this.melting = false;
	  }
	});
	anim.callback = 0;
	
	animShadow.callback = (function(i) {
      animShadow.sprite_index = Sprite.ShadowDeathStart+i;
	  if (Sprite.ShadowDeathEnd < animShadow.sprite_index) {
		this.isMelting = false;
	  }
	});
	anim.callback = 0;
	
	pFrame = anim.sprite_index;
	sFrame = animShadow.sprite_index;
	
  } else { //this.isIdle
		anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerIdleStart+i;
	  if (Sprite.PlayerIdleEnd < anim.sprite_index) {
		anim.sprite_index = Sprite.PlayerIdleStart;
	  }
	});
	anim.callback = 0;
	
	pFrame = anim.sprite_index;
	sFrame = Sprite.ShadowIdle;
  }
*/
	pFrame = Sprite.PlayerIdleStart;
	sFrame = Sprite.ShadowIdle;
  // draw the shadow.
  ctx.drawImage(this.game.images.sprites_shadow,
		sFrame*this.spritesize, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);

  if (0 <= this.jumping) {
    // add the jumping height.
    var t = (this.jumping/this.maxjump)-0.5;
    y -= (0.25-t*t)*6 * this.rect.height;
  }
  // draw the player.
  ctx.drawImage(this.game.images.sprites_player,
		pFrame*this.spritesize, 0, this.rect.width, this.rect.height,
		x, y, this.rect.width, this.rect.height);
}

/*	GENERIC ANIMATION COPYPASTE ZONE
Player.prototype.animSpawn = function (ticks)
{
	var anim = new Transition(this.game.images.sprites_player, ticks);
	var animShadow = new Transition(this.game.images.sprites_shadow, ticks);
	
	anim.rect = player.rect;
	anim.layer = 1;
	anim.delay = this.game.framerate/2;
	
	animShadow.rect = player.rect;
	animShadow.layer = 0;
	animShadow.delay = this.game.framerate/2;
	
	anim.callback = (function(i) {
      anim.sprite_index = Sprite.PlayerStart+i;
	  if (Sprite.PlayerEnd < anim.sprite_index) {
		
	  }
	});
	anim.callback = 0;
	
	animShadow.callback = (function(i) {
      animShadow.sprite_index = Sprite.ShadowStart+i;
	  if (Sprite.ShadowEnd < animShadow.sprite_index) {
		
	  }
	});
	animShadow.callback = 0;
	
	this.addTransition(this.player.rect.x, this.player.rect.y, anim);
	this.addTransition(this.player.rect.x, this.player.rect.y, animShadow);
}
*/

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
