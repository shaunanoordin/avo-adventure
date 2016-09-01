/*  
AvO Adventure Game
==================

(Shaun A. Noordin || shaunanoordin.com || 20160517)
********************************************************************************
 */

import { AvO } from "./avo/index.js";
import { initialise } from "./example-game/index.js";
 
/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function() {
  window.app = new AvO(initialise);
};
//==============================================================================
