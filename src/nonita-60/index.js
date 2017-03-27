/*
Nonita 60
=========

(Shaun A. Noordin || shaunanoordin.com || 20170322)
********************************************************************************
 */

import * as AVO from  "../avo/constants.js";
import { Story } from "../avo/story.js";
import { Actor } from "../avo/entities.js";
import { ImageAsset } from "../avo/utility.js";

export class Nonita60 extends Story {
  constructor() {
    super();
    this.init = this.init.bind(this);
    this.run_start = this.run_start.bind(this);
    this.prepareRoom = this.prepareRoom.bind(this);
    this.enterRoom1 = this.enterRoom1.bind(this);
  }
  
  init() {
    const avo = this.avo;
    
    //Config
    //--------------------------------
    avo.config.debugMode = true;
    //--------------------------------
    
    //Images
    //--------------------------------
    avo.assets.images.actor = new ImageAsset("assets/nonita-60/actor.png");
    avo.assets.images.boxes = new ImageAsset("assets/nonita-60/boxes.png");
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
      tileOffsetY: -16,
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
  }
  
  run_start() {
    const avo = this.avo;
    
    if (avo.pointer.state === AVO.INPUT_ACTIVE || 
        avo.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
        avo.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
      avo.changeState(AVO.STATE_ACTION, this.enterRoom1 );
    }
  }
  
  prepareRoom() {
    const avo = this.avo;
    
    //Reset
    let player = avo.refs[AVO.REF.PLAYER];
    avo.actors = [];
    avo.areasOfEffect = [];
    avo.refs = {};
    
    //Create the player character if she doesn't yet exist.
    if (!player) {
      avo.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, avo.canvasWidth / 2, avo.canvasHeight / 2, 32, AVO.SHAPE_CIRCLE);
      avo.refs[AVO.REF.PLAYER].spritesheet = avo.assets.images.actor;
      avo.refs[AVO.REF.PLAYER].animationSet = avo.animationSets.actor;
      avo.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 4;
      avo.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_NORTH;
      avo.actors.push(avo.refs[AVO.REF.PLAYER]);
    } else {
      avo.refs[AVO.REF.PLAYER] = player;
      avo.actors.push(avo.refs[AVO.REF.PLAYER]);
    }
  }
  
  enterRoom1() {
    const avo = this.avo;    
    this.prepareRoom();
    
    let newActor;
    newActor = new Actor("box", avo.canvasWidth * 0.25, avo.canvasHeight * 0.5, 32, AVO.SHAPE_SQUARE);
    newActor.spritesheet = avo.assets.images.boxes;
    newActor.animationSet = avo.animationSets.box;
    newActor.rotation = AVO.ROTATION_NORTH;
    newActor.playAnimation("idle");
    avo.actors.push(newActor);
  }
}
