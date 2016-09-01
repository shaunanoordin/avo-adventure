/*
Example Game
============

While AvO is the adventure game engine, this is a specific implementation of an
adventure game idea.

(Shaun A. Noordin || shaunanoordin.com || 20160901)
********************************************************************************
 */

import { AvO } from "./avo.js"; 
import "./constants.js";
import "./utility.js";

/*  Game Scripts
 */
//==============================================================================
export function initialise() {
  //Scripts
  //--------------------------------
  this.scripts.runStart = runStart;
  this.scripts.runAction = runAction;
  this.scripts.runEnd = runEnd;
  //--------------------------------
  
  //Images
  //--------------------------------
  this.assets.images.actor = new ImageAsset("assets/actor.png");
  this.assets.images.sarcophagus = new ImageAsset("assets/sarcophagus.png");
  this.assets.images.gate = new ImageAsset("assets/gate.png");
  this.assets.images.plate = new ImageAsset("assets/plate.png");
  this.assets.images.goal = new ImageAsset("assets/goal.png");
  this.assets.images.background = new ImageAsset("assets/background.png");
  
  this.assets.images.comicPanelA = new ImageAsset("assets/comic-panel-800x600-red.png");
  this.assets.images.comicPanelB = new ImageAsset("assets/comic-panel-800x600-blue.png");
  this.assets.images.comicPanelC = new ImageAsset("assets/comic-panel-800x600-yellow.png");
  this.assets.images.comicPanelSmall = new ImageAsset("assets/comic-panel-500x500-green.png");
  this.assets.images.comicPanelBig = new ImageAsset("assets/comic-panel-1000x1000-pink.png");
  this.assets.images.comicPanelWide = new ImageAsset("assets/comic-panel-1000x300-teal.png");
  //--------------------------------
  
  //Animations
  //--------------------------------
  const STEPS_PER_SECOND = FRAMES_PER_SECOND / 10;
  this.animationSets = {
    actor: {
      rule: ANIMATION_RULE_DIRECTIONAL,
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
        walk: {
          loop: true,
          steps: [
            { row: 1, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
          ],
        },
      },
    },
    
    sarcophagus: {
      rule: ANIMATION_RULE_BASIC,
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
      rule: ANIMATION_RULE_BASIC,
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
      rule: ANIMATION_RULE_BASIC,
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
      rule: ANIMATION_RULE_BASIC,
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
  
  if (this.pointer.state === INPUT_ACTIVE || 
      this.keys[KEY_CODES.UP].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.SPACE].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.ENTER].state === INPUT_ACTIVE) {
    this.changeState(STATE_COMIC, comicStart);
  }
}

function comicStart() {
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ this.assets.images.comicPanelA,
      this.assets.images.comicPanelB,
      this.assets.images.comicPanelC ],
    comicStartFinished);
  this.comicStrip.start();
  
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ this.assets.images.comicPanelA, 
      this.assets.images.comicPanelSmall, 
      this.assets.images.comicPanelBig, 
      this.assets.images.comicPanelWide ],
    comicStartFinished);
  this.comicStrip.start();
  
  //this.comicStrip = new ComicStrip(
  //  "startcomic",
  //  [],
  //  comicStartFinished);
  //this.comicStrip.start();
}

function comicStartFinished() {
  this.changeState(STATE_ACTION, startLevel1);
}

function runEnd() {}

