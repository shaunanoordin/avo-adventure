import { Room, RoomTile } from "../avo/room.js";

export class FirstRoom extends Room {
  constructor(spritesheet) {
    super();
    
    this.width = 5;
    this.height = 5;
    this.tileWidth = 64;
    this.tileHeight = 64;
    
    this.spritesheet = spritesheet;
    this.floorTiles = [
      0, 1, 1, 1, 0,
      1, 0, 0, 0, 1,
      1, 0, 1, 0, 1,
      1, 0, 0, 0, 1,
      0, 1, 1, 1, 0,
    ];
    this.ceilingTiles = [];
    this.tileTypes = [
      new RoomTile('ZERO', 0, 0),
      new RoomTile('ONE', 0, 1),
    ];
  }
}
