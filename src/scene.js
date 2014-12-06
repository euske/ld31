// scene.js

function Crack(x, y)
{
  this.origin = new Point(x,y);
  this.pts = [];
}

Crack.prototype.spread = function ()
{
  var q;
  if (this.pts.length == 0) {
    q = this.origin;
  } else {
    while (1) {
      var p = this.pts[rnd(this.pts.length)];
      q = p.copy();
      switch (rnd(4)) {
      case 0: q.x--; break;
      case 1: q.x++; break;
      case 2: q.y--; break; 
      case 3: q.y++; break;
      }
      var found = -1;
      for (var i = 0; i < this.pts.length; i++) {
	if (q.equals(this.pts[i])) {
	  found = i;
	  break;
	}
      }
      if (found < 0) break;
    }
  }
  this.pts.push(q);
  return q;
}

Crack.prototype.shrink = function ()
{
  if (0 < this.pts.length) {
    return this.pts.pop();
  } else {
    return null;
  }
}

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
  this.cracks = [];
  for (var i = 0; i < 10; i++) {
    var x = rnd(tilemap.width);
    var y = rnd(tilemap.height);
    this.cracks.push(new Crack(x, y));
  }
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

Scene.prototype.checkAny = function (rect, c)
{
  var tilemap = this.tilemap;
  var r = tilemap.coord2map(rect);
  var f = function (x,y) { return (tilemap.get(x,y) == c); };
  return tilemap.apply(r, f);
}

Scene.prototype.checkAll = function (rect, c)
{
  var tilemap = this.tilemap;
  var r = tilemap.coord2map(rect);
  var f = function (x,y) { return (tilemap.get(x,y) != c); };
  return !tilemap.apply(r, f);
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
  if (0 < this.cracks.length) {
    var crack = this.cracks[rnd(this.cracks.length)];
    var p = crack.spread();
    this.tilemap.set(p.x, p.y, Tile.Empty);
    this.invalidate();
  }
}

Scene.prototype.rewind = function ()
{
  if (0 < this.cracks.length) {
    var crack = this.cracks[rnd(this.cracks.length)];
    var p = crack.shrink();
    if (p != null) {
      this.tilemap.set(p.x, p.y, Tile.Floor);
      this.invalidate();
    }
  }
}
