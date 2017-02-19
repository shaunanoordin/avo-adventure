/*
Example Game
============

While AvO is the adventure game engine, this is a specific implementation of an
adventure game idea.

(Shaun A. Noordin || shaunanoordin.com || 20161001)
********************************************************************************
 */

import { ComicStrip } from "../avo/comic-strip.js";
import { Actor, AoE } from "../avo/entities.js";
import { Effect } from "../avo/effect.js";
import * as AVO from  "../avo/constants.js";
import { ImageAsset } from "../avo/utility.js";
import { Physics } from "../avo/physics.js";

export function initialise() {
  //Config
  //--------------------------------
  this.appConfig.debugMode = true;
  //--------------------------------
  
  //Scripts
  //--------------------------------
  this.scripts.customRunStart = runStart;
  this.scripts.customRunAction = runAction;
  this.scripts.customRunEnd = runEnd;
  //--------------------------------
  
  //Images
  //--------------------------------
  this.assets.images.actor = new ImageAsset("assets/example-game/actor.png");
  this.assets.images.sarcophagus = new ImageAsset("assets/example-game/sarcophagus.png");
  this.assets.images.gate = new ImageAsset("assets/example-game/gate.png");
  this.assets.images.plate = new ImageAsset("assets/example-game/plate.png");
  this.assets.images.goal = new ImageAsset("assets/example-game/goal.png");
  
  this.assets.images.comicPanelA = new ImageAsset("assets/example-game/comic-panel-800x600-red.png");
  this.assets.images.comicPanelB = new ImageAsset("assets/example-game/comic-panel-800x600-blue.png");
  this.assets.images.comicPanelC = new ImageAsset("assets/example-game/comic-panel-800x600-yellow.png");
  this.assets.images.comicPanelSmall = new ImageAsset("assets/example-game/comic-panel-500x500-green.png");
  this.assets.images.comicPanelBig = new ImageAsset("assets/example-game/comic-panel-1000x1000-pink.png");
  this.assets.images.comicPanelWide = new ImageAsset("assets/example-game/comic-panel-1000x300-teal.png");
  //--------------------------------
  
  //Animations
  //--------------------------------
  const STEPS_PER_SECOND = AVO.FRAMES_PER_SECOND / 10;
  this.animationSets = {
    actor: {
      rule: AVO.ANIMATION_RULE_DIRECTIONAL,
      tileWidth: 64,
      tileHeight: 64,
      tileOffsetX: 0,
      tileOffsetY: -16,
      actions: {
        idle: {
          loop: true,
          steps: [
            { row: 0, duration: 1 }
          ],
        },
        move: {
          loop: true,
          steps: [
            { row: 1, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 4, duration: STEPS_PER_SECOND },
            { row: 5, duration: STEPS_PER_SECOND },
            { row: 4, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
          ],
        },
      },
    },
    
    sarcophagus: {
      rule: AVO.ANIMATION_RULE_BASIC,
      tileWidth: 64,
      tileHeight: 128,
      tileOffsetX: 0,
      tileOffsetY: -32,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
        glow: {
          loop: true,
          steps: [
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
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
        glow: {
          loop: true,
          steps: [
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
          ],
        },
      },
    },
    
    simple128: {
      rule: AVO.ANIMATION_RULE_BASIC,
      tileWidth: 128,
      tileHeight: 128,
      tileOffsetX: 0,
      tileOffsetY: 0,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
      },
    },
    
    simple64: {
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
        glow: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 3 },
          ],
        },
      },
    },
    
  };
  
  //Process Animations; expand steps to many frames per steps.
  for (let animationTitle in this.animationSets) {
    let animationSet = this.animationSets[animationTitle];
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
}

function runStart() {
  this.store.level = 1;
  
  if (this.pointer.state === AVO.INPUT_ACTIVE || 
      this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
      this.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
    this.changeState(AVO.STATE_COMIC, comicStart);
  }
}

function comicStart() {
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ //this.assets.images.comicPanelA,
      //this.assets.images.comicPanelB,
      //this.assets.images.comicPanelC,
    ],
    comicStartFinished);
}

function comicStartFinished() {
  //this.changeState(AVO.STATE_ACTION, startLevel1);  //TEST
  this.changeState(AVO.STATE_ACTION, startLevel2);
}

function runEnd() {}

function runAction() {
  //Animations
  //--------------------------------
  //WARNING: This is no longer working due to new Action/Intent rules
  if (this.refs["boxes"]) {
    for (let box of this.refs["boxes"]) {
      if (box.effects.find((eff) => { return eff.name === "charge" })) {
        box.playAnimation("glow");
      } else {
        box.playAnimation("idle");
      }
    }
  }
  //--------------------------------
  
  //Game rules
  //--------------------------------
  checkIfAllBoxesAreCharged.apply(this);
  //--------------------------------
  
  //Shape Tester
  //--------------------------------
  if (this.keys[AVO.KEY_CODES.Q].duration === 1) { this.refs[AVO.REF.PLAYER].shape = AVO.SHAPE_CIRCLE; }
  if (this.keys[AVO.KEY_CODES.E].duration === 1) { this.refs[AVO.REF.PLAYER].shape = AVO.SHAPE_SQUARE; }
  if (this.keys[AVO.KEY_CODES.R].duration === 1) { this.refs[AVO.REF.PLAYER].size += 8; }
  if (this.keys[AVO.KEY_CODES.F].duration === 1) { this.refs[AVO.REF.PLAYER].size -= 8; }
  //--------------------------------
  
  //Win Condition
  //--------------------------------
  checkIfPlayerIsAtGoal.apply(this);
  //--------------------------------
}

