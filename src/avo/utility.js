/*
Utility Classes
===============

(Shaun A. Noordin || shaunanoordin.com || 20160901)
********************************************************************************
 */

import { KEY_VALUES } from "./constants.js";

export const Utility = {
  randomInt: function (min, max) {
    let a = min < max ? min : max;
    let b = min < max ? max : min;
    return Math.floor(a + Math.random() * (b - a  + 1));
  },

  stopEvent: function (e) {
    //var eve = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = true;
    return false;
  },
  
  getKeyCode(e) {
    //KeyboardEvent.keyCode is the most reliable identifier for a keyboard event
    //at the moment, but unfortunately it's being deprecated.
    if (e.keyCode) {
      return e.keyCode;
    }
    
    //KeyboardEvent.code and KeyboardEvent.key are the 'new' standards, but it's
    //far from being standardised between browsers.
    if (e.code && KEY_VALUES[e.code]) {
      return KEY_VALUES[e.code]
    } else if (e.key && KEY_VALUES[e.key]) {
      return KEY_VALUES[e.key]
    }
    
    return 0;
  }
};

export function ImageAsset(url) {
  this.url = url;
  this.img = null;
  this.loaded = false;
  this.img = new Image();
  this.img.onload = function() {
    this.loaded = true;
  }.bind(this);
  this.img.src = this.url;
}
