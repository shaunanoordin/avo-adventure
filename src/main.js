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
    this.assets = {
      images: {
        actor: new ImageAsset("assets/actor.png"),
      }
    }
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
    
    //TEST: ANIMATIONS
    //--------------------------------
    const STEPS_PER_SECOND = FRAMES_PER_SECOND / 10;
    this.animationSets = {
      "actor": {
        "tileWidth": 64,
        "tileHeight": 64,
        "tileOffsetX": 0,
        "tileOffsetY": 0,        
        "actions": {
          "idle": {
            "loop": true,
            "steps": [
              { row: 0, duration: STEPS_PER_SECOND }
            ],
          },
          "walk": {
            "tileWidth": 64,
            "tileHeight": 64,
            "tileOffsetX": 0,
            "tileOffsetY": 0,
            "loop": true,
            "steps": [
              { row: 1, duration: STEPS_PER_SECOND },
              { row: 2, duration: STEPS_PER_SECOND },
              { row: 3, duration: STEPS_PER_SECOND },
              { row: 2, duration: STEPS_PER_SECOND },
            ],
          },
        },
      },
    };
    
    //Process Animations; expand steps to many frames per steps.
    //----------------
    for (let animationTitle in this.animationSets) {
      let animationSet = this.animationSets[animationTitle];
      for (let animationName in animationSet.actions) {
        let animationAction = animationSet.actions[animationName];
        let newSteps = [];
        for (let step of animationAction.steps) {
          for (let i = 0; i < step.duration; i++) { newSteps.push(step); }
        }
        animationAction.steps = newSteps;
      }
    }
    //----------------
    //--------------------------------
    
    
    //TEST: In-Game Objects
    //--------------------------------
    this.player = new Actor('player', this.width / 2, this.height / 2, 32, SHAPE_CIRCLE, true);
    this.player.spritesheet = new ImageAsset("assets/actor.png");
    this.player.animationStep = 0;
    this.player.animationSet = this.animationSets["actor"];
    console.log(this.player);
    this.actors.push(this.player);
    //TODO
    
    this.actors.push(new Actor('s1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_SQUARE));
    this.actors.push(new Actor('s2', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_SQUARE));
    this.actors.push(new Actor('c1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    this.actors.push(new Actor('c2', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    
    this.actors[0].canBeMoved = true;
    this.actors[1].canBeMoved = true;
    this.actors[2].canBeMoved = true;
    this.actors[3].canBeMoved = true;
    this.actors[4].canBeMoved = true;
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
    const PLAYER_SPEED = 4;
    if (this.pointer.state === INPUT_ACTIVE) {
      const distX = this.pointer.now.x - this.pointer.start.x;
      const distY = this.pointer.now.y - this.pointer.start.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
        const angle = Math.atan2(distY, distX);
        const speed = PLAYER_SPEED;
        this.player.x += Math.cos(angle) * speed;
        this.player.y += Math.sin(angle) * speed;
        this.player.rotation = angle;
        
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
      this.player.y -= PLAYER_SPEED;
      this.player.direction = DIRECTION_NORTH;
    } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
      this.player.y += PLAYER_SPEED;
      this.player.direction = DIRECTION_SOUTH;
    }
    if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
      this.player.x -= PLAYER_SPEED;
      this.player.direction = DIRECTION_WEST;
    } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
      this.player.x += PLAYER_SPEED;
      this.player.direction = DIRECTION_EAST;
    }
    
    if (this.keys[KEY_CODES.A].state === INPUT_ACTIVE && this.keys[KEY_CODES.D].state !== INPUT_ACTIVE) {
      this.player.rotation -= Math.PI / 36;
    } else if (this.keys[KEY_CODES.A].state !== INPUT_ACTIVE && this.keys[KEY_CODES.D].state === INPUT_ACTIVE) {
      this.player.rotation += Math.PI / 36;
    }
    
    if (this.keys[KEY_CODES.W].state === INPUT_ACTIVE) {
      this.player.x += Math.cos(this.player.rotation) * PLAYER_SPEED;
      this.player.y += Math.sin(this.player.rotation) * PLAYER_SPEED;
    } else if (this.keys[KEY_CODES.S].state === INPUT_ACTIVE) {
      this.player.x -= Math.cos(this.player.rotation) * PLAYER_SPEED;
      this.player.y -= Math.sin(this.player.rotation) * PLAYER_SPEED;
    }
    
    if (this.keys[KEY_CODES.SPACE].duration === 2) {
      this.player.shape = (this.player.shape === SHAPE_CIRCLE)
        ? SHAPE_SQUARE
        : SHAPE_CIRCLE;
    }
    
    //Try animation!
    this.player.playAnimation("walk");
    //--------------------------------
    
    //Physics
    //--------------------------------
    this.physics();
    //--------------------------------
    
    //Visuals
    //--------------------------------
    //Arrange sprites by vertical order.
    this.actors.sort((a, b) => {
      return a.y < b.y;
    });    
    
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
      if (Math.abs(distX) > Math.abs(distY)) {
        actorA.x -= Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionA;
        actorB.x += Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionB;
      } else {
        actorA.y -= Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionA;
        actorB.y += Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionB;
      }
    }
    
    else if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_SQUARE) {
      const distX = actorA.x - Math.max(actorB.left, Math.min(actorB.right, actorA.x));
      const distY = actorA.y - Math.max(actorB.top, Math.min(actorB.bottom, actorA.y));
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = actorA.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      actorA.x += cosAngle * (correctDist - dist) * fractionA;
      actorA.y += sinAngle * (correctDist - dist) * fractionA;
      actorB.x -= cosAngle * (correctDist - dist) * fractionB;
      actorB.y -= sinAngle * (correctDist - dist) * fractionB;
    }
    
    else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_CIRCLE) {
      const distX = actorB.x - Math.max(actorA.left, Math.min(actorA.right, actorB.x));
      const distY = actorB.y - Math.max(actorA.top, Math.min(actorA.bottom, actorB.y));
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = actorB.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      actorA.x -= cosAngle * (correctDist - dist) * fractionA;
      actorA.y -= sinAngle * (correctDist - dist) * fractionA;
      actorB.x += cosAngle * (correctDist - dist) * fractionB;
      actorB.y += sinAngle * (correctDist - dist) * fractionB;
    }
  }
  
  //----------------------------------------------------------------
  
  paint() {
    //Clear
    this.context.clearRect(0, 0, this.width, this.height);
    
    //Paint hitboxes
    for (let actor of this.actors) {
      switch (actor.shape) {
        case SHAPE_CIRCLE:
          this.context.beginPath();
          this.context.arc(actor.x, actor.y, actor.size/2, 0, 2 * Math.PI);
          this.context.stroke();
          this.context.closePath();
          this.context.beginPath();
          this.context.moveTo(actor.x, actor.y);
          this.context.lineTo(actor.x + Math.cos(actor.rotation) * actor.size, actor.y + Math.sin(actor.rotation) * actor.size);
          this.context.stroke();
          this.context.closePath();
          break;
        case SHAPE_SQUARE:
          this.context.beginPath();
          this.context.rect(actor.x - actor.size / 2, actor.y - actor.size / 2, actor.size, actor.size);
          this.context.stroke();
          this.context.closePath();
          break;
      }
    }
    
    //Paint sprites
    for (let actor of this.actors) {
      if (!actor.spritesheet || !actor.spritesheet.loaded ||
          !actor.animationSet || !actor.animationSet.actions[actor.animationName])
        continue;
      
      //TEST
      const animationSet = actor.animationSet;
      const srcW = animationSet.tileWidth;
      const srcH = animationSet.tileHeight;
      const srcX = srcW * actor.direction;
      const srcY = animationSet.actions[actor.animationName].steps[actor.animationStep].row * srcH;
      const tgtX = Math.floor(actor.x - srcW / 2);
      const tgtY = Math.floor(actor.y - srcH / 2);
      const tgtW = srcW;
      const tgtH = srcH;
      
      this.context.drawImage(actor.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
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
    this.rotation = ROTATION_SOUTH;  //Rotation in radians; clockwise positive.
    
    this.spritesheet = null;
    this.animationStep = 0;
    this.animationSet = null;
    this.animationName = "";
  }
  
  playAnimation(animationName = "", restart = false) {
    if (!this.animationSet || !this.animationSet.actions[animationName]) return;
    
    //let animationSet = this.animationSet[animationName];
    let animationAction = this.animationSet.actions[animationName];
    
    if (restart || this.animationName !== animationName) {  //Set this as the new animation
      this.animationStep = 0;
      this.animationName = animationName;
    } else {  //Take a step through the current animation
      this.animationStep++;
      if (animationAction.steps.length === 0) {
        this.animationStep = 0;
      } else if (animationAction.loop) {
        while (this.animationStep >= animationAction.steps.length) this.animationStep -= animationAction.steps.length;
      } else {
        this.animationStep = animationAction.steps.length - 1;
      }
    }
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }
  
  get rotation() { return this._rotation; }
  set rotation(val) {
    this._rotation = val;
    while (this._rotation > Math.PI) { this._rotation -= Math.PI * 2; }
    while (this._rotation <= -Math.PI) { this._rotation += Math.PI * 2; }
  }
  get direction() {  //Get cardinal direction
    //Favour East and West when rotation is exactly SW, NW, SE or NE.
    if (this._rotation <= Math.PI * 0.25 && this._rotation >= Math.PI * -0.25) { return DIRECTION_EAST; }
    else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) { return DIRECTION_SOUTH; }
    else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) { return DIRECTION_NORTH; }
    else { return DIRECTION_WEST; }
  }
  set direction(val) {
    switch (val) {
      case DIRECTION_EAST:
        this._rotation = ROTATION_EAST;
        break;
      case DIRECTION_SOUTH:
        this._rotation = ROTATION_SOUTH;
        break;
      case DIRECTION_WEST:
        this._rotation = ROTATION_WEST;
        break;
      case DIRECTION_NORTH:
        this._rotation = ROTATION_NORTH;
        break;
    }
  }
}