function startLevelInit() {
  //Reset
  this.actors = [];
  this.areasOfEffect = [];
  this.refs = {};
  
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  
  this.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, midX, midY + 256, 32, AVO.SHAPE_CIRCLE);
  this.refs[AVO.REF.PLAYER].spritesheet = this.assets.images.actor;
  this.refs[AVO.REF.PLAYER].animationSet = this.animationSets.actor;
  this.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 4;
  this.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_NORTH;
  this.actors.push(this.refs[AVO.REF.PLAYER]);
  
  this.refs["gate"] = new Actor("gate", midX, 16, 128, AVO.SHAPE_SQUARE);
  this.refs["gate"].movable = false;
  this.refs["gate"].spritesheet = this.assets.images.gate;
  this.refs["gate"].animationSet = this.animationSets.simple128;
  this.refs["gate"].playAnimation("idle");
  this.actors.push(this.refs["gate"]);
  
  this.refs["goal"] = new AoE("goal", this.canvasWidth / 2, 32, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, []);
  this.refs["goal"].spritesheet = this.assets.images.goal;
  this.refs["goal"].animationSet = this.animationSets.simple64;
  this.refs["goal"].playAnimation("glow");
  this.areasOfEffect.push(this.refs["goal"]);
}

function startLevel1() {
  startLevelInit.apply(this);
  //this.areasOfEffect.push(
  //  new AoE("conveyorBelt", this.canvasWidth / 2, this.canvasHeight / 2 + 64, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE,
  //    [new Effect("push", { x: 0, y: 4 }, 4, AVO.STACKING_RULE_ADD, null)], null)
  //);
  //this.actors.push(new Actor("s1", Math.floor(Math.random() * this.canvasWidth * 0.8) + this.canvasWidth * 0.1, Math.floor(Math.random() * this.canvasHeight * 0.8) + this.canvasHeight * 0.1, 32 + Math.random() * 64, AVO.SHAPE_SQUARE));
  
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  
  this.refs.boxes = [];
  this.refs.plates = [];
  let newBox, newPlate;
  const chargeEffect = new Effect("charge", {}, 4, AVO.STACKING_RULE_ADD, null);
  
  this.refs.boxes = [
    new Actor("", midX - 128, midY - 64, 64, AVO.SHAPE_SQUARE),
    new Actor("", midX + 128, midY - 64, 64, AVO.SHAPE_SQUARE),
  ];
  for (let box of this.refs.boxes) {
    box.attributes["box"] = true;
    box.spritesheet = this.assets.images.sarcophagus;
    box.animationSet = this.animationSets.sarcophagus;
    this.actors.push(box);
  }
  
  this.refs.plates = [
    new AoE("plate", midX - 128, midY + 64, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, [chargeEffect.copy()]),
    new AoE("plate", midX + 128, midY + 64, 64, AVO.SHAPE_SQUARE, AVO.DURATION_INFINITE, [chargeEffect.copy()]),
  ];
  for (let plate of this.refs.plates) {
    plate.spritesheet = this.assets.images.plate;
    plate.animationSet = this.animationSets.plate;
    plate.playAnimation("idle");
    this.areasOfEffect.push(plate);
  }
}

function startLevel2() {
  startLevelInit.apply(this);
  const midX = this.canvasWidth / 2, midY = this.canvasHeight / 2;
  this.refs["sq1"] = new Actor("sq1", Math.floor(midX + Math.random() * 512 - 256), Math.floor(midX + Math.random() * 256 - 256), 64, AVO.SHAPE_SQUARE);
  this.refs["ci2"] = new Actor("ci2", Math.floor(midX + Math.random() * 512 - 256), Math.floor(midX + Math.random() * 256 - 256), 64, AVO.SHAPE_CIRCLE);
  this.actors.push(this.refs["sq1"]);
  this.actors.push(this.refs["ci2"]);  
}

function startLevel3() {
  startLevelInit.apply(this);
}

function checkIfAllBoxesAreCharged() {
  let allBoxesAreCharged = true;
  
  if (this.refs["plates"] && this.refs["boxes"]) {
    for (let plate of this.refs["plates"]) {
      let thisPlateIsCharged = false;
      for (let box of this.refs["boxes"]) {
        if (Physics.checkCollision(box, plate)) {
          thisPlateIsCharged = true;
          plate.playAnimation("glow");
        }
      }
      !thisPlateIsCharged && plate.playAnimation("idle");
      allBoxesAreCharged = allBoxesAreCharged && thisPlateIsCharged;
    }
  }
  
  if (allBoxesAreCharged) {
    if (this.refs["gate"] && this.refs["gate"].y >= -32) {
      this.refs["gate"].x = this.canvasWidth / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y -= 1;
    }
  } else {
    if (this.refs["gate"] && this.refs["gate"].y <= 16) {
      this.refs["gate"].x = this.canvasWidth / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y += 1;
    }
  }
}

function checkIfPlayerIsAtGoal() {
  if (Physics.checkCollision(this.refs[AVO.REF.PLAYER], this.refs["goal"])) {
    this.store.level && this.store.level++;
    
    switch (this.store.level) {
      case 1:
        startLevel1.apply(this);
        break;
      case 2:
        startLevel2.apply(this);
        break;
      case 3:
        startLevel3.apply(this);
        break;      
      default:
        this.changeState(AVO.STATE_END);
    }    
  }
}
