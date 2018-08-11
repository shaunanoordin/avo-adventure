/*
Example Adventure
=================

While AvO is the adventure game engine, this is a specific implementation of an
adventure game idea.

(Shaun A. Noordin || shaunanoordin.com || 20170329)
********************************************************************************
 */

import * as AVO from  "../avo/constants.js";
import { Story } from "../avo/story.js";
import { ComicStrip } from "../avo/comic-strip.js";
import { Actor, Zone } from "../avo/entities.js";
import { Utility, ImageAsset } from "../avo/utility.js";
import { Physics } from "../avo/physics.js";

import { FirstRoom } from "./rooms.js";

export class ExampleAdventure extends Story {
  constructor() {
    super();
    this.init = this.init.bind(this);
    this.run_start = this.run_start.bind(this);
    this.run_action = this.run_action.bind(this);
    this.prePaint = this.prePaint.bind(this);
    
    this.playComic1 = this.playComic1.bind(this);
    this.finishComic1 = this.finishComic1.bind(this);
    this.prepareRoom = this.prepareRoom.bind(this);
    this.enterFirstRoom = this.enterFirstRoom.bind(this);
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.debugMode = true;
    //--------------------------------
    
    //Images
    //--------------------------------
    avo.assets.images.actor = new ImageAsset("assets/example-adventure/actor-female-2017-07.png");
    avo.assets.images.boxes = new ImageAsset("assets/example-nonita-60/boxes.png");
    avo.assets.images.plates = new ImageAsset("assets/example-nonita-60/plates.png");
    avo.assets.images.walls = new ImageAsset("assets/example-nonita-60/walls.png");
    avo.assets.images.roomTiles = new ImageAsset("assets/example-adventure/room-tiles.png");
    
    avo.assets.images.comicPanel1A = new ImageAsset("assets/example-adventure/comic-panel-1a.png");
    //--------------------------------
    
    //Animations
    //--------------------------------
    const STEPS_PER_SECOND = AVO.FRAMES_PER_SECOND / 10;
    avo.animationSets = {
      actor: {
        rule: AVO.ANIMATION_RULE_DIRECTIONAL,
        tileWidth: 64,
        tileHeight: 64,
        tileOffsetX: 0,
        tileOffsetY: -24,  //-16,
        actions: {
          idle: {
            loop: true,
            steps: [
              { row: 0, duration: 1 }
            ],
          },
          moving: {
            loop: true,
            steps: [
              { row: 1, duration: STEPS_PER_SECOND },
              { row: 2, duration: STEPS_PER_SECOND * 2 },
              { row: 1, duration: STEPS_PER_SECOND },
              { row: 3, duration: STEPS_PER_SECOND * 2 },
            ],
          },
        },
      },

      box: {
        rule: AVO.ANIMATION_RULE_BASIC,
        tileWidth: 32,
        tileHeight: 64,
        tileOffsetX: 0,
        tileOffsetY: -16,
        actions: {
          idle: {
            loop: true,
            steps: [
              { col: 1, row: 0, duration: 1 }
            ],
          },

          red: {
            loop: true,
            steps: [
              { col: 0, row: 1, duration: 1 }
            ],
          },
          red_glow: {
            loop: true,
            steps: [
              { col: 1, row: 1, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 1, duration: STEPS_PER_SECOND },
              { col: 3, row: 1, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 1, duration: STEPS_PER_SECOND },
            ],
          },

          blue: {
            loop: true,
            steps: [
              { col: 0, row: 2, duration: 1 }
            ],
          },
          blue_glow: {
            loop: true,
            steps: [
              { col: 1, row: 2, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 2, duration: STEPS_PER_SECOND },
              { col: 3, row: 2, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 2, duration: STEPS_PER_SECOND },
            ],
          },

          yellow: {
            loop: true,
            steps: [
              { col: 0, row: 3, duration: 1 }
            ],
          },
          yellow_glow: {
            loop: true,
            steps: [
              { col: 1, row: 3, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 3, duration: STEPS_PER_SECOND },
              { col: 3, row: 3, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 3, duration: STEPS_PER_SECOND },
            ],
          },
        },
      },

      plate: {
        rule: AVO.ANIMATION_RULE_BASIC,
        tileWidth: 64,
        tileHeight: 64,
        tileOffsetX: 0,
        tileOffsetY: 0,
        actions: {
          idle: {
            loop: true,
            steps: [
              { col: 0, row: 0, duration: 1 }
            ],
          },

          red: {
            loop: true,
            steps: [
              { col: 0, row: 1, duration: 1 }
            ],
          },
          red_glow: {
            loop: true,
            steps: [
              { col: 1, row: 1, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 1, duration: STEPS_PER_SECOND },
              { col: 3, row: 1, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 1, duration: STEPS_PER_SECOND },
            ],
          },

          blue: {
            loop: true,
            steps: [
              { col: 0, row: 2, duration: 1 }
            ],
          },
          blue_glow: {
            loop: true,
            steps: [
              { col: 1, row: 2, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 2, duration: STEPS_PER_SECOND },
              { col: 3, row: 2, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 2, duration: STEPS_PER_SECOND },
            ],
          },

          yellow: {
            loop: true,
            steps: [
              { col: 0, row: 3, duration: 1 }
            ],
          },
          yellow_glow: {
            loop: true,
            steps: [
              { col: 1, row: 3, duration: STEPS_PER_SECOND * 10 },
              { col: 2, row: 3, duration: STEPS_PER_SECOND },
              { col: 3, row: 3, duration: STEPS_PER_SECOND * 5 },
              { col: 2, row: 3, duration: STEPS_PER_SECOND },
            ],
          },
        },
      },

      wall: {
        rule: AVO.ANIMATION_RULE_BASIC,
        tileWidth: 512,
        tileHeight: 128,
        tileOffsetX: 0,
        tileOffsetY: 0,
        actions: {
          long_wall: {
            loop: true,
            steps: [
              { col: 0, row: 0, duration: 1 }
            ],
          },
          short_wall: {
            loop: true,
            steps: [
              { col: 0, row: 1, duration: 1 }
            ],
          },
        },
      },
    };

    //Process Animations; expand steps to many frames per steps.
    for (let animationTitle in avo.animationSets) {
      let animationSet = avo.animationSets[animationTitle];
      for (let animationName in animationSet.actions) {
        let animationAction = animationSet.actions[animationName];
        let newSteps = [];
        for (let step of animationAction.steps) {
          for (let i = 0; i < step.duration; i++) { newSteps.push(step); }
        }
        animationAction.steps = newSteps;
      }
    }
    //--------------------------------
    
    //Rooms
    //--------------------------------
    this.rooms = {
      first: new FirstRoom(avo.assets.images.roomTiles),
    };
    //--------------------------------
  }
  