const SHAPE_NONE = 0;  //No shape = no collision
const SHAPE_SQUARE = 1;
const SHAPE_CIRCLE = 2;

const ROTATION_EAST = 0;
const ROTATION_SOUTH = Math.PI / 2;
const ROTATION_WEST = Math.PI;
const ROTATION_NORTH = -Math.PI / 2;

const DIRECTION_EAST = 0;
const DIRECTION_SOUTH = 1;
const DIRECTION_WEST = 2;
const DIRECTION_NORTH = 3;
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
  ESCAPE: 27,
  TAB: 9,
  SHIFT: 16,
  
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,

  NUM0: 48,  
  NUM1: 49,
  NUM2: 50,
  NUM3: 51,
  NUM4: 52,
  NUM5: 53,
  NUM6: 54,
  NUM7: 55,
  NUM8: 56,
  NUM9: 57,
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
  "Escape": KEY_CODES.ESCAPE,
  "Tab": KEY_CODES.TAB,
  "Shift": KEY_CODES.SHIFT,
  "ShiftLeft": KEY_CODES.SHIFT,
  "ShiftRight": KEY_CODES.SHIFT,
  
  "A": KEY_CODES.A,
  "KeyA": KEY_CODES.A,
  "B": KEY_CODES.B,
  "KeyB": KEY_CODES.B,
  "C": KEY_CODES.C,
  "KeyC": KEY_CODES.C,
  "D": KEY_CODES.D,
  "KeyD": KEY_CODES.D,
  "E": KEY_CODES.E,
  "KeyE": KEY_CODES.E,
  "F": KEY_CODES.F,
  "KeyF": KEY_CODES.F,
  "G": KEY_CODES.G,
  "KeyG": KEY_CODES.G,
  "H": KEY_CODES.H,
  "KeyH": KEY_CODES.H,
  "I": KEY_CODES.I,
  "KeyI": KEY_CODES.I,
  "J": KEY_CODES.J,
  "KeyJ": KEY_CODES.J,
  "K": KEY_CODES.K,
  "KeyK": KEY_CODES.K,
  "L": KEY_CODES.L,
  "KeyL": KEY_CODES.L,
  "M": KEY_CODES.M,
  "KeyM": KEY_CODES.M,
  "N": KEY_CODES.N,
  "KeyN": KEY_CODES.N,
  "O": KEY_CODES.O,
  "KeyO": KEY_CODES.O,
  "P": KEY_CODES.P,
  "KeyP": KEY_CODES.P,
  "Q": KEY_CODES.Q,
  "KeyQ": KEY_CODES.Q,
  "R": KEY_CODES.R,
  "KeyR": KEY_CODES.R,
  "S": KEY_CODES.S,
  "KeyS": KEY_CODES.S,
  "T": KEY_CODES.T,
  "KeyT": KEY_CODES.T,
  "U": KEY_CODES.U,
  "KeyU": KEY_CODES.U,
  "V": KEY_CODES.V,
  "KeyV": KEY_CODES.V,
  "W": KEY_CODES.W,
  "KeyW": KEY_CODES.W,
  "X": KEY_CODES.X,
  "KeyX": KEY_CODES.X,
  "Y": KEY_CODES.Y,
  "KeyY": KEY_CODES.Y,
  "Z": KEY_CODES.Z,
  "KeyZ": KEY_CODES.Z,
  
  "0": KEY_CODES.NUM0,
  "Digit0": KEY_CODES.NUM0,
  "1": KEY_CODES.NUM1,
  "Digit1": KEY_CODES.NUM1,
  "2": KEY_CODES.NUM2,
  "Digit2": KEY_CODES.NUM2,
  "3": KEY_CODES.NUM3,
  "Digit3": KEY_CODES.NUM3,
  "4": KEY_CODES.NUM4,
  "Digit4": KEY_CODES.NUM4,
  "5": KEY_CODES.NUM5,
  "Digit5": KEY_CODES.NUM5,
  "6": KEY_CODES.NUM6,
  "Digit6": KEY_CODES.NUM6,
  "7": KEY_CODES.NUM7,
  "Digit7": KEY_CODES.NUM7,
  "8": KEY_CODES.NUM8,
  "Digit8": KEY_CODES.NUM8,
  "9": KEY_CODES.NUM9,
  "Digit9": KEY_CODES.NUM9,
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
