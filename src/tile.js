// tile.js

Tile = {
  Empty: 0,
  Floor: 1,
  Block: 100,
  Cake: 101,
};

Tile.getSide = function (ul,uu,ur, ll, rr, dl,dd,dr)
{
  if (!ul && !uu && ur && !ll && !rr && !dl && !dd && !dr) {
    return 2;
  } else if (uu && !ll && !rr && !dl && !dd && !dr) {
    return 3;
  } else if (ul && !uu && !ur && !ll && !rr && !dl && !dd && !dr) {
    return 4;
  } else if (uu && ll && !rr && !dd && !dr) {
    return 5;
  } else if (uu && rr && !ll && !dd && !dl) {
    return 6;
  } else if (dd && ll && !uu && !rr && !ur) {
    return 7;
  } else if (dd && rr && !uu && !ll && !ul) {
    return 8;
  } else if (uu && ll && dd && !rr) {
    return 10;
  } else if (uu && ll && dd && rr) {
    return 13;
  } else if (ll && !uu && !ur && !rr && !dr && dd) {
    return 15;
  } else if (rr && !uu && !ul && !ll && !dl && dd) {
    return 16;
  } else if (uu && rr && dd && !ll) {
    return 18;
  } else {
    return 0;
  }
}
