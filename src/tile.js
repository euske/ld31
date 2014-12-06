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
  } else if (ul && !uu && !ur && ll && !rr && dl && !dd && !dr) {
    return 14;
  } else if (!ul && !uu && ur && !ll && rr && !dl && !dd && dr) {
    return 15;
  } else if (ul && !uu && ur && ll && rr && dl && !dd && dr) {
    return 16;
  } else if (!ul && !uu && !ur && !ll && !rr && !dl && !dd && dr) {
    return 17;
  } else if (!ul && !uu && !ur && !ll && !rr && dl && dd && dr) {
    return 18;
  } else if (!ul && !uu && !ur && !ll && !rr && dl && !dd && !dr) {
    return 19;
  } else if (!ul && !uu && ur && !ll && !rr && dl && !dd && !dr) {
    return 20;
  } else if (ul && !uu && !ur && !ll && !rr && !dl && !dd && dr) {
    return 21;
  } else if (!ul && !uu && ur && !ll && rr && dl && !dd && dr) {
    return 22;
  } else if (ul && !uu && !ur && ll && !rr && dl && !dd && dr) {
    return 23;
  } else if (ul && !uu && ur && ll && !rr && dl && !dd && !dr) {
    return 24;
  } else if (ul && !uu && ur && !ll && rr && !dl && !dd && dr) {
    return 25;
  } else if (ul && uu && ur && ll && !rr && dl && !dd && dr) {
    return 26;
  } else if (ul && uu && ur && !ll && rr && dl && !dd && dr) {
    return 27;
  } else if (ul && !uu && ur && ll && !rr && dl && dd && dr) {
    return 28;
  } else if (ul && !uu && ur && !ll && rr && dl && dd && dr) {
    return 29;
  } else if (!ul && !uu && ur && !ll && !rr && dl && dd && dr) {
    return 30;
  } else if (ul && !uu && !ur && !ll && !rr && dl && dd && dr) {
    return 31;
  } else if (ul && !uu && ur && !ll && !rr && !dl && !dd && !dr) {
    return 32;
  } else if (ul && !uu && ur && !ll && !rr && dl && !dd && !dr) {
    return 33;
  } else if (ul && !uu && ur && !ll && !rr && !dl && !dd && dr) {
    return 34;
  } else if (ul && !uu && ur && !ll && !rr && dl && !dd && dr) {
    return 35;
  } else if (ul && uu && ur && !ll && !rr && dl && !dd && !dr) {
    return 36;
  } else if (ul && uu && ur && !ll && !rr && !dl && !dd && dr) {
    return 37;
  } else if (ul && uu && ur && !ll && !rr && dl && !dd && dr) {
    return 38;
  } else if (ul && !uu && ur && ll && !rr && dl && !dd && dr) {
    return 39;
  } else if (ul && !uu && ur && !ll && rr && dl && !dd && dr) {
    return 40;
  } else if (!ul && !uu && ur && !ll && !rr && dl && !dd && dr) {
    return 41;
  } else if (ul && !uu && !ur && !ll && !rr && dl && !dd && dr) {
    return 42;
  } else if (uu && !ll && !rr && dd) {
    return 43;
  } else {
    return 0;
  }
}
