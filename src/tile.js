// tile.js
// "Tile" is a static image for a non-animated object.

Tile = {
  Empty: 0,
  Floor: 1,
  WallTop: 2,
  WallBottom: 3,
};

Tile.getFloor = function ()
{
  return 1;
}

Tile.getSideFloor = function (ul,uu,ur, ll, rr, dl,dd,dr)
{
  if (!ul && !uu && ur && !ll && !rr && !dl && !dd && !dr) {
    return 2;
  } else if (uu && !ll && !rr && !dl && !dd && !dr) {
    return 3;
  } else if (ul && !uu && !ur && !ll && !rr && !dl && !dd && !dr) {
    return 4;
  } else if (uu && ll && !rr && !dd && !dr) {
    return 5;
  } else if (uu && !ll && rr && !dl && !dd) {
    return 6;
  } else if (!uu && !ur && ll && !rr && dd) {
    return 7;
  } else if (!ul && !uu && !ll && rr && dd) {
    return 8;
  } else if (!uu && ll && rr && dd) {
    return 9;
  } else if (uu && ll && !rr && dd) {
    return 10;
  } else if (uu && !ll && rr && dd) {
    return 11;
  } else if (uu && ll && rr && !dd) {
    return 12;
  } else if (uu && ll && rr && dd) {
    return 13;
  } else if (!uu && !ur && ll && !rr && !dd && !dr) {
    return 14;
  } else if (!ul && !uu && !ll && rr && !dl && !dd) {
    return 15;
  } else if (!uu && ll && rr && !dd) {
    return 16;
  } else if (!ul && !uu && !ur && !ll && !rr && !dl && !dd && dr) {
    return 17;
  } else if (!ul && !uu && !ur && !ll && !rr && dd) {
    return 18;
  } else if (!ul && !uu && !ur && !ll && !rr && dl && !dd && !dr) {
    return 19;
  } else if (!ul && !uu && ur && !ll && !rr && dl && !dd && !dr) {
    return 20;
  } else if (ul && !uu && !ur && !ll && !rr && !dl && !dd && dr) {
    return 21;
  } else if (!ul && !uu && !ll && rr && dl && !dd) {
    return 22;
  } else if (!uu && !ur && ll && !rr && !dd && dr) {
    return 23;
  } else if (!uu && ur && ll && !rr && !dd && !dr) {
    return 24;
  } else if (ul && !uu && !ll && rr && !dl && !dd) {
    return 25;
  } else if (uu && ll && !rr && !dd && dr) {
    return 26;
  } else if (uu && !ll && rr && dl && !dd) {
    return 27;
  } else if (!uu && ur && ll && !rr && dd) {
    return 28;
  } else if (ul && !uu && !ll && rr && dd) {
    return 29;
  } else if (!ul && !uu && ur && !ll && !rr && dd) {
    return 30;
  } else if (ul && !uu && !ur && !ll && !rr && dd) {
    return 31;
  } else if (ul && !uu && ur && !ll && !rr && !dl && !dd && !dr) {
    return 32;
  } else if (ul && !uu && ur && !ll && !rr && dl && !dd && !dr) {
    return 33;
  } else if (ul && !uu && ur && !ll && !rr && !dl && !dd && dr) {
    return 34;
  } else if (ul && !uu && ur && !ll && !rr && dl && !dd && dr) {
    return 35;
  } else if (uu && !ll && !rr && dl && !dd && !dr) {
    return 36;
  } else if (uu && !ll && !rr && !dl && !dd && dr) {
    return 37;
  } else if (uu && !ll && !rr && dl && !dd && dr) {
    return 38;
  } else if (!uu && ur && ll && !rr && !dd && dr) {
    return 39;
  } else if (ul && !uu && !ll && rr && dl && !dd) {
    return 40;
  } else if (!ul && !uu && ur && !ll && !rr && dl && !dd && dr) {
    return 41;
  } else if (ul && !uu && !ur && !ll && !rr && dl && !dd && dr) {
    return 42;
  } else if (uu && !ll && !rr && dd) {
    return 43;
  } else if (ul && !uu && ur && !ll && !rr && dd) {
    return 44;
  } else if (!ul && !uu && ur && !ll && !rr && !dl && !dd && dr) {
    return 45;
  } else if (ul && !uu && !ur && !ll && !rr && dl && !dd && !dr) {
    return 46;
  } else {
    return 0;
  }
}

// Wall Tiles are 2.5x + 3px tall and overlap eachother
// 	Walls at top of screen are rendered below walls closer to bottom
//	Player at y=0 collides with tiles at y=0 and y=1 (2 tile collision)
//
Tile.getWall = function (ul,uu,ur,ll,rr,dl,dd,dr)
{
  if (uu && !dl && !dr) {
    return 1;
  } else if (uu && dl && !dr) {
    return 2;
  } else if (uu && !dl && dr) {
    return 3;
  } else if (uu && dl && dr) {
    return 4;
	
  } else if (!ul && !uu && !ur && !dl && !dr) {
    return 5;
  } else if (ul && !uu && !ur && !dl && !dr) {
    return 6;
  } else if (!ul && !uu && ur && !dl && !dr) {
    return 7;
  } else if (ul && !uu && ur && !dl && !dr) {
    return 8;
	
  } else if (!ul && !uu && !ur && dl && !dr) {
    return 9;
  } else if (ul && !uu && !ur && dl && !dr) {
    return 10;
  } else if (!ul && !uu && ur && dl && !dr) {
    return 11;
  } else if (ul && !uu && ur && dl && !dr) {
    return 12;
	
  } else if (!ul && !uu && !ur && !dl && dr) {
    return 13;
  } else if (ul && !uu && !ur && !dl && dr) {
    return 14;
  } else if (!ul && !uu && ur && !dl && dr) {
    return 15;
  } else if (ul && !uu && ur && !dl && dr) {
    return 16;
	
  } else if (!ul && !uu && !ur && dl && dr) {
    return 17;
  } else if (ul && !uu && !ur && dl && dr) {
    return 18;
  } else if (!ul && !uu && ur && dl && dr) {
    return 19;
  } else if (ul && !uu && ur && dl && dr) {
    return 20;
  } else {
    return 0;
  }
}

Tile.getSideWall = function (ul,uu,ur,ll,rr)
{
  if (!uu && ur && !ll && rr) {
    return 21;
  } else if (ul && !uu && ll && !rr) {
    return 22;
  } else if (ul && !uu && ur && ll && rr) {
    return 23;
	
  } else if (!uu && !ur && !ll && rr) {
    return 24;
  } else if (!ul && !uu && ll && !rr) {
    return 25;
  } else if (!ul && !uu && !ur && ll && rr) {
    return 26;
	
  } else if (uu && !ll && rr) {
    return 27;
  } else if (uu && ll && !rr) {
    return 28;
  } else if (uu && ll && rr) {
    return 29;
	
  } else if (ul && !uu && !ur && ll && rr) {
    return 30;
  } else if (!ul && !uu && ur && ll && rr) {
    return 31;
  } else {
    return 0;
  }
}