// scene.js

function Scene(tilemap, width, height)
{
  this.tilemap = tilemap;
  this.window = new Rectangle(0, 0, width*tilemap.tilesize, height*tilemap.tilesize);
  this.mapwidth = tilemap.width * tilemap.tilesize;
  this.mapheight = tilemap.height * tilemap.tilesize;
  this.maprect = new Rectangle(0, 0, width, height);
  this.mapimage = document.createElement('canvas');
  this.mapimage.width = this.window.width + tilemap.tilesize;
  this.mapimage.height = this.window.height + tilemap.tilesize;
  this.invalidate();
}

Scene.prototype.setCenter = function (rect)
{
  if (rect.x < this.window.x) {
    this.window.x = rect.x;
  } else if (this.window.x+this.window.width < rect.x+rect.width) {
    this.window.x = rect.x+rect.width - this.window.width;
  }
  if (rect.y < this.window.y) {
    this.window.y = rect.y;
  } else if (this.window.y+this.window.height < rect.y+rect.height) {
    this.window.y = rect.y+rect.height - this.window.width;
  }
  this.window.x = clamp(0, this.window.x, this.mapwidth-this.window.width);
  this.window.y = clamp(0, this.window.y, this.mapheight-this.window.height);

  var r = this.tilemap.coord2map(this.window);
  if (!this.maprect.equals(r)) {
    this.tilemap.render(this.mapimage.getContext('2d'),
			r.x, r.y, r.width+1, r.height+1);
    this.maprect = r;
  }
}

Scene.prototype.invalidate = function ()
{
  this.maprect.x = -1;
  this.maprect.y = -1;
}

Scene.prototype.repaint = function (ctx)
{
  var ts = this.tilemap.tilesize;
  var x0 = Math.floor(this.window.x/ts)*ts;
  var y0 = Math.floor(this.window.y/ts)*ts;
  ctx.drawImage(this.mapimage, x0-this.window.x, y0-this.window.y);
}

Scene.prototype.collide = function (rect, vx, vy)
{
  var f = function (c) { return (c < 0 || c == Tile.Block); }
  return this.tilemap.collide(rect, new Point(vx, vy), f);
}

Scene.prototype.pick = function (rect)
{
  var tilemap = this.tilemap;
  var r = tilemap.coord2map(rect);
  var f = function (x,y) { return (tilemap.get(x,y) == Tile.Cake); };
  var g = function (x,y) { if (tilemap.get(x,y) == Tile.Cake) { tilemap.set(x,y,0); } };
  if (tilemap.apply(r, f)) {
    tilemap.apply(r, g);
    this.invalidate();
    return true;
  }
  return false;
}

Scene.prototype.generate = function ()
{
  var x1 = rnd(this.tilemap.width);
  var y1 = rnd(this.tilemap.height);
  switch (0) {
  case 0:
    this.tilemap.set(x1, y1, Tile.Empty);
    for (var dy = -1; dy <= +1; dy++) {
      for (var dx = -1; dx <= +1; dx++) {
	var x = x1+dx;
	var y = y1+dy;
	var c = Tile.getSide(
	  (this.tilemap.get(x-1,y-1) == Tile.Floor),
	  (this.tilemap.get(x+0,y-1) == Tile.Floor),
	  (this.tilemap.get(x+1,y-1) == Tile.Floor),
	  (this.tilemap.get(x-1,y+0) == Tile.Floor),
	  (this.tilemap.get(x+1,y+0) == Tile.Floor),
	  (this.tilemap.get(x-1,y+1) == Tile.Floor),
	  (this.tilemap.get(x+0,y+1) == Tile.Floor),
	  (this.tilemap.get(x+1,y+1) == Tile.Floor));
	this.tilemap.set(x,y,c);
      }
    }
    break;
  }
  this.invalidate();
}
