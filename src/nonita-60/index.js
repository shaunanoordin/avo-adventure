/*
Nonita 60
=========

(Shaun A. Noordin || shaunanoordin.com || 20170322)
********************************************************************************
 */

import * as AVO from  "../avo/constants.js";
import { Story } from "../avo/story.js";
import { Actor } from "../avo/entities.js";

export class Nonita60 extends Story {
  constructor() {
    super();
    this.init = this.init.bind(this);
    this.run_start = this.run_start.bind(this);
    this.enterRoom1 = this.enterRoom1.bind(this);
  }
  
  init() {
    //Config
    //--------------------------------
    console.log(this);
    this.avo.config.debugMode = true;
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
  
  enterRoom1() {
    const avo = this.avo;
    //Reset
    avo.actors = [];
    avo.areasOfEffect = [];
    avo.refs = {};
    
    const midX = avo.canvasWidth / 2, midY = avo.canvasHeight / 2;
    
    avo.refs[AVO.REF.PLAYER] = new Actor(AVO.REF.PLAYER, midX, midY, 32, AVO.SHAPE_CIRCLE);
    //avo.refs[AVO.REF.PLAYER].spritesheet = avo.assets.images.actor;
    //avo.refs[AVO.REF.PLAYER].animationSet = avo.animationSets.actor;
    avo.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 4;
    avo.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_NORTH;
    avo.actors.push(avo.refs[AVO.REF.PLAYER]);
  }
}
