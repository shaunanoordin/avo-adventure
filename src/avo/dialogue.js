/*  
Dialogue
========

(Shaun A. Noordin || shaunanoordin.com || 20170816)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.

/*  Choose-Your-Own-Adventure Dialogue
 */
//==============================================================================
export class Dialogue {
  constructor(name = "", pages = {}, onFinish = null) {
    this.name = name;
    this.pages = pages;
    this.onFinish = onFinish;
    
    this.currentPage = null;
    
    this.start();
  }
  
  start() {
  }
  
  finish() {
    
  }
}
//==============================================================================
