/*  
AvO Adventure Game
==================

(Shaun A. Noordin || shaunanoordin.com || 20160517)
********************************************************************************
 */

import { AvO } from "./avo/index.js";
import { Nonita60 } from "./nonita-60/index.js";
 
/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function() {
  window.app = new AvO(new Nonita60());
};
//==============================================================================
