// sprite.js
// "Sprite" is a static image shown in each animation frame for Actors.

Sprite = {
  // player.png
  Player: 0,
  
  // shadow.png
  PlayerShadow: 1,
  
  // spritesheet_floor.png
  FloorFormingStart: 0,
  FloorFormingEnd: 4,
  FloorCollapsingStart: 5,
  FloorCollapsingBreak: 7,
  FloorCollapsingEnd: 10,
  
  // spritesheet_walls.png
  WallFormingStart: 0,
  WallFormingEnd: 4,
  WallCollapsingStart: 4,
  WallCollapsingEnd: 8,
  
  // tilemap_lava.png
  LavaFormingStart: 0,
  LavaFormingEnd: 3,
  LavaIdleStart: 4,
  LavaIdleEnd: 11,
  LavaBreakingStart: 12,
  LavaBreakingEnd: 15,
  
  // spritesheet_lava.png
  LavaDropFallingStart: 0,
  LavaDropFallingEnd: 3,
  LavaDropLandingStart: 4,
  LavaDropLandingEnd: 6,
  
  // tilemap_ice.png
  IceFormingStart: 0,
  IceFormingEnd: 2,
  IceIdleStart: 3,
  IceIdleEnd: 8,
  IceCrackedIdleStart: 9,
  IceCrackedIdleEnd: 14,
  IceCrackedMoreIdleStart: 15,
  IceCrackedMoreIdleEnd: 20,
  IceBreakingStart: 21,
  IceBreakingEnd: 23,
  
  // spritesheet_ice.png
  IceDropFallingStart: 0,
  IceDropFallingEnd: 3,
  IceDropLandingStart: 4,
  IceDropLandingEnd: 5,
  
  // tilemap_spikes.png
  SpikeFormingStart: 0,
  SpikeFormingEnd: 2,
  SpikeBreakingStart: 2,
  SpikeBreakingEnd: 4,
};
