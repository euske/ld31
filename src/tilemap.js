// tilemap.js
// TileMap is a generic framework that handles a scrollable tile map.
// A game can have multiple TileMaps.

function TileMap(tilesize, tiles, map)
{
  this.tilesize = tilesize;
  this.tiles = tiles;
  this.map = map;
  this.width = map[0].length;
  this.height = map.length;
  this.image = document.createElement('canvas');
  this.image.width = tilesize*(this.width+1);
  this.image.height = tilesize*(this.height+1);
  this.window = new Rectangle(-1, -1, 0, 0);
}

TileMap.prototype.get = function (x, y)
{
  if (0 <= x && 0 <= y && x < this.width && y < this.height) {
    return this.map[y][x];
  } else {
    return -1;
  }
}

TileMap.prototype.set = function (x, y, v)
{
  if (0 <= x && 0 <= y && x < this.width && y < this.height) {
    this.map[y][x] = v;
  }
}

TileMap.prototype.invalidate = function ()
{
  this.window.x = -1;
  this.window.y = -1;
}

TileMap.prototype.update = function (rect, f)
{
  f = (typeof(f) !== 'undefined')? f : this.get;
  if (!this.window.equals(rect)) {
    this.window = rect;
    this.render(rect.x, rect.y, rect.width+1, rect.height+1, f);
  }
}

TileMap.prototype.render = function (x, y, w, h, f)
{
  var ts = this.tilesize;
  var ctx = this.image.getContext('2d');
  ctx.clearRect(0, 0, ts*w, ts*h);
  for (var dy = 0; dy < h; dy++) {
    for (var dx = 0; dx < w; dx++) {
      var c = f(x+dx, y+dy);
      if (0 <= c) {
	// Align the bottom left corner.
	ctx.drawImage(this.tiles,
		      ts*c, 0,
		      ts, this.tiles.height,
		      ts*dx, ts*dy+ts-this.tiles.height,
		      ts, this.tiles.height);
      }
    }
  }
}

TileMap.prototype.coord2map = function (rect)
{
  var ts = this.tilesize;
  var x0 = Math.floor(rect.x/ts);
  var y0 = Math.floor(rect.y/ts);
  var x1, y1;
  if (rect instanceof Rectangle) {
    x1 = Math.ceil((rect.x+rect.width)/ts);
    y1 = Math.ceil((rect.y+rect.height)/ts);
  } else {
    x1 = x0+1;
    y1 = y0+1;
  }
  return new Rectangle(x0, y0, x1-x0, y1-y0);
}

TileMap.prototype.map2coord = function (rect)
{
  var ts = this.tilesize;
  if (rect instanceof Rectangle) {
    return new Rectangle(rect.x*ts, rect.y*ts,
			 rect.width*ts, rect.height*ts);
  } else {
    return new Rectangle(rect.x*ts, rect.y*ts, ts, ts);
  }
}

TileMap.prototype.apply = function (rect, f)
{
  for (var dy = 0; dy < rect.height; dy++) {
    for (var dx = 0; dx < rect.width; dx++) {
      if (f(rect.x+dx, rect.y+dy)) {
	return true;
      }
    }
  }
  return false;
}

TileMap.prototype.collide = function (rect, v, f)
{
  var ts = this.tilesize;
  var r = rect.move(v.x, v.y).union(rect);
  var x0 = Math.floor(r.x/ts);
  var y0 = Math.floor(r.y/ts);
  var x1 = Math.ceil((r.x+r.width)/ts);
  var y1 = Math.ceil((r.y+r.height)/ts);
  for (var y = y0; y < y1; y++) {
    for (var x = x0; x < x1; x++) {
      if (f(this.get(x, y))) {
	var bounds = new Rectangle(x*ts, y*ts, ts, ts);
	v = collideRect(bounds, rect, v);
      }
    }
  }
  return v;
}
