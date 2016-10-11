/*  
AvO Standard Actions
====================

(Shaun A. Noordin || shaunanoordin.com || 20161008)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.
import { AoE } from "./entities.js";
import { Effect } from "./effect.js";
import { Utility } from "./utility.js";

export const StandardActions = {};

StandardActions[AVO.ACTION.IDLE] = function (actor) {
  actor.state = AVO.ACTOR_IDLE;
  actor.playAnimation(AVO.ACTION.IDLE);
};
      
StandardActions[AVO.ACTION.MOVE] = function (actor) {
  const angle = actor.action.angle || 0;
  const speed = actor.attributes[AVO.ATTR.SPEED] || 0;
  actor.x += Math.cos(angle) * speed;
  actor.y += Math.sin(angle) * speed;
  actor.rotation = angle;
  actor.state = AVO.ACTOR_WALKING;
  actor.playAnimation(AVO.ACTION.MOVE);
};
    
StandardActions[AVO.ACTION.PRIMARY] = function (actor) {
  //TODO This is just a placeholder
  //................
  const PUSH_POWER = 12;
  const AOE_SIZE = this.refs[AVO.REF.PLAYER].size;
  let distance = this.refs[AVO.REF.PLAYER].radius + AOE_SIZE / 2;
  let x = this.refs[AVO.REF.PLAYER].x + Math.cos(this.refs[AVO.REF.PLAYER].rotation) * distance;
  let y = this.refs[AVO.REF.PLAYER].y + Math.sin(this.refs[AVO.REF.PLAYER].rotation) * distance;;
  let newAoE = new AoE("", x, y, AOE_SIZE, AVO.SHAPE_CIRCLE, 5,
    [
      new Effect("push",
        { x: Math.cos(this.refs[AVO.REF.PLAYER].rotation) * PUSH_POWER, y: Math.sin(this.refs[AVO.REF.PLAYER].rotation) * PUSH_POWER },
        2, AVO.STACKING_RULE_ADD)
    ]);
  this.areasOfEffect.push(newAoE);
  actor.playAnimation(AVO.ACTION.PRIMARY);
  //................
};
