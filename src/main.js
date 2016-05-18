/*  
AvO Adventure Game
==================

(Shaun A. Noordin || shaunanoordin.com || 20160517)
********************************************************************************
 */

/*  Primary App Class
 */
//==============================================================================
class App {
  constructor() {
    //Bind functions to 'this' reference.
    //--------------------------------
    this.run = this.run.bind(this);
    this.paint = this.paint.bind(this);
    //--------------------------------

    //Initialise properties
    //--------------------------------
    this.runCycle = undefined;
    this.html = document.getElementById("app");
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.boundingBox = undefined;  //To be defined by this.updateSize().
    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    //--------------------------------
    
    //Initialise Game Objects
    //--------------------------------
    this.actors = [];
    //--------------------------------
    
    //Prepare Input
    //--------------------------------
    this.keys = new Array(MAX_KEYS);
    for (let i = 0; i < this.keys.length; i++) {
      this.keys[i] = {
        state: INPUT_IDLE,
        duration: 0
      };
    }
    this.pointer = {
      start: { x: 0, y: 0 },
      now: { x: 0, y: 0 },
      state: INPUT_IDLE,
      duration: 0
    }
    //--------------------------------
    
    //Bind Events
    //--------------------------------
    if ("onmousedown" in this.canvas && "onmousemove" in this.canvas &&
        "onmouseup" in this.canvas) {
      this.canvas.onmousedown = this.onPointerStart.bind(this);
      this.canvas.onmousemove = this.onPointerMove.bind(this);
      this.canvas.onmouseup = this.onPointerEnd.bind(this);
    }    
    if ("ontouchstart" in this.canvas && "ontouchmove" in this.canvas &&
        "ontouchend" in this.canvas && "ontouchcancel" in this.canvas) {
      this.canvas.ontouchstart = this.onPointerStart.bind(this);
      this.canvas.ontouchmove = this.onPointerMove.bind(this);
      this.canvas.ontouchend = this.onPointerEnd.bind(this);
      this.canvas.ontouchcancel = this.onPointerEnd.bind(this);
    }
    if ("onkeydown" in window && "onkeyup" in window) {
      window.onkeydown = this.onKeyDown.bind(this);
      window.onkeyup = this.onKeyUp.bind(this);
    }
    if ("onresize" in window) {
      window.onresize = this.updateSize.bind(this);
    }
    this.updateSize();
    //--------------------------------
    
    //TEST
    //--------------------------------
    this.actors.push(new Actor('c1', this.width / 2, this.height / 2, 32, SHAPE_CIRCLE));
    this.actors.push(new Actor('s1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 16 + Math.random() * 32, SHAPE_SQUARE));
    this.actors.push(new Actor('c2', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 16 + Math.random() * 32, SHAPE_CIRCLE));
    //--------------------------------
    
    //Start!
    //--------------------------------
    this.runCycle = setInterval(this.run, 1 / FRAMES_PER_SECOND);
    //--------------------------------
  }
  
  //----------------------------------------------------------------
  
  run() {
    //TEST
    //--------------------------------
    if (this.pointer.state === INPUT_ACTIVE) {
      const distX = this.pointer.now.x - this.pointer.start.x;
      const distY = this.pointer.now.y - this.pointer.start.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
        const angle = Math.atan2(distY, distX);
        const speed = 1;
        this.actors[0].x += Math.cos(angle) * speed;
        this.actors[0].y += Math.sin(angle) * speed;
        
        //UX improvement: reset the base point of the pointer so the player can
        //switch directions much more easily.
        if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2) {
          this.pointer.start.x = this.pointer.now.x - Math.cos(angle) *
            INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
          this.pointer.start.y = this.pointer.now.y - Math.sin(angle) *
            INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
        }
      }
    }
    
    if (this.keys[KEY_CODES.UP].state === INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state !== INPUT_ACTIVE) {
      this.actors[0].y -= 1
    } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
      this.actors[0].y += 1
    }
    if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
      this.actors[0].x -= 1
    } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
      this.actors[0].x += 1
    }
    //--------------------------------
    
    //Visuals
    //--------------------------------
    this.paint();
    //--------------------------------
  }
  
  paint() {
    //Clear
    this.context.clearRect(0, 0, this.width, this.height);
    
    //Paint hitboxes
    for (let actor of this.actors) {
      this.context.beginPath();
      switch (actor.shape) {
        case SHAPE_CIRCLE:
          this.context.arc(actor.x, actor.y, actor.size/2, 0, 2 * Math.PI);
          this.context.stroke();
          break;
        case SHAPE_SQUARE:
          this.context.rect(actor.x - actor.size / 2, actor.y - actor.size / 2, actor.size, actor.size);
          this.context.stroke();
          break;
      }
      this.context.closePath();
    }
    
  }
  
  //----------------------------------------------------------------
  
  onPointerStart(e) {
    this.pointer.state = INPUT_ACTIVE;
    this.pointer.duration = 1;
    this.pointer.start = this.getPointerXY(e);
    this.pointer.now = this.pointer.start;
    return Utility.stopEvent(e);
  }
  
  onPointerMove(e) {
    if (this.pointer.state === INPUT_ACTIVE) {
      this.pointer.now = this.getPointerXY(e);
    }
    return Utility.stopEvent(e);
  }
  
  onPointerEnd(e) {
    this.pointer.state = INPUT_ENDED;
    //this.pointer.now = this.getPointerXY(e);
    return Utility.stopEvent(e);
  }
  
  getPointerXY(e) {
    let clientX = 0;
    let clientY = 0;
    if (e.clientX && e.clientY) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches.length > 0 && e.touches[0].clientX &&
        e.touches[0].clientY) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    let inputX = (clientX - this.boundingBox.left) * this.sizeRatioX;
    let inputY = (clientY - this.boundingBox.top) * this.sizeRatioY;
    return { x: inputX, y: inputY };
  }
  
  //----------------------------------------------------------------
  
  onKeyDown(e) {
    let keyCode = Utility.getKeyCode(e);    
    if (keyCode > 0 && keyCode < MAX_KEYS && this.keys[keyCode].state != INPUT_ACTIVE) {
      this.keys[keyCode].state = INPUT_ACTIVE;
      this.keys[keyCode].duration = 1;
    }  //if keyCode == 0, there's an error.
  }
  
  onKeyUp(e) {
    let keyCode = Utility.getKeyCode(e);    
    if (keyCode > 0 && keyCode < MAX_KEYS) {
      this.keys[keyCode].state = INPUT_ENDED;
    }  //if keyCode == 0, there's an error.
  }
  
  //----------------------------------------------------------------
  
  updateSize() {
    let boundingBox = (this.canvas.getBoundingClientRect)
      ? this.canvas.getBoundingClientRect()
      : { left: 0, top: 0 };
    this.boundingBox = boundingBox;
    this.sizeRatioX = this.width / this.boundingBox.width;
    this.sizeRatioY = this.height / this.boundingBox.height;
  }
}

