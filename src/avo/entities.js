/*  
AvO Entities (In-Game Objects)
==============================

(Shaun A. Noordin || shaunanoordin.com || 20161001)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.
import { Utility } from "./utility.js";

/*  Entity Class
    A general abstract object within the game.
 */
//==============================================================================
class Entity {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_NONE) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.solid = (shape !== AVO.SHAPE_NONE);
    this.movable = true;
    this.rotation = AVO.ROTATION_SOUTH;  //Rotation in radians; clockwise positive.
    
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
  
  get vertices() {
    const v = [];
    if (this.shape === AVO.SHAPE_SQUARE) {
      v.push({ x: this.left, y: this.top });
      v.push({ x: this.right, y: this.top });
      v.push({ x: this.right, y: this.bottom });
      v.push({ x: this.left, y: this.bottom });
    }   
    return v;
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


/*  Actor Class
    An active character in the game.
 */
//==============================================================================
export class Actor extends Entity {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_NONE) {
    super(name, x, y, size, shape);
    
    this.state = AVO.ACTOR_IDLE;
    this.intent = null;
    this.action = null;
    
    this.attributes = {};
    this.effects = [];
  }
}
//==============================================================================

/*  Area of Effect Class
    An area that applies Effects to Actors that touch it.
 */
//==============================================================================
export class AoE extends Entity {
  constructor(name = "", x = 0, y = 0, size = 32, shape = AVO.SHAPE_CIRCLE, duration = 1, effects = []) {
    super(name, x, y, size, shape);
    
    this.duration = duration;
    this.startDuration = duration;
    this.effects = effects;
  }
  
  hasInfiniteDuration() {
    return this.startDuration === AVO.DURATION_INFINITE;
  }
}
//==============================================================================
