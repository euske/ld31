// overlay.js
// Overlay object: something shown outside the game world (titles, etc.)

function Overlay(image, ticks, duration)
{
  this.image = image;
  this.ticks = ticks;
  this.duration = duration;
  this.alive = true;
  this.rect = new Rectangle(0, 0, image.width, image.height);
  this.p0 = new Point(0, 0);
  this.p1 = new Point(0, 0);
  this.p2 = new Point(0, 0);
  this.dt = 0;
}

Overlay.prototype.idle = function (ticks)
{
  this.dt = (ticks-this.ticks)/this.duration;
  if (4.0 <= this.dt) {
    this.alive = false;
  }
}

Overlay.prototype.repaint = function (ctx)
{
  var x, y;
  if (this.dt < 1.0) {
    var t = (1.0-this.dt);
    t = 1.0-t*t*t*t;
    x = this.p0.x*(1.0-t) + this.p1.x*t;
    y = this.p0.y*(1.0-t) + this.p1.y*t;
  } else if (this.dt < 3.0) {
    x = this.p1.x;
    y = this.p1.y;
  } else if (this.dt < 4.0) {
    var t = (this.dt-3.0);
    t = 1.0-t*t*t*t;
    x = this.p1.x*t + this.p2.x*(1.0-t);
    y = this.p1.y*t + this.p2.y*(1.0-t);
  }
  this.rect.x = x-this.rect.width/2;
  this.rect.y = y-this.rect.height/2;
  ctx.drawImage(this.image,
		this.rect.x, this.rect.y);
}
