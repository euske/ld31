// scene.js
// Scene object takes care of every in-game object and the scrollable map.

function Crack(cx, cy, w, h)
{
  this.x0 = cx-w;
  this.y0 = cy-h;
  this.x1 = cx+w+1;
  this.y1 = cy+h+1;
  this.pts = [];
}

Crack.prototype.find = function (x, y)
{
  var found = -1;
  for (var i = 0; i < this.pts.length; i++) {
    p = this.pts[i];
    if (p.x == x && p.x == y) {
      found = i;
      break;
    }
  }
  return found;
}

Crack.prototype.spread = function ()
{
  var q = null;
  if (this.pts.length == 0) {
    q = new Point(rnd(this.x0, this.x1),
		  rnd(this.y0, this.y1));
  } else {
    var max_tries = 10;
    for (var i = 0; i < max_tries; i++) {
      var p = this.pts[rnd(this.pts.length)];
      var x = p.x;
      var y = p.y;
      switch (rnd(4)) {
      case 0: x--; break;
      case 1: x++; break;
      case 2: y--; break; 
      case 3: y++; break;
      }
      if (x < this.x0 || y < this.y0 ||
	  this.x1 <= x || this.y1 <= y) continue;
      if (this.find(x, y) < 0) {
	q = new Point(x, y);
	break;
      }
    }
  }
  if (q) {
    this.pts.push(q);
  }
  return q;
}

function Scene(game, tilesize, width, height)
{
  // initialize the level.
  var map = new Array(height);
  for (var i = 0; i < map.length; i++) {
    var row = new Array(width);
    for (var j = 0; j < row.length; j++) {
      row[j] = Tile.Empty;
    }
    map[i] = row;
  }
  this.game = game;
  this.tilesize = tilesize;
  this.tilemap = new TileMap(tilesize, map);
  this.window = new Rectangle(0, 0, width*tilesize, height*tilesize);
  this.mapwidth = this.tilemap.width * tilesize;
  this.mapheight = this.tilemap.height * tilesize;
  this.actors = [];
}

Scene.prototype.idle = function (ticks)
{
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

Scene.prototype.collideTiles = function (rect, vx, vy)
{
  var f = function (c) {
    return (c < 0 || c == Tile.WallTop || c == Tile.WallBottom);
  }
  return this.tilemap.collide(rect, new Point(vx, vy), f);
}

Scene.prototype.addActor = function (actor)
{
  this.actors.push(actor);
  this.actors.sort(function (a,b) { return (b.layer-a.layer); });
}

Scene.prototype.collideActors = function (actor0)
{
  var a = []
  for (var i = 0; i < this.actors.length; i++) {
    var actor1 = this.actors[i];
    if (actor1 !== actor0 && actor1.rect.overlap(actor0.rect)) {
      a.push(actor1);
    }
  }
  return a;
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

Scene.prototype.transform = function (ticks)
{
  // Make a gradual change.
  if (0 < this.cracks.length) {
    var crack = this.cracks[rnd(this.cracks.length)];
    var tilemap = this.tilemap;
    var p = crack.spread();
    if (p != null) {
      switch (rnd(2)) {
      case 0:
	if (tilemap.get(p.x, p.y) == Tile.Floor) {
	  //this.startCollapsingFloor(ticks, p);
	}
	break;
      case 1:
	if (tilemap.get(p.x, p.y-1) == Tile.Floor &&
	    tilemap.get(p.x, p.y) == Tile.Floor) {
	  this.startFormingWall(ticks, p);
	}
	break;
      }
    }
  }
}

Scene.prototype.startForming = function (ticks, rect, max_radius)
{
  var tilemap = this.tilemap;
  var max_size = 5;
  var r = tilemap.coord2map(rect);
  this.cracks = [];
  for (var d = 0; d < max_radius; d++) {
    var cx = r.x + rnd(-(d+1), d+1);
    var cy = r.y + rnd(-(d+1), d+1);
    var w = Math.min(rnd(1, max_size), cx, tilemap.width-cx);
    var h = Math.min(rnd(1, max_size), cy, tilemap.height-cy);
    for (var dy = -h; dy <= h; dy++) {
      for (var dx = -w; dx <= w; dx++) {
	var p = new Point(cx+dx, cy+dy);
	this.startFormingFloor(ticks, p);
      }
    }
    this.cracks.push(new Crack(cx, cy, w, h));
  }
}

Scene.prototype.startCollapsing = function (ticks)
{
  var tilemap = this.tilemap;
  for (var y = 0; y < tilemap.height; y++) {
    for (var x = 0; x < tilemap.width; x++) {
      var p = new Point(x, y);
      var c = tilemap.get(p.x, p.y);
      switch (c) {
      case Tile.Floor:
	this.startCollapsingFloor(ticks, p);
	break;
      case Tile.WallBottom:
	this.startCollapsingWall(ticks, p);
	break;
      }
    }
  }
}

Scene.prototype.startFormingFloor = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_floor, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = -1;
  tr.delay = rnd(1, this.game.framerate/4);
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.FloorFormingStart+i;
    if (Sprite.FloorFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Floor);
    }
  });
  tr.callback(0);
  this.addActor(tr);
}

Scene.prototype.startFormingWall = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_wall, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.rect.y += tr.rect.height-tr.sprites.height;
  tr.layer = -1;
  tr.delay = this.game.framerate/4;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.WallFormingStart+i;
    if (Sprite.WallFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y-1, Tile.WallTop);
      tilemap.set(p.x, p.y, Tile.WallBottom);
    }
  });
  tr.callback(0);
  this.addActor(tr);
}

