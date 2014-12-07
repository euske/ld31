// overlay.js
// Overlay object: something shown outside the game world (titles, etc.)

function Overlay(image, ticks, duration)
{
  this.image = image;
  this.ticks = ticks;
  this.duration = duration;
  this.alive = true;
  this.rect = new Rectangle(0, 0, image.width, image.height);
}

Overlay.prototype.idle = function (ticks)
{
  if (this.duration <= (ticks-this.ticks)) {
    this.alive = false;
  }
}

Overlay.prototype.repaint = function (ctx)
{
  ctx.drawImage(this.image,
		this.rect.x, this.rect.y);
}
