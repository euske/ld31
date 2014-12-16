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
  this.transitions = new Array(height);
  for (var i = 0; i < this.transitions.length; i++) {
    var row = new Array(width);
    for (var j = 0; j < row.length; j++) {
      row[j] = null;
    }
    this.transitions[i] = row;
  }
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
  for (var y = 0; y < this.transitions.length; y++) {
    var row = this.transitions[y];
    for (var x = 0; x < row.length; x++) {
      var transition = row[x];
      if (transition != null) {
	transition.idle(ticks);
	if (!transition.alive) {
	  row[x] = null;
	}
      }
    }
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

Scene.prototype.removeActor = function (actor)
{
  var i = this.actors.indexOf(actor);
  if (0 <= i) {
    this.actors.splice(i, 1);
  }
}

Scene.prototype.addTransition = function (x, y, transition)
{
  this.transitions[y][x] = transition;
}

Scene.prototype.clearTransition = function (x, y)
{
  this.transitions[y][x] = null;
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
      switch (rnd(20)) {
      case 0:
      case 1:	//	destroy empty floor
	if (tilemap.get(p.x, p.y) == Tile.Floor) {
	  this.startCollapsingFloor(ticks, p);
	}
	break;
      case 2:	//	create wall, damage & destroy ice in the way
	if (tilemap.get(p.x, p.y) == Tile.Floor) {
	  this.startFormingWall(ticks, p);
	} else if (tilemap.get(p.x, p.y) == Tile.Ice){
	  tilemap.set(p.x, p.y, Tile.IceCracking);
	} else if (tilemap.get(p.x, p.y) == Tile.IceCracking) {
	  tilemap.set(p.x, p.y, Tile.IceCracked);
	} else if (tilemap.get(p.x, p.y-1) == Tile.Floor ||
		   tilemap.get(p.x, p.y-1) == Tile.Empty && 
		   tilemap.get(p.x, p.y) == Tile.IceCracked) {
	  this.startCollapsingIce(ticks, p, Tile.WallBottom);
	}
	break;
      case 3:	//	create ice, destroy lava & spikes in the way
	if (tilemap.get(p.x, p.y) == Tile.Floor &&
	    tilemap.get(p.x, p.y+1) != Tile.WallBottom) {
	  this.startFormingIce(ticks, p);
	} else if (tilemap.get(p.x, p.y) == Tile.Lava) {
	  this.startCollapsingLava(ticks, p, Tile.Ice);
	} else if (tilemap.get(p.x, p.y) == Tile.Spikes) {
	  this.startCollapsingSpikes(p.x, p.y, Tile.Ice);
	}
	break;
      case 4:	//	create lava, destroy ice & spikes in the way
	if (tilemap.get(p.x, p.y) == Tile.Floor &&
	    tilemap.get(p.x, p.y+1) != Tile.WallBottom) {
	  this.startFormingLava(ticks, p);
	} else if (tilemap.get(p.x, p.y) == Tile.Ice ||
		   tilemap.get(p.x, p.y) == Tile.IceCracking ||
		   tilemap.get(p.x, p.y) == Tile.IceCracked) {
	  this.startCollapsingIce(ticks, p, Tile.Lava);
	} else if (tilemap.get(p.x, p.y) == Tile.Spikes) {
	  this.startCollapsingSpikes(ticks, p, Tile.Lava);
	}
	break;
      case 5:	//	create spikes, damage ice in the way
	if (tilemap.get(p.x, p.y) == Tile.Floor &&
	    tilemap.get(p.x, p.y+1) != Tile.WallBottom) {
	  this.startFormingSpikes(ticks, p);
	} else if (tilemap.get(p.x, p.y) == Tile.Ice) {
	  tilemap.set(p.x, p.y, Tile.IceCracking);
	} else if (tilemap.get(p.x, p.y) == Tile.IceCracking) {
	  tilemap.set(p.x, p.y, Tile.IceCracked);
	} else if (tilemap.get(p.x, p.y, Tile.IceCracked)) {
	  this.startCollapsingIce(ticks, p, Tile.Spikes);
	}
	break;
      case 6:	//	destroy wall (on its own)
	if (tilemap.get(p.x, p.y) == Tile.WallBottom) {
	  this.startCollapsingWall(ticks, p);
	}
	break;
      case 7:	//	damage and destroy ice (on its own/water)
	if (tilemap.get(p.x, p.y) == Tile.Ice) {
	  tilemap.set(p.x, p.y, Tile.IceCracking);
	} else if (tilemap.get(p.x, p.y) == Tile.IceCracking) {
	  tilemap.set(p.x, p.y, Tile.IceCracked);
	} else if (tilemap.get(p.x, p.y) == Tile.IceCracked) {
	  this.startCollapsingIce(ticks, p, 0);
	}
	break;
      case 8:	//	destroy lava (on its own)
	if (tilemap.get(p.x, p.y) == Tile.Lava) {
	  this.startCollapsingLava(ticks, p, 0);
	}
	break;
      case 9:	//	destroy spikes (on its own)
	if (tilemap.get(p.x, p.y) == Tile.Spikes) {
	  this.startCollapsingSpikes(ticks, p, 0);
	}
	break;
      }
    }
  }
}