  run_start() {
    const avo = this.avo;
    
    //DEBUG INSTANT START
    //if (avo.config.debugMode) this.avo.changeState(AVO.STATE_ACTION, this.enterFirstRoom);
    if (avo.config.debugMode) this.avo.changeState(AVO.STATE_DIALOGUE, this.enterFirstRoom);
    
    if (avo.pointer.state === AVO.INPUT_ACTIVE || 
        avo.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
      avo.changeState(AVO.STATE_COMIC, this.playComic1);
    }
  }
  
  playComic1() {
    const avo = this.avo;
    avo.comicStrip = new ComicStrip(
      "comic_1",
      [ avo.assets.images.comicPanel1A,
        //avo.assets.images.comicPanel1B,
        //avo.assets.images.comicPanel1C,
      ],
      this.finishComic1
    );
  }
  
  finishComic1() {
    this.avo.changeState(AVO.STATE_ACTION, this.enterFirstRoom);
  }
  
  prepareRoom() {
    const avo = this.avo;
    
    //Reset
    let player = avo.playerActor;
    avo.actors = [];
    avo.zones = [];
    avo.refs = {};
    
    //Create the player character if she doesn't yet exist.
    if (!player) {
      avo.playerActor = new Actor("PLAYER", 8 * 32, 8 * 32, 32, AVO.SHAPE_CIRCLE);
      avo.playerActor.spritesheet = avo.assets.images.actor;
      avo.playerActor.animationSet = avo.animationSets.actor;
      avo.playerActor.attributes[AVO.ATTR.SPEED] = 4;
      avo.playerActor.rotation = AVO.ROTATION_SOUTH;
      avo.actors.push(avo.playerActor);
    } else {
      avo.playerActor = player;
      avo.actors.push(avo.playerActor);
    }
    
    avo.camera.targetActor = avo.playerActor;
  }
  
