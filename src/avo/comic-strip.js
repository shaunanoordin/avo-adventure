/*  
AvO Comic Strip
===============

(Shaun A. Noordin || shaunanoordin.com || 20161011)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.

/*  4-Koma Comic Strip Class
 */
//==============================================================================
export class ComicStrip {
  constructor(name = "", panels = [], onFinish = null) {
    this.name = name;
    this.panels = panels;
    this.onFinish = onFinish;
    
    this.waitTime = AVO.DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT;
    this.transitionTime = AVO.DEFAULT_COMIC_STRIP_TRANSITION_TIME;    
    this.background = "#333";
    
    this.start();
  }
  
  start() {
    this.currentPanel = 0;
    this.state = AVO.COMIC_STRIP_STATE_TRANSITIONING;
    this.counter = 0;
  }
  
  getCurrentPanel() {
    if (this.currentPanel < 0 || this.currentPanel >= this.panels.length) {
      return null;
    } else {
      return this.panels[this.currentPanel];
    }
  }
  
  getPreviousPanel() {
    if (this.currentPanel < 1 || this.currentPanel >= this.panels.length + 1) {
      return null;
    } else {
      return this.panels[this.currentPanel - 1];
    }
  }  
}
//==============================================================================