Scene.prototype.startFormingLevel = function (ticks, rect, max_radius)
{
  var tilemap = this.tilemap;
  var max_size = 5;
  var r = tilemap.coord2map(rect);
  this.cracks = [];
  var bx = Math.floor(this.tilemap.width/2);
  var by = Math.floor(this.tilemap.height/2);
  for (var d = 0; d < max_radius; d++) {
    var cx = r.x + rnd(-(d+1), d+1);
    var cy = r.y + rnd(-(d+1), d+1);
    var w = Math.min(rnd(1, max_size), cx, tilemap.width-cx);
    var h = Math.min(rnd(1, max_size), cy, tilemap.height-cy);
    for (var dy = -h; dy <= h; dy++) {
      for (var dx = -w; dx <= w; dx++) {
	var p = new Point(cx+dx, cy+dy);
	if (Math.abs(bx-p.x) <= 10 &&
	    Math.abs(by-p.y) <= 10) {
	  // "If p is within the center 21x21 tiles and a floor tile is not already there"
	  this.startFormingFloor(ticks, p);
	}
      }
    }
    this.cracks.push(new Crack(cx, cy, w, h));
  }
}

Scene.prototype.startCollapsingAll = function (ticks)
{
  var tilemap = this.tilemap;
  for (var y = 0; y < tilemap.height; y++) {
    for (var x = 0; x < tilemap.width; x++) {
      var p = new Point(x, y);
      var c = tilemap.get(p.x, p.y);
      this.clearTransition(p.x, p.y);
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
  tr.layer = 0;
  tr.delay = rnd(1, this.game.framerate/6);
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.FloorFormingStart+i;
    if (Sprite.FloorFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Floor);
    }
  });
  tr.callback(0);
  if (tilemap.get(p.x, p.y) == Tile.Floor) {
    this.clearTransition(p.x, p.y);
  } else {
    this.addTransition(p.x, p.y, tr);
  }
}

