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
    this.physics = this.physics.bind(this);
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
    this.actors.push(new Actor('player', this.width / 2, this.height / 2, 64, SHAPE_CIRCLE, true));
    this.actors.push(new Actor('s1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 64, SHAPE_SQUARE));
    this.actors.push(new Actor('s2', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 64, SHAPE_SQUARE));
    this.actors.push(new Actor('s3', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 64, SHAPE_SQUARE));
    this.actors.push(new Actor('s4', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 64, SHAPE_SQUARE));
    this.actors.push(new Actor('c1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    this.actors.push(new Actor('c2', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    this.actors.push(new Actor('c3', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    this.actors.push(new Actor('c4', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    
    this.actors[0].canBeMoved = true;
    this.actors[1].canBeMoved = true;
    this.actors[2].canBeMoved = true;
    //--------------------------------
    
    //Start!
    //--------------------------------
    this.runCycle = setInterval(this.run, 1000 / FRAMES_PER_SECOND);
    //--------------------------------
  }
  
  //----------------------------------------------------------------
  
  run() {
    //TEST: Input & Actions
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
      this.actors[0].y -= 2;
    } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
      this.actors[0].y += 2;
    }
    if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
      this.actors[0].x -= 2;
    } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
      this.actors[0].x += 2;
    }
    
    if (this.keys[KEY_CODES.SPACE].duration === 2) {
      this.actors[0].shape = (this.actors[0].shape === SHAPE_CIRCLE)
        ? SHAPE_SQUARE
        : SHAPE_CIRCLE;
    }
    //--------------------------------
    
    //Physics
    //--------------------------------
    this.physics();
    //--------------------------------
    
    //Visuals
    //--------------------------------
    this.paint();
    //--------------------------------
    
    //Cleanup Input
    //--------------------------------
    if (this.pointer.state === INPUT_ENDED) {
      this.pointer.duration = 0;
      this.pointer.state = INPUT_IDLE;
    }
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].state === INPUT_ACTIVE) {
        this.keys[i].duration++;
      } else if (this.keys[i].state === INPUT_ENDED) {
        this.keys[i].duration = 0;
        this.keys[i].state = INPUT_IDLE;
      }
    }
    //--------------------------------
  }
  
  //----------------------------------------------------------------
  
  physics() {
    for (let a = 0; a < this.actors.length; a++) {
      let actorA = this.actors[a];
      for (let b = a + 1; b < this.actors.length; b++) {
        let actorB = this.actors[b];
        if (this.checkCollision(actorA, actorB)) {
          this.correctCollision(actorA, actorB);
        }
      }
    }
  }
  
  checkCollision(actorA, actorB) {
    if (!actorA || !actorB) return false;
    
    if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_CIRCLE) {
      const distX = actorA.x - actorB.x;
      const distY = actorA.y - actorB.y;
      const minimumDist = actorA.radius + actorB.radius;
      if (distX * distX + distY * distY < minimumDist * minimumDist) {
        return true;
      }
    }
    
    else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_SQUARE) {
      if (actorA.left < actorB.right &&
          actorA.right > actorB.left &&
          actorA.top < actorB.bottom &&
          actorA.bottom > actorB.top) {
        return true;
      }
    }
    
    else if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_SQUARE) {
      const distX = actorA.x - Math.max(actorB.left, Math.min(actorB.right, actorA.x));
      const distY = actorA.y - Math.max(actorB.top, Math.min(actorB.bottom, actorA.y));
      if (distX * distX + distY * distY < actorA.radius * actorA.radius) {
        return true;
      }
    }
    
    else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_CIRCLE) {
      const distX = actorB.x - Math.max(actorA.left, Math.min(actorA.right, actorB.x));
      const distY = actorB.y - Math.max(actorA.top, Math.min(actorA.bottom, actorB.y));
      if (distX * distX + distY * distY < actorB.radius * actorB.radius) {
        return true;
      }
    }
    
    return false;
  }
  
  correctCollision(actorA, actorB) {
    if (!actorA || !actorB || !actorA.solid || !actorB.solid) return;
    
    let fractionA = 0;
    let fractionB = 0;
    if (actorA.canBeMoved && actorB.canBeMoved) {
      fractionA = 0.5;
      fractionB = 0.5;
    } else if (actorA.canBeMoved) {
      fractionA = 1;
    } else if (actorB.canBeMoved) {
      fractionB = 1;
    }
    
    if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_CIRCLE) {
      const distX = actorB.x - actorA.x;
      const distY = actorB.y - actorA.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = actorA.radius + actorB.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      actorA.x -= cosAngle * (correctDist - dist) * fractionA;
      actorA.y -= sinAngle * (correctDist - dist) * fractionA;
      actorB.x += cosAngle * (correctDist - dist) * fractionB;
      actorB.y += sinAngle * (correctDist - dist) * fractionB;
    }
    
    else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_SQUARE) {
      const distX = actorB.x - actorA.x;
      const distY = actorB.y - actorA.y;
      const correctDist = (actorA.size + actorB.size) / 2;
      console.log(distX + " " + distY + " " + correctDist);
      
      if (Math.abs(distX) > Math.abs(distY)) {
        actorA.x -= Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionA;
        actorB.x += Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionB;
      } else {
        actorA.y -= Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionA;
        actorB.y += Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionB;
      }
      
    }
  }
  
  //----------------------------------------------------------------
  
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
  constructor(name = '', x = 0, y = 0, size = 32, shape = SHAPE_NONE) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.solid = (shape !== SHAPE_NONE);
    this.canBeMoved = true;
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }  
}

const SHAPE_NONE = 0;  //No shape = no collision
const SHAPE_SQUARE = 1;
const SHAPE_CIRCLE = 2;
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
