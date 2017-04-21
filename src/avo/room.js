/*  
Room
====

(Shaun A. Noordin || shaunanoordin.com || 20170331)
********************************************************************************
 */

export class Room {
  constructor() {
    this.width = 5;
    this.height = 5;
    this.tileWidth = 64;
    this.tileHeight = 64;
    
    this.spritesheet = null;
    this.floorTiles = [
      0, 1, 1, 1, 0,
      1, 0, 0, 0, 1,
      1, 0, 1, 0, 1,
      1, 0, 0, 0, 1,
      0, 1, 1, 1, 0,
    ];
    this.ceilingTiles = [];
    this.tileTypes = [
      new RoomTile()
    ];
  }
}

export class RoomTile {
  constructor () {
    
  }
}