Scene.prototype.startCollapsingFloor = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_floor, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.delay = this.game.framerate/4;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.FloorCollapsingStart+i;
    if (tr.sprite_index == Sprite.FloorCollapsingBreak) {
      tr.layer = -1;
      tilemap.set(p.x, p.y, Tile.Empty);
    } else if (Sprite.FloorCollapsingEnd < tr.sprite_index) {
      tr.alive = false;
    }
  });
  tr.callback(0);
  this.addActor(tr);
}

Scene.prototype.startCollapsingWall = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_wall, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.delay = this.game.framerate/4;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.WallCollapsingStart+i;
    if (tr.sprite_index == Sprite.WallCollapsingStart) {
      tilemap.set(p.x, p.y-1, Tile.Empty);
      tilemap.set(p.x, p.y, Tile.Empty);
    } else if (Sprite.WallCollapsingEnd < tr.sprite_index) {
      tr.alive = false;
    }
  });
  tr.callback(0);
  this.addActor(tr);
}

Scene.prototype.repaint = function (ctx)
{
  var ts = this.tilesize;
  var tilemap = this.tilemap;
  var r = tilemap.coord2map(this.window);
  var x0 = r.x*ts;
  var y0 = r.y*ts;
  var getFloor = function (x, y) {
    var c = tilemap.get(x, y);
    switch (c) {
    case Tile.Floor:
    case Tile.WallBottom:
    case Tile.WallTop:
      return Tile.getFloor();
    case Tile.Empty:
      return Tile.getSideFloor(
	(tilemap.get(x-1,y-1) == Tile.WallBottom ||
	 tilemap.get(x-1,y-1) == Tile.Floor),
	(tilemap.get(x+0,y-1) == Tile.WallBottom ||
	 tilemap.get(x+0,y-1) == Tile.Floor),
	(tilemap.get(x+1,y-1) == Tile.WallBottom ||
	 tilemap.get(x+1,y-1) == Tile.Floor),
	(tilemap.get(x-1,y+0) == Tile.WallBottom ||
	 tilemap.get(x-1,y+0) == Tile.Floor),
	(tilemap.get(x+1,y+0) == Tile.WallBottom ||
	 tilemap.get(x+1,y+0) == Tile.Floor),
	(tilemap.get(x-1,y+1) == Tile.WallBottom ||
	 tilemap.get(x-1,y+1) == Tile.Floor),
	(tilemap.get(x+0,y+1) == Tile.WallBottom ||
	 tilemap.get(x+0,y+1) == Tile.Floor),
	(tilemap.get(x+1,y+1) == Tile.WallBottom ||
	 tilemap.get(x+1,y+1) == Tile.Floor)
      );
    default:
      return -1;
    }
  };
  var getWall = function (x, y) {
    var c = tilemap.get(x, y);
    switch (c) {
    case Tile.WallBottom:
      return Tile.getWall(
	(tilemap.get(x-1,y-1) == Tile.WallBottom),
	(tilemap.get(x+0,y-1) == Tile.WallBottom),
	(tilemap.get(x+1,y-1) == Tile.WallBottom),
	(tilemap.get(x-1,y+0) == Tile.WallBottom),
	(tilemap.get(x+1,y+0) == Tile.WallBottom),
	(tilemap.get(x-1,y+1) == Tile.WallBottom),
	(tilemap.get(x+0,y+1) == Tile.WallBottom),
	(tilemap.get(x+1,y+1) == Tile.WallBottom)
      );
    case Tile.Empty:
    case Tile.Floor:
    case Tile.WallTop:
      return Tile.getSideWall(
	(tilemap.get(x-1,y-1) == Tile.WallBottom),
	(tilemap.get(x+0,y-1) == Tile.WallBottom),
	(tilemap.get(x+1,y-1) == Tile.WallBottom),
	(tilemap.get(x-1,y+0) == Tile.WallBottom),
	(tilemap.get(x+1,y+0) == Tile.WallBottom),
	(tilemap.get(x-1,y+1) == Tile.WallBottom),
	(tilemap.get(x+0,y+1) == Tile.WallBottom),
	(tilemap.get(x+1,y+1) == Tile.WallBottom)
      );
    default:
      return -1;
    }
  };

  ctx.clearRect(0, 0, this.window.width, this.window.height);
  for (var y = 0; y < tilemap.height; y++) {
    var line = new Rectangle(0, y*ts, this.window.width, ts);
    for (var i = 0; i < this.actors.length; i++) {
      var actor = this.actors[i];
      if (actor.layer < 0 && actor.rect.overlap(line)) {
	actor.repaint(ctx, actor.rect.x-this.window.x, actor.rect.y-this.window.y);
      }
    }
    tilemap.render(ctx, this.game.images.tiles_floor, getFloor,
		   x0-this.window.x, y0-this.window.y+y*ts,
		   r.x, r.y+y, r.width+1, 1);
    tilemap.render(ctx, this.game.images.tiles_wall, getWall,
		   x0-this.window.x, y0-this.window.y+y*ts,
		   r.x, r.y+y, r.width+1, 1);
    for (var i = 0; i < this.actors.length; i++) {
      var actor = this.actors[i];
      if (0 <= actor.layer && actor.rect.overlap(line)) {
	actor.repaint(ctx, actor.rect.x-this.window.x, actor.rect.y-this.window.y);
      }
    }
  }
}
