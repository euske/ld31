// tilemap.js

function TileMap(tilesize, tiles, map)
{
  this.tilesize = tilesize;
  this.tiles = tiles;
  this.map = map;
  this.width = map[0].length;
  this.height = map.length;
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
TileMap.prototype.render = function (ctx, x, y, w, h)
{
  var ts = this.tilesize;
  x = (typeof(x) !== 'undefined')? x : 0;
  y = (typeof(y) !== 'undefined')? y : 0;
  w = (typeof(w) !== 'undefined')? w : this.width;
  h = (typeof(h) !== 'undefined')? h : this.height;
  for (var dy = 0; dy < h; dy++) {
    for (var dx = 0; dx < w; dx++) {
      var c = this.get(x+dx, y+dy);
      ctx.drawImage(this.tiles,
		    ts*c, 0, ts, ts,
		    ts*dx, ts*dy, ts, ts);
    }
  }
}
TileMap.prototype.apply = function (rect, f)
{
  var ts = this.tilesize;
  var x0 = Math.floor(rect.x/ts);
  var y0 = Math.floor(rect.y/ts);
  var x1 = Math.ceil((rect.x+rect.width)/ts);
  var y1 = Math.ceil((rect.y+rect.height)/ts);
  for (var y = y0; y < y1; y++) {
    for (var x = x0; x < x1; x++) {
      if (f(x, y)) {
	return true;
      }
    }
  }
  return false;
}
TileMap.prototype.collide = function (rect, v, f)
{
  var ts = this.tilesize;
  var r = rect.copy();
  r.move(v.x, v.y);
  r = r.union(rect);
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
