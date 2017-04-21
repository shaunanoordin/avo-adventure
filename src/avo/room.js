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
}

export class RoomTile {
  constructor (name, spriteCol, spriteRow) {
    this.name = name;
    this.sprite = {
      col: spriteCol,
      row: spriteRow,
    };
  }
}
