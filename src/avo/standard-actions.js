/*  
AvO Standard Actions
====================

(Shaun A. Noordin || shaunanoordin.com || 20161008)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.
import { Zone } from "./entities.js";
import { Effect } from "./effect.js";
import { Utility } from "./utility.js";

export const StandardActions = {};

StandardActions[AVO.ACTION.IDLE] = function (actor) {
  actor.state = AVO.ACTOR_IDLE;
  actor.playAnimation(AVO.ACTION.IDLE);
};
      
StandardActions[AVO.ACTION.MOVING] = function (actor) {
  const angle = actor.action.angle || 0;
  const speed = actor.attributes[AVO.ATTR.SPEED] || 0;
  actor.x += Math.cos(angle) * speed;
  actor.y += Math.sin(angle) * speed;
  actor.rotation = angle;
  actor.state = AVO.ACTOR_MOVING;
  actor.playAnimation(AVO.ACTION.MOVING);
};
    
StandardActions[AVO.ACTION.PRIMARY] = function (actor) {
  //TODO This is just a placeholder
  //................
  const PUSH_POWER = 12;
  const ZONE_SIZE = this.playerActor.size;
  let distance = this.playerActor.radius + ZONE_SIZE / 2;
  let x = this.playerActor.x + Math.cos(this.playerActor.rotation) * distance;
  let y = this.playerActor.y + Math.sin(this.playerActor.rotation) * distance;;
  let newZone = new Zone("", x, y, ZONE_SIZE, AVO.SHAPE_CIRCLE, 5,
    [
      new Effect("push",
        { x: Math.cos(this.playerActor.rotation) * PUSH_POWER, y: Math.sin(this.playerActor.rotation) * PUSH_POWER },
        2, AVO.STACKING_RULE_ADD)
    ]
  );
  this.zones.push(newZone);
  actor.playAnimation(AVO.ACTION.PRIMARY);
  //................
};