function runAction() {
  //Input & Actions
  //--------------------------------
  let playerIsIdle = true;
  const PLAYER_SPEED = 4;
  if (this.pointer.state === INPUT_ACTIVE) {
    const distX = this.pointer.now.x - this.pointer.start.x;
    const distY = this.pointer.now.y - this.pointer.start.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    
    if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
      const angle = Math.atan2(distY, distX);
      const speed = PLAYER_SPEED;
      this.refs["player"].x += Math.cos(angle) * speed;
      this.refs["player"].y += Math.sin(angle) * speed;
      this.refs["player"].rotation = angle;
      playerIsIdle = false;
      
      //UX improvement: reset the base point of the pointer so the player can
      //switch directions much more easily.
      if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2) {
        this.pointer.start.x = this.pointer.now.x - Math.cos(angle) *
          INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
        this.pointer.start.y = this.pointer.now.y - Math.sin(angle) *
          INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
      }
    }
  }
  
  if (this.keys[KEY_CODES.UP].state === INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state !== INPUT_ACTIVE) {
    this.refs["player"].y -= PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_NORTH;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
    this.refs["player"].y += PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_SOUTH;
    playerIsIdle = false;
  }
  if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
    this.refs["player"].x -= PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_WEST;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
    this.refs["player"].x += PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_EAST;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.A].state === INPUT_ACTIVE && this.keys[KEY_CODES.D].state !== INPUT_ACTIVE) {
    this.refs["player"].rotation -= Math.PI / 36;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.A].state !== INPUT_ACTIVE && this.keys[KEY_CODES.D].state === INPUT_ACTIVE) {
    this.refs["player"].rotation += Math.PI / 36;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.W].state === INPUT_ACTIVE) {
    this.refs["player"].x += Math.cos(this.refs["player"].rotation) * PLAYER_SPEED;
    this.refs["player"].y += Math.sin(this.refs["player"].rotation) * PLAYER_SPEED;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.S].state === INPUT_ACTIVE) {
    this.refs["player"].x -= Math.cos(this.refs["player"].rotation) * PLAYER_SPEED;
    this.refs["player"].y -= Math.sin(this.refs["player"].rotation) * PLAYER_SPEED;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.Z].duration === 1) {
    this.refs["player"].shape = (this.refs["player"].shape === SHAPE_CIRCLE)
      ? SHAPE_SQUARE
      : SHAPE_CIRCLE;
  }
  
  if (this.keys[KEY_CODES.SPACE].duration === 1) {
    const PUSH_POWER = 12;
    const AOE_SIZE = this.refs["player"].size;
    let distance = this.refs["player"].radius + AOE_SIZE / 2;
    let x = this.refs["player"].x + Math.cos(this.refs["player"].rotation) * distance;
    let y = this.refs["player"].y + Math.sin(this.refs["player"].rotation) * distance;;
    let newAoE = new AoE("", x, y, AOE_SIZE, SHAPE_CIRCLE, 5,
      [
        new Effect("push",
          { x: Math.cos(this.refs["player"].rotation) * PUSH_POWER, y: Math.sin(this.refs["player"].rotation) * PUSH_POWER },
          2, STACKING_RULE_ADD)
      ]);
    this.areasOfEffect.push(newAoE);
  }
  //--------------------------------
  
  //Animations
  //--------------------------------
  if (playerIsIdle) {
    this.refs["player"].setAnimation("idle");
  } else {
    this.refs["player"].setAnimation("walk");
  }
  
  if (this.refs["boxes"]) {
    for (let box of this.refs["boxes"]) {
      if (box.effects.find((eff) => { return eff.name === "charge" })) {
        box.setAnimation("glow");
      } else {
        box.setAnimation("idle");
      }
    }
  }
  //--------------------------------
  
  //Game rules
  //--------------------------------
  checkIfAllBoxesAreCharged.apply(this);
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
  
  const midX = this.width / 2, midY = this.height / 2;
  
  this.refs["player"] = new Actor("player", midX, midY + 256, 32, SHAPE_CIRCLE);
  this.refs["player"].spritesheet = this.assets.images.actor;
  this.refs["player"].animationSet = this.animationSets.actor;
  this.refs["player"].rotation = ROTATION_NORTH;
  this.actors.push(this.refs["player"]);
  
  let wallN = new Actor("wallN", midX, midY - 672, this.width, SHAPE_SQUARE);
  let wallS = new Actor("wallS", midX, midY + 688, this.width, SHAPE_SQUARE);
  let wallE = new Actor("wallE", midX + 688, midY, this.height, SHAPE_SQUARE);
  let wallW = new Actor("wallW", midX - 688, midY, this.height, SHAPE_SQUARE);
  wallE.canBeMoved = false;
  wallS.canBeMoved = false;
  wallW.canBeMoved = false;
  wallN.canBeMoved = false;
  this.actors.push(wallE, wallS, wallW, wallN);

  this.refs["gate"] = new Actor("gate", midX, 16, 128, SHAPE_SQUARE);
  this.refs["gate"].canBeMoved = false;
  this.refs["gate"].spritesheet = this.assets.images.gate;
  this.refs["gate"].animationSet = this.animationSets.simple128;
  this.refs["gate"].setAnimation("idle");
  this.actors.push(this.refs["gate"]);
  
  this.refs["goal"] = new AoE("goal", this.width / 2, 32, 64, SHAPE_SQUARE, DURATION_INFINITE, []);
  this.refs["goal"].spritesheet = this.assets.images.goal;
  this.refs["goal"].animationSet = this.animationSets.simple64;
  this.refs["goal"].setAnimation("glow");
  this.areasOfEffect.push(this.refs["goal"]);
}