Scene.prototype.startFormingWall = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_wall, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.rect.y += tr.rect.height-tr.sprites.height;
  tr.layer = 0;	// CHANGING THIS FROM -1 TO 0 FIXED THE RENDERING BUG YOU SAID WAS TOO COMPLICATED TO FIX :V
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.WallFormingStart+i;
    if (Sprite.WallFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y-1, Tile.WallTop);
      tilemap.set(p.x, p.y, Tile.WallBottom);
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startCollapsingFloor = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_floor, ticks);
  var fr = this.game.framerate;
  tr.rect = tilemap.map2coord(p);
  if (this.game.state == 4) { //	The break anim starts fast then plays slow. No clue why. Play it and you should notice what I mean.
    tr.delay = this.game.framerate/6;
  } else {
    tr.delay = this.game.framerate;
  }
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.FloorCollapsingStart+i;
    if (tr.sprite_index >= Sprite.FloorCollapsingBreak) {
      tr.delay = fr/2;
    } else {
      tr.delay = fr;
    }
    if (tr.sprite_index == Sprite.FloorCollapsingBreak) {
      tr.layer = 0;
      tilemap.set(p.x, p.y, Tile.Empty);
    } else if (Sprite.FloorCollapsingEnd < tr.sprite_index) {
      tr.alive = false;
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startCollapsingWall = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.sprites_wall, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.rect.y += tr.rect.height-tr.sprites.height;
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tilemap.set(p.x, p.y-1, Tile.Floor);
  tilemap.set(p.x, p.y, Tile.Floor);
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.WallCollapsingEnd-i;
    if (Sprite.WallCollapsingStart > tr.sprite_index) {
      tr.alive = false;
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startFormingIce = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_ice, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.IceFormingStart+i;
    if (Sprite.IceFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Ice);
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startFormingLava = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_lava, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.LavaFormingStart+i;
    if (Sprite.lavaFormingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Lava);
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startFormingSpikes = function (ticks, p)
{
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_spikes, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.SpikesStart+i;
    if (Sprite.SpikesEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Spikes);
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startCollapsingIce = function (ticks, p, c) // c is what condition caused the tile to change
{
  var scene = this;
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_ice, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 1;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.IceBreakingStart+i;
    if (Sprite.IceBreakingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Floor);
      if (c == Tile.WallBottom) {
	scene.startFormingWall(ticks, p);
      } else if (c == Tile.Lava) {
	scene.startFormingLava(ticks, p);
      } else if (c == Tile.Spikes) {
	scene.startFormingSpikes(ticks, p);
      }
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startCollapsingLava = function (ticks, p, c)
{
  var scene = this;
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_lava, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.LavaBreakingStart+i;
    if (Sprite.LavaBreakingEnd < tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Floor);
      if (c == Tile.Ice) {
	scene.startFormingIce(ticks, p);
      }
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.startCollapsingSpikes = function (ticks, p, c)
{
  var scene = this;
  var tilemap = this.tilemap;
  var tr = new Transition(this.game.images.tiles_spikes, ticks);
  tr.rect = tilemap.map2coord(p);
  tr.layer = 0;
  tr.delay = this.game.framerate/6;
  tr.callback = (function(i) {
    tr.sprite_index = Sprite.SpikesEnd-i;
    if (Sprite.SpikesStart > tr.sprite_index) {
      tr.alive = false;
      tilemap.set(p.x, p.y, Tile.Floor);
      if (c == Tile.Ice) {
	scene.startFormingIce(ticks, p);
      } else if (c == Tile.Lava) {
	scene.startFormingLava(ticks, p);
      }
    }
  });
  tr.callback(0);
  this.addTransition(p.x, p.y, tr);
}

Scene.prototype.repaint = function (ctx)
{
  var ts = this.tilesize;
  var scene = this;
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
/*      return Tile.getSideFloor(
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
      );*/
      return Tile.getSideFloor(
	(tilemap.get(x-1,y-1) == Tile.Floor ||
	 tilemap.get(x-1,y-1) >= Tile.WallBottom),
	(tilemap.get(x+0,y-1) == Tile.Floor ||
	 tilemap.get(x+0,y-1) >= Tile.WallBottom),
	(tilemap.get(x+1,y-1) == Tile.Floor ||
	 tilemap.get(x+1,y-1) >= Tile.WallBottom),
	(tilemap.get(x-1,y+0) == Tile.Floor ||
	 tilemap.get(x-1,y+0) >= Tile.WallBottom),
	(tilemap.get(x+1,y+0) == Tile.Floor ||
	 tilemap.get(x+1,y+0) >= Tile.WallBottom),
	(tilemap.get(x-1,y+1) == Tile.Floor ||
	 tilemap.get(x-1,y+1) >= Tile.WallBottom),
	(tilemap.get(x+0,y+1) == Tile.Floor ||
	 tilemap.get(x+0,y+1) >= Tile.WallBottom),
	(tilemap.get(x+1,y+1) == Tile.Floor ||
	 tilemap.get(x+1,y+1) >= Tile.WallBottom)
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
    var row = this.transitions[y];
    for (var x = 0; x < row.length; x++) {
      var transition = row[x];
      if (transition != null && transition.layer < 0) {
	transition.repaint(ctx,
			   transition.rect.x-this.window.x,
			   transition.rect.y-this.window.y);
      }
    }
    tilemap.render(ctx, this.game.images.tiles_floor, getFloor,
		   x0-this.window.x, y0-this.window.y+y*ts,
		   r.x, r.y+y, r.width+1, 1);
    tilemap.render(ctx, this.game.images.tiles_wall, getWall,
		   x0-this.window.x, y0-this.window.y+y*ts,
		   r.x, r.y+y, r.width+1, 1);
    for (var x = 0; x < row.length; x++) {
      var transition = row[x];
      if (transition != null && 0 <= transition.layer) {
	transition.repaint(ctx,
			   transition.rect.x-this.window.x,
			   transition.rect.y-this.window.y);
      }
    }
    for (var i = 0; i < this.actors.length; i++) {
      var actor = this.actors[i];
      if (actor.rect.overlap(line)) {
	actor.repaint(ctx,
		      actor.rect.x-this.window.x,
		      actor.rect.y-this.window.y);
      }
    }
  }
}