  enterFirstRoom() {
    const avo = this.avo;    
    this.prepareRoom();
    
    avo.room = this.rooms.first;
    
    let newActor, newZone;
    
    //Colour plates
    //----------------------------------------------------------------
    newZone = new Zone("red_plate", 3 * 32, 8 * 32, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, []);
    avo.zones.push(newZone);
    avo.refs[newZone.name] = newZone;
    newZone.spritesheet = avo.assets.images.plates;
    newZone.animationSet = avo.animationSets.plate;
    newZone.playAnimation("red");
    
    newZone = new Zone("yellow_plate", 8 * 32, 5 * 32, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, []);
    avo.zones.push(newZone);
    avo.refs[newZone.name] = newZone;
    newZone.spritesheet = avo.assets.images.plates;
    newZone.animationSet = avo.animationSets.plate;
    newZone.playAnimation("yellow");
    
    newZone = new Zone("blue_plate", 13 * 32, 8 * 32, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, []);
    avo.zones.push(newZone);
    avo.refs[newZone.name] = newZone;
    newZone.spritesheet = avo.assets.images.plates;
    newZone.animationSet = avo.animationSets.plate;
    newZone.playAnimation("blue");
    //----------------------------------------------------------------
    
    //Colour boxes
    //----------------------------------------------------------------
    newActor = new Actor("red_box", 8 * 32, 5 * 32, 32, AVO.SHAPE_SQUARE);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.spritesheet = avo.assets.images.boxes;
    newActor.animationSet = avo.animationSets.box;
    newActor.shadowSize = 1.2;
    newActor.playAnimation("red");
    
    newActor = new Actor("yellow_box", 13 * 32, 8 * 32 - 8, 32, AVO.SHAPE_SQUARE);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.spritesheet = avo.assets.images.boxes;
    newActor.animationSet = avo.animationSets.box;
    newActor.shadowSize = 1.2;
    newActor.playAnimation("yellow");
    
    newActor = new Actor("blue_box", 3 * 32, 8 * 32, 32, AVO.SHAPE_SQUARE);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.spritesheet = avo.assets.images.boxes;
    newActor.animationSet = avo.animationSets.box;
    newActor.shadowSize = 1.2;
    newActor.playAnimation("blue");
    //----------------------------------------------------------------
    
    /*
    //Message (birthday wish) Wall
    //----------------------------------------------------------------
    newActor = new Actor("wish_wall", 8 * 32, 0 * 32, 0, AVO.SHAPE_POLYGON);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.shapePolygonPath = [-256, -64, 256, -64, 256, 64, -256, 64];
    newActor.movable = false;
    newActor.spritesheet = avo.assets.images.walls;
    newActor.animationSet = avo.animationSets.wall;
    newActor.playAnimation("long_wall");
    
    newActor = new Actor("wall_left", 4 * 32, 0.5 * 32, 0, AVO.SHAPE_POLYGON);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.shapePolygonPath = [-128, -64, 128, -64, 128, 64, -128, 64];
    newActor.movable = false;
    newActor.spritesheet = avo.assets.images.walls;
    newActor.animationSet = avo.animationSets.wall;
    newActor.playAnimation("short_wall");
    
    newActor = new Actor("wall_right", 12 * 32, 0.5 * 32, 0, AVO.SHAPE_POLYGON);
    avo.actors.push(newActor);
    avo.refs[newActor.name] = newActor;
    newActor.shapePolygonPath = [-128, -64, 128, -64, 128, 64, -128, 64];
    newActor.movable = false;
    newActor.spritesheet = avo.assets.images.walls;
    newActor.animationSet = avo.animationSets.wall;
    newActor.playAnimation("short_wall");
    //----------------------------------------------------------------
    */
  }
  
  run_action() {
    const avo = this.avo;
    
    const colours = ["red", "blue", "yellow"];
    let matches = 0;
    
    for (let col of colours) {
      if (Physics.checkCollision(avo.refs[col+"_box"], avo.refs[col+"_plate"])) {
        avo.refs[col+"_box"].playAnimation(col+"_glow");
        avo.refs[col+"_plate"].playAnimation(col+"_glow");
        matches++;
      } else {
        avo.refs[col+"_box"].playAnimation(col);
        avo.refs[col+"_plate"].playAnimation(col);
      }  
    }
    
    /*
    const MOVE_DISTANCE = 96;
    const BASELINE_Y = 0.5 * 32;
    if (matches === colours.length) {
      if (avo.refs["wall_right"].x < 512 + MOVE_DISTANCE) {
        avo.refs["wall_right"].x += 1;
        avo.refs["wall_right"].y = BASELINE_Y + Utility.randomInt(0, 1);
      }
      
      if (avo.refs["wall_left"].x > -MOVE_DISTANCE) {
        avo.refs["wall_left"].x -= 1;
        avo.refs["wall_left"].y = BASELINE_Y + Utility.randomInt(0, 1);
      }
    }
    */
  }
}
