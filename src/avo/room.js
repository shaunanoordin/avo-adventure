/*  
Room
====

(Shaun A. Noordin || shaunanoordin.com || 20170331)
********************************************************************************
 */

export class Room {
  constructor() {
    this.width = 1;
    this.height = 1;
    this.tileWidth = 64;
    this.tileHeight = 64;
    
    this.spritesheet = null;
    this.floorTiles = [];
    this.ceilingTiles = [];
    this.tileTypes = [];
  }
  
  getFloorTile(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    
    const index = y * this.width + x;
    if (this.floorTiles[index]) {
      return this.tileTypes[this.floorTiles[index]];
    }
    
    return null;
  }
}

export class RoomTile {
  constructor (name, spriteCol, spriteRow, solid) {
    this.name = name;
    this.sprite = {
      col: spriteCol,
      row: spriteRow,
    };
    this.solid = solid;
  }
}
