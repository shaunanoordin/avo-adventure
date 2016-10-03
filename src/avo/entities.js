/*  
AvO Entities (In-Game Objects)
==============================

(Shaun A. Noordin || shaunanoordin.com || 20161001)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.
import { Utility } from "./utility.js";

/*  Actor Class
 */
//==============================================================================
export class Actor {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_NONE) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.solid = (shape !== AVO.SHAPE_NONE);
    this.canBeMoved = true;
    this.rotation = AVO.ROTATION_SOUTH;  //Rotation in radians; clockwise positive.
    
    this.spritesheet = null;
    this.animationStep = 0;
    this.animationSet = null;
    this.animationName = "";
    
    this.state = AVO.ACTOR_IDLE;
    this.intent = null;
    this.action = null;
    
    this.attributes = {};
    this.effects = [];
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }
  
  get rotation() { return this._rotation; }
  set rotation(val) {
    this._rotation = val;
    while (this._rotation > Math.PI) { this._rotation -= Math.PI * 2; }
    while (this._rotation <= -Math.PI) { this._rotation += Math.PI * 2; }
  }
  get direction() {  //Get cardinal direction
    //Favour East and West when rotation is exactly SW, NW, SE or NE.
    if (this._rotation <= Math.PI * 0.25 && this._rotation >= Math.PI * -0.25) { return AVO.DIRECTION_EAST; }
    else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) { return AVO.DIRECTION_SOUTH; }
    else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) { return AVO.DIRECTION_NORTH; }
    else { return AVO.DIRECTION_WEST; }
  }
  set direction(val) {
    switch (val) {
      case AVO.DIRECTION_EAST:
        this._rotation = AVO.ROTATION_EAST;
        break;
      case AVO.DIRECTION_SOUTH:
        this._rotation = AVO.ROTATION_SOUTH;
        break;
      case AVO.DIRECTION_WEST:
        this._rotation = AVO.ROTATION_WEST;
        break;
      case AVO.DIRECTION_NORTH:
        this._rotation = AVO.ROTATION_NORTH;
        break;
    }
  }
  
  playAnimation(animationName = "", restart = false) {
    if (!this.animationSet || !this.animationSet.actions[animationName]) return;
    
    if (restart || this.animationName !== animationName) {  //Set this as the new animation
      this.animationStep = 0;
      this.animationName = animationName;
    }
  }
  
  nextAnimationFrame() {
    if (!this.animationSet || !this.animationSet.actions[this.animationName]) return;
    
    let animationAction = this.animationSet.actions[this.animationName];
    this.animationStep++;
    if (animationAction.steps.length === 0) {
      this.animationStep = 0;
    } else if (animationAction.loop) {
      while (this.animationStep >= animationAction.steps.length) this.animationStep -= animationAction.steps.length;
    } else {
      this.animationStep = animationAction.steps.length - 1;
    }
  }
}
//==============================================================================

/*  Area of Effect Class
 */
//==============================================================================
export class AoE {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_CIRCLE, duration = 1, effects = []) {
    this.name = name; 
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.duration = duration;
    this.startDuration = duration;
    this.effects = effects;
        
    this.spritesheet = null;
    this.animationStep = 0;
    this.animationSet = null;
    this.animationName = "";
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }
  
  hasInfiniteDuration() {
    return this.startDuration === AVO.DURATION_INFINITE;
  }
  
  playAnimation(animationName = "", restart = false) {
    if (!this.animationSet || !this.animationSet.actions[animationName]) return;
    
    if (restart || this.animationName !== animationName) {  //Set this as the new animation
      this.animationStep = 0;
      this.animationName = animationName;
    }
  }
  
  nextAnimationFrame() {
    if (!this.animationSet || !this.animationSet.actions[this.animationName]) return;
    
    let animationAction = this.animationSet.actions[this.animationName];
    this.animationStep++;
    if (animationAction.steps.length === 0) {
      this.animationStep = 0;
    } else if (animationAction.loop) {
      while (this.animationStep >= animationAction.steps.length) this.animationStep -= animationAction.steps.length;
    } else {
      this.animationStep = animationAction.steps.length - 1;
    }
  }
}
//==============================================================================

/*  Effect Class
 */
//==============================================================================
export class Effect {
  constructor(name = "", data = {}, duration = 1, stackingRule = AVO.STACKING_RULE_ADD) {
    this.name = name;
    this.data = data;
    this.duration = duration;
    this.stackingRule = stackingRule;
    this.startDuration = duration;
  }
  
  hasInfiniteDuration() {
    return this.startDuration === AVO.DURATION_INFINITE;
  }
  
  copy() {
    return new Effect(this.name, this.data, this.duration, this.stackingRule);
  }
}
//==============================================================================
