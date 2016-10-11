/*  
Effect
======

(Shaun A. Noordin || shaunanoordin.com || 20161011)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.

/*  Effect Class
    A general effect that's applied to an Actor. 
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
