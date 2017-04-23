import { Room, RoomTile } from "../avo/room.js";

export class FirstRoom extends Room {
  constructor(spritesheet) {
    super();
    
    this.width = 10;
    this.height = 8;
    this.tileWidth = 64;
    this.tileHeight = 64;
    
    this.spritesheet = spritesheet;
    this.floorTiles = [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 1, 1, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 2, 2, 1, 2,
      2, 1, 1, 1, 1, 1, 1, 1, 1, 2,
      2, 1, 2, 1, 1, 1, 1, 2, 2, 2,
      2, 1, 2, 1, 1, 1, 1, 2, 1, 2,
      2, 1, 2, 1, 1, 1, 1, 1, 1, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ];
    this.ceilingTiles = [
      3, 0, 0, 0, 0, 0, 0, 3, 0, 3,
      3, 0, 0, 0, 0, 0, 3, 3, 0, 3,
      3, 0, 0, 0, 0, 0, 0, 0, 0, 3,
      3, 0, 3, 0, 0, 0, 0, 3, 3, 3,
      3, 0, 3, 0, 0, 0, 0, 3, 0, 3,
      3, 0, 3, 0, 0, 0, 0, 0, 0, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    this.tileTypes = [
      new RoomTile('NOTHING', 0, 0),
      new RoomTile('PLAIN_FLOOR', 1, 0),
      new RoomTile('WALL', 0, 1),
      new RoomTile('CEILING', 1, 1),
    ];
  }
}
