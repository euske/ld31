// scene.js
// Scene object takes care of every in-game object and the scrollable map.

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

function Scene(game, tilesize, width, height)
{
  // initialize the level.
  var map = new Array(height*2);
  for (var i = 0; i < map.length; i++) {
    var row = new Array(width*2);
    for (var j = 0; j < map.length; j++) {
      row[j] = Tile.Floor;
    }
    map[i] = row;
  }
  this.cracks = [];
  for (var i = 0; i < 10; i++) {
    var x = rnd(width);
    var y = rnd(height);
    this.cracks.push(new Crack(x, y));
  }
  
  this.tilesize = tilesize;
  this.tilemap = new TileMap(tilesize, game.images.tiles, map);
  this.window = new Rectangle(0, 0, width*tilesize, height*tilesize);
  this.mapwidth = this.tilemap.width * tilesize;
  this.mapheight = this.tilemap.height * tilesize;
  this.actors = [];
}

Scene.prototype.idle = function (ticks)
{
  // change the level a bit.
  this.change();
  // move each actor.
  var removed = []
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    actor.idle(ticks);
    if (!actor.alive) {
      removed.push(actor);
    }
  }
  removeArray(this.actors, removed);
}

Scene.prototype.repaint = function (ctx)
{
  var ts = this.tilesize;
  var x0 = Math.floor(this.window.x/ts)*ts;
  var y0 = Math.floor(this.window.y/ts)*ts;
  ctx.drawImage(this.tilemap.image, x0-this.window.x, y0-this.window.y);
  for (var i = 0; i < this.actors.length; i++) {
    var actor = this.actors[i];
    actor.repaint(ctx, actor.rect.x-this.window.x, actor.rect.y-this.window.y);
  }
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
  var tilemap = this.tilemap;
  var f = function (x, y) {
    var c = tilemap.get(x, y);
    if (c == Tile.Empty) {
      c = Tile.getSideFloor(
	(tilemap.get(x-1,y-1) == Tile.Floor),
	(tilemap.get(x+0,y-1) == Tile.Floor),
	(tilemap.get(x+1,y-1) == Tile.Floor),
	(tilemap.get(x-1,y+0) == Tile.Floor),
	(tilemap.get(x+1,y+0) == Tile.Floor),
	(tilemap.get(x-1,y+1) == Tile.Floor),
	(tilemap.get(x+0,y+1) == Tile.Floor),
	(tilemap.get(x+1,y+1) == Tile.Floor)
      );
    }
    return c;
  };
  this.tilemap.update(r, f);
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
    return true;
  }
  return false;
}

Scene.prototype.change = function ()
{
  if (0 < this.cracks.length) {
    var crack = this.cracks[rnd(this.cracks.length)];
    var p = crack.spread();
    this.tilemap.set(p.x, p.y, Tile.Empty);
  }
}

Scene.prototype.rewind = function ()
{
  if (0 < this.cracks.length) {
    var crack = this.cracks[rnd(this.cracks.length)];
    var p = crack.shrink();
    if (p != null) {
      this.tilemap.set(p.x, p.y, Tile.Floor);
    }
  }
}
