// game.js
// Game: The main loop of the game.
// It handles events and manages shared resources (images, audios, etc.)
// It also handles the game states and music play.

function Game(framerate, canvas, images, audios, labels)
{
  this.framerate = framerate;
  this.canvas = canvas;
  this.images = images;
  this.audios = audios;
  this.labels = labels;
  this.active = false;
  this.key_left = false;
  this.key_right = false;
  this.key_up = false;
  this.key_down = false;
  this.state = 0;		// uninitialized.
}

Game.prototype.keydown = function (ev)
{
  switch (this.state) {
  case 1:
    switch (ev.keyCode) {
    case 32:
      this.spawnPlayer();
      break;
    }
    break;
  case 2:
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
    break;
  case 4:
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
  var width = this.canvas.width/tilesize;
  var height = this.canvas.height/tilesize;
  this.ticks = 0;
  this.scene = new Scene(this, tilesize, width, height);
  // Hitbox Dimensions are hardcoded to match the sprite closely (-_-)  :D
  var hitbox = new Rectangle(6, 19, 20, 8);
  this.player = new Player(this, this.scene,
			   new Rectangle(0, 0, tilesize, tilesize), hitbox);
  this.overlays = [];
  this.play_music(this.audios.music);
  this.focus();
  this.resetPlayer();
}

Game.prototype.resetPlayer = function ()
{
  this.player.rect.x = Math.floor(this.scene.mapwidth-this.player.rect.width)/2;
  this.player.rect.y = Math.floor(this.scene.mapheight-this.player.rect.height)/2;
  this.scene.startFormingLevel(this.ticks, this.player.rect, 3);
  this.state = 1;		// unspawned
}

Game.prototype.spawnPlayer = function ()
{
  var title = new Overlay(this.images.title, this.ticks, this.framerate/3);
  var cx = (this.canvas.width)/2;
  var cy = ((this.canvas.height/2)-40);
  title.p0 = new Point(cx, cy*2);
  title.p1 = new Point(cx, cy*1);
  title.p2 = new Point(cx, cy*0);
  this.overlays.push(title);

  this.scene.addActor(this.player);
  this.scene.startFormingLevel(this.ticks, this.player.rect, 10);
  this.health = 100;
  this.survived = 0;
  this.updateHealth(0);
  this.state = 2;		// unstarted
  this.player.spawn();		// start animation
}

Game.prototype.meltPlayer = function ()
{
  this.player.melt();	// start animation
  this.state = 3;	// dead
}

Game.prototype.unspawnPlayer = function ()
{
  var gameover = new Overlay(this.images.gameover, this.ticks, this.framerate/3);
  var cx = (this.canvas.width/2);
  var cy = (this.canvas.height/2);
  gameover.p0 = new Point(cx*2, cy+40);
  gameover.p1 = new Point(cx*1, cy+40);
  gameover.p2 = new Point(cx*0, cy+40);
  this.overlays.push(gameover);
  this.scene.removeActor(this.player);
  this.scene.startCollapsingAll(this.ticks);
  this.state = 4;		// resettting
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
  this.mdur = music.duration;
  if (music.innerHTML) {
    this.mdur += parseFloat(music.innerHTML);
  }
  this.music = music;
  this.music.currentTime = 0;
  this.music.play();
}

Game.prototype.idle = function ()
{
  switch (this.state) {
  case 1:
    // move everything in the scene (including the player).
    this.scene.idle(this.ticks);
    break;
  case 2:
    // move everything in the scene (including the player).
    this.scene.idle(this.ticks);
    // change the level a bit.
    this.scene.transform(this.ticks);
    // player dead?
    if (this.player.isDead()) {
      this.audios.death.currentTime = 0;
      this.audios.death.play();
      this.meltPlayer();
    }
    this.survived++;
    var t = Math.floor(this.survived/this.framerate);
    this.labels.time.innerHTML = ("Time Not Melted: "+t);
    break;
  case 3:
    // move everything in the scene (including the player).
    this.scene.idle(this.ticks);
    if (!this.player.isDisabled()) {
      this.unspawnPlayer();
      this.resetPlayer();
    }
    break;
  case 4:
    this.scene.idle(this.ticks);
    break;
  }
  // play the next music.
  if (this.music != null) {
    if (this.mdur <= this.music.currentTime) {
      this.music.pause();
      this.play_music(this.audios.music);
    }
  }
  // move the overlays.
  var removed = [];
  for (var i = 0; i < this.overlays.length; i++) {
    var overlay = this.overlays[i];
    overlay.idle(this.ticks);
    if (!overlay.alive) {
      removed.push(overlay);
    }
  }
  removeArray(this.overlays, removed);
  // increment the tick count.
  this.ticks++;
}

Game.prototype.repaint = function (ctx)
{
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.save();
  // re-adjust the view.
  this.scene.setCenter(this.player.rect.inset(-600, -600));
  this.scene.repaint(ctx);
  for (var i = 0; i < this.overlays.length; i++) {
    this.overlays[i].repaint(ctx);
  }
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

Game.prototype.updateHealth = function (d)
{
  this.health += d;
//  this.labels.health.innerHTML = (this.health+"/50");
}
