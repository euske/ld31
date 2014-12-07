// overlay.js
// Overlay object: something shown outside the game world (titles, etc.)

function Overlay(image)
{
  this.image = image;
  this.rect = new Rectangle(0, 0, image.width, image.height);
}

Overlay.prototype.idle = function (ticks)
{
  return true;
}

Overlay.prototype.repaint = function (ctx)
{
  ctx.drawImage(this.image,
		this.rect.x, this.rect.y);
}

function Title(image)
{
  this.image = image;
  this.rect = new Rectangle(0, 0, image.width, image.height);
}
Title.prototype.idle = function (ticks)
{
  return (ticks < 30);
}
Title.prototype.repaint = Overlay.prototype.repaint;