function startLevel1() {
  startLevelInit.apply(this);
  //this.areasOfEffect.push(
  //  new AoE("conveyorBelt", this.width / 2, this.height / 2 + 64, 64, SHAPE_SQUARE, DURATION_INFINITE,
  //    [new Effect("push", { x: 0, y: 4 }, 4, STACKING_RULE_ADD, null)], null)
  //);
  //this.actors.push(new Actor("s1", Math.floor(Math.random() * this.width * 0.8) + this.width * 0.1, Math.floor(Math.random() * this.height * 0.8) + this.height * 0.1, 32 + Math.random() * 64, SHAPE_SQUARE));
  
  const midX = this.width / 2, midY = this.height / 2;
  
  this.refs.boxes = [];
  this.refs.plates = [];
  let newBox, newPlate;
  const chargeEffect = new Effect("charge", {}, 4, STACKING_RULE_ADD, null);
  
  this.refs.boxes = [
    new Actor("", midX - 128, midY - 64, 64, SHAPE_SQUARE),
    new Actor("", midX + 128, midY - 64, 64, SHAPE_SQUARE),
  ];
  for (let box of this.refs.boxes) {
    box.attributes.box = true;
    box.spritesheet = this.assets.images.sarcophagus;
    box.animationSet = this.animationSets.sarcophagus;
    this.actors.push(box);
  }
  
  this.refs.plates = [
    new AoE("plate", midX - 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()]),
    new AoE("plate", midX + 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()]),
  ];
  for (let plate of this.refs.plates) {
    plate.spritesheet = this.assets.images.plate;
    plate.animationSet = this.animationSets.plate;
    plate.setAnimation("idle");
    this.areasOfEffect.push(plate);
  }
  
  this.ui.backgroundImage = this.assets.images.background;
}

function startLevel2() {
  startLevelInit.apply(this);
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
        if (this.isATouchingB(box, plate)) {
          thisPlateIsCharged = true;
          plate.setAnimation("glow");
        }
      }
      !thisPlateIsCharged && plate.setAnimation("idle");
      allBoxesAreCharged = allBoxesAreCharged && thisPlateIsCharged;
    }
  }
  
  if (allBoxesAreCharged) {
    if (this.refs["gate"] && this.refs["gate"].y >= -32) {
      this.refs["gate"].x = this.width / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y -= 1;
    }
  } else {
    if (this.refs["gate"] && this.refs["gate"].y <= 16) {
      this.refs["gate"].x = this.width / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y += 1;
    }
  }
}

function checkIfPlayerIsAtGoal() {
  if (this.isATouchingB(this.refs["player"], this.refs["goal"])) {
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
        this.changeState(STATE_END);
    }    
  }
}
//==============================================================================