const FRAMES_PER_SECOND = 50;
const INPUT_IDLE = 0;
const INPUT_ACTIVE = 1;
const INPUT_ENDED = 2;
const INPUT_DISTANCE_SENSITIVITY = 16;
const MAX_KEYS = 128;
//==============================================================================

/*  Actor Class
 */
//==============================================================================
class Actor {
  constructor(name = '', x = 0, y = 0, size = 32, shape = SHAPE_CIRCLE) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
  }
}

const SHAPE_SQUARE = 0;
const SHAPE_CIRCLE = 1;
//==============================================================================

/*  Utility Classes
 */
//==============================================================================
const Utility = {
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
    if (e.code && KeyValues[e.code]) {
      return KeyValues[e.code]
    } else if (e.key && KeyValues[e.key]) {
      return KeyValues[e.key]
    }
    
    return 0;
  }
}

const KEY_CODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,
  SPACE: 32,
  ESCAPE: 27
}

const KEY_VALUES = {
  "ArrowLeft": KEY_CODES.LEFT,
  "Left": KEY_CODES.LEFT,
  "ArrowUp": KEY_CODES.UP,
  "Up": KEY_CODES.UP,
  "ArrowDown": KEY_CODES.DOWN,
  "Down": KEY_CODES.DOWN,
  "ArrowRight": KEY_CODES.RIGHT,
  "Right": KEY_CODES.RIGHT,
  "Enter": KEY_CODES.ENTER,
  "Space": KEY_CODES.SPACE,
  " ": KEY_CODES.SPACE,
  "Esc": KEY_CODES.ESCAPE,
  "Escape": KEY_CODES.ESCAPE
}

function ImageAsset(url) {
  this.url = url;
  this.img = null;
  this.loaded = false;
  this.img = new Image();
  this.img.onload = function() {
    this.loaded = true;
  }.bind(this);
  this.img.src = this.url;
}
//==============================================================================

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function() {
  window.app = new App();
};
//==============================================================================
