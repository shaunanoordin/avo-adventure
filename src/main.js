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
  constructor(startScript) {
    //Initialise properties
    //--------------------------------
    this.debugMode = false;
    this.runCycle = undefined;
    this.html = document.getElementById("app");
    this.canvas = document.getElementById("canvas");
    this.context2d = this.canvas.getContext("2d");
    this.boundingBox = undefined;  //To be defined by this.updateSize().
    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.state = null;
    this.animationSets = {};
    //--------------------------------
    
    //Initialise Game Objects
    //--------------------------------
    this.assets = {
      images: {}
    };
    this.assetsLoaded = 0;
    this.assetsTotal = 0;
    this.scripts = {
      run: null,
      runStart: null,
      runAction: null,
      runComic: null,
      runEnd: null,
    };
    this.actors = [];
    this.areasOfEffect = [];
    this.refs = {};
    this.store = {};
    this.ui = {
      foregroundImage: null,
      backgroundImage: null,
    };
    this.comicStrip = null;
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
    };
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
    
    //Start!
    //--------------------------------
    this.changeState(STATE_START, startScript);
    this.runCycle = setInterval(this.run.bind(this), 1000 / FRAMES_PER_SECOND);
    //--------------------------------
  }
  
  //----------------------------------------------------------------
  
  changeState(state, script = null) {
    this.state = state;
    if (script && typeof script === "function") {
      script.apply(this);
    }
  }
  
  run() {
    if (this.scripts.run) this.scripts.run.apply(this);
    
    switch (this.state) {
      case STATE_START:
        this.run_start();
        break;
      case STATE_END:
        this.run_end();
        break;
      case STATE_ACTION:
        this.run_action();
        break;
      case STATE_COMIC:
        this.run_comic();
        break;
    }
    
    this.paint();
  }
  
  run_start() {
    this.assetsLoaded = 0;
    this.assetsTotal = 0;    
    for (let category in this.assets) {
      for (let asset in this.assets[category]) {
        this.assetsTotal++;
        if (this.assets[category][asset].loaded) this.assetsLoaded++;
      }
    }
    if (this.assetsLoaded < this.assetsTotal) return;
    
    if (this.scripts.runStart) this.scripts.runStart.apply(this);
  }
  
  run_end() {
    if (this.scripts.runEnd) this.scripts.runEnd.apply(this);
  }
    
  run_action() {
    //Run Global Scripts
    //--------------------------------
    if (this.scripts.runAction) this.scripts.runAction.apply(this);
    //--------------------------------
    
    //AoEs apply Effects
    //--------------------------------
    for (let aoe of this.areasOfEffect) {
      for (let actor of this.actors) {
        if (this.isATouchingB(aoe, actor)) {
          for (let effect of aoe.effects) {
            actor.effects.push(effect.copy());
          }
        }
      }
    }
    //--------------------------------
    
    //Actors react to Effects
    //--------------------------------
    for (let actor of this.actors) {
      for (let effect of actor.effects) {
        //TODO make this an external script
        //----------------
        if (effect.name === "push" && actor.canBeMoved) {
          actor.x += effect.data.x || 0;
          actor.y += effect.data.y || 0;
        }
        //----------------
      }
    }
    //--------------------------------
    
    //Physics
    //--------------------------------
    this.physics();
    //--------------------------------
    
    //Visuals
    //--------------------------------
    //Arrange sprites by vertical order.
    this.actors.sort((a, b) => {
      return a.bottom - b.bottom;
    });
    //this.paint();  //moved to run()
    //--------------------------------
    
    //Cleanup AoEs
    //--------------------------------
    for (let i = this.areasOfEffect.length - 1; i >= 0; i--) {
      var aoe = this.areasOfEffect[i];
      if (!aoe.hasInfiniteDuration()) {
        aoe.duration--;
        if (aoe.duration <= 0) {
          this.areasOfEffect.splice(i, 1);
        }
      }
    }
    //--------------------------------
    
    //Cleanup Effects
    //--------------------------------
    for (let actor of this.actors) {
      for (let i = actor.effects.length - 1; i >= 0; i--) {        
        if (!actor.effects[i].hasInfiniteDuration()) {
          actor.effects[i].duration--;
          if (actor.effects[i].duration <= 0) {
            actor.effects.splice(i, 1);
          }
        }
      }
    }
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
  
  run_comic() {
    if (this.scripts.runComic) this.scripts.runComic.apply(this);
    
    if (!this.comicStrip) return;
    const comic = this.comicStrip;
    
    if (comic.state !== COMIC_STRIP_STATE_TRANSITIONING &&
        comic.currentPanel >= comic.panels.length) {
      comic.onFinish.apply(this);
    }
    
    switch (comic.state) {
      case COMIC_STRIP_STATE_TRANSITIONING:
        if (comic.counter < comic.transitionTime) {
          comic.counter++;          
        } else {
          comic.counter = 0;
          comic.state = COMIC_STRIP_STATE_WAIT_BEFORE_INPUT
        }
        break;
      case COMIC_STRIP_STATE_WAIT_BEFORE_INPUT:
        if (comic.counter < comic.waitTime) {
          comic.counter++;
        } else {
          comic.counter = 0;
          comic.state = COMIC_STRIP_STATE_IDLE;
        }
        break;
      case COMIC_STRIP_STATE_IDLE:
        if (this.pointer.state === INPUT_ACTIVE || 
            this.keys[KEY_CODES.UP].state === INPUT_ACTIVE ||
            this.keys[KEY_CODES.SPACE].state === INPUT_ACTIVE ||
            this.keys[KEY_CODES.ENTER].state === INPUT_ACTIVE) {
          comic.currentPanel++;
          comic.state = COMIC_STRIP_STATE_TRANSITIONING;
        }        
        break;
    }
  }
  
  //----------------------------------------------------------------
  
  physics() {
    for (let a = 0; a < this.actors.length; a++) {
      let actorA = this.actors[a];
      for (let b = a + 1; b < this.actors.length; b++) {
        let actorB = this.actors[b];
        if (this.isATouchingB(actorA, actorB)) {
          this.correctCollision(actorA, actorB);
        }
      }
    }
  }
  
  isATouchingB(objA, objB) {
    if (!objA || !objB) return false;
    
    if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_CIRCLE) {
      const distX = objA.x - objB.x;
      const distY = objA.y - objB.y;
      const minimumDist = objA.radius + objB.radius;
      if (distX * distX + distY * distY < minimumDist * minimumDist) {
        return true;
      }
    }
    
    else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_SQUARE) {
      if (objA.left < objB.right &&
          objA.right > objB.left &&
          objA.top < objB.bottom &&
          objA.bottom > objB.top) {
        return true;
      }
    }
    
    else if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_SQUARE) {
      const distX = objA.x - Math.max(objB.left, Math.min(objB.right, objA.x));
      const distY = objA.y - Math.max(objB.top, Math.min(objB.bottom, objA.y));
      if (distX * distX + distY * distY < objA.radius * objA.radius) {
        return true;
      }
    }
    
    else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_CIRCLE) {
      const distX = objB.x - Math.max(objA.left, Math.min(objA.right, objB.x));
      const distY = objB.y - Math.max(objA.top, Math.min(objA.bottom, objB.y));
      if (distX * distX + distY * distY < objB.radius * objB.radius) {
        return true;
      }
    }
    
    return false;
  }
  
  correctCollision(objA, objB) {
    if (!objA || !objB || !objA.solid || !objB.solid) return;
    
    let fractionA = 0;
    let fractionB = 0;
    if (objA.canBeMoved && objB.canBeMoved) {
      fractionA = 0.5;
      fractionB = 0.5;
    } else if (objA.canBeMoved) {
      fractionA = 1;
    } else if (objB.canBeMoved) {
      fractionB = 1;
    }
    
    if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_CIRCLE) {
      const distX = objB.x - objA.x;
      const distY = objB.y - objA.y;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = objA.radius + objB.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      objA.x -= cosAngle * (correctDist - dist) * fractionA;
      objA.y -= sinAngle * (correctDist - dist) * fractionA;
      objB.x += cosAngle * (correctDist - dist) * fractionB;
      objB.y += sinAngle * (correctDist - dist) * fractionB;
    }
    
    else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_SQUARE) {
      const distX = objB.x - objA.x;
      const distY = objB.y - objA.y;
      const correctDist = (objA.size + objB.size) / 2;
      if (Math.abs(distX) > Math.abs(distY)) {
        objA.x -= Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionA;
        objB.x += Math.sign(distX) * (correctDist - Math.abs(distX)) * fractionB;
      } else {
        objA.y -= Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionA;
        objB.y += Math.sign(distY) * (correctDist - Math.abs(distY)) * fractionB;
      }
    }
    
    else if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_SQUARE) {
      const distX = objA.x - Math.max(objB.left, Math.min(objB.right, objA.x));
      const distY = objA.y - Math.max(objB.top, Math.min(objB.bottom, objA.y));
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = objA.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      objA.x += cosAngle * (correctDist - dist) * fractionA;
      objA.y += sinAngle * (correctDist - dist) * fractionA;
      objB.x -= cosAngle * (correctDist - dist) * fractionB;
      objB.y -= sinAngle * (correctDist - dist) * fractionB;
    }
    
    else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_CIRCLE) {
      const distX = objB.x - Math.max(objA.left, Math.min(objA.right, objB.x));
      const distY = objB.y - Math.max(objA.top, Math.min(objA.bottom, objB.y));
      const dist = Math.sqrt(distX * distX + distY * distY);
      const angle = Math.atan2(distY, distX);
      const correctDist = objB.radius;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      objA.x -= cosAngle * (correctDist - dist) * fractionA;
      objA.y -= sinAngle * (correctDist - dist) * fractionA;
      objB.x += cosAngle * (correctDist - dist) * fractionB;
      objB.y += sinAngle * (correctDist - dist) * fractionB;
    }
  }
  
  //----------------------------------------------------------------
  
  paint() {
    //Clear
    this.context2d.clearRect(0, 0, this.width, this.height);
    
    if (this.ui.backgroundImage && this.ui.backgroundImage.loaded) {
      const image = this.ui.backgroundImage;
      this.context2d.drawImage(image.img, (this.width - image.img.width) / 2, (this.height - image.img.height) / 2);
    }
    
    switch (this.state) {
      case STATE_START:
        this.paint_start();
        break;
      case STATE_END:
        this.paint_end();
        break;
      case STATE_ACTION:
        this.paint_action();
        break;
      case STATE_COMIC:
        this.paint_comic();
        break;
    }
    
    if (this.ui.foregroundImage && this.ui.foregroundImage.loaded) {
      const image = this.ui.foregroundImage;
      this.context2d.drawImage(image.img, (this.width - image.img.width) / 2, (this.height - image.img.height) / 2);
    }
  }
  
  paint_start() {
    const percentage = (this.assetsTotal > 0) ? this.assetsLoaded / this.assetsTotal : 1;
    
    this.context2d.font = DEFAULT_FONT;
    this.context2d.textAlign = "center";
    this.context2d.textBaseline = "middle";

    if (this.assetsLoaded < this.assetsTotal) {
      const rgb = Math.floor(percentage * 255);
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.width, this.height);
      this.context2d.fillStyle = "rgba("+rgb+","+rgb+","+rgb+",1)";
      this.context2d.fill();
      this.context2d.fillStyle = "#fff";
      this.context2d.fillText("Loading... (" + this.assetsLoaded+"/" + this.assetsTotal + ")", this.width / 2, this.height / 2); 
      this.context2d.closePath();
    } else {
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.width, this.height);
      this.context2d.fillStyle = "#fff";
      this.context2d.fill();
      this.context2d.fillStyle = "#000";
      this.context2d.fillText("Ready!", this.width / 2, this.height / 2); 
      this.context2d.closePath();
    }
    
  }
  paint_end() {
    this.context2d.beginPath();
    this.context2d.rect(0, 0, this.width, this.height);
    this.context2d.fillStyle = "#3cc";
    this.context2d.fill();
    this.context2d.closePath();    
  }
  
  paint_action() {
    //DEBUG: Paint hitboxes
    //--------------------------------
    if (this.debugMode) {
      //Areas of Effects
      for (let aoe of this.areasOfEffect) {
        let durationPercentage = 1;
        if (!aoe.hasInfiniteDuration() && aoe.startDuration > 0) {
          durationPercentage = Math.max(0, aoe.duration / aoe.startDuration);
        }
        this.context2d.strokeStyle = "rgba(204,51,51,"+durationPercentage+")";
        
        switch (aoe.shape) {
          case SHAPE_CIRCLE:
            this.context2d.beginPath();
            this.context2d.arc(aoe.x, aoe.y, aoe.size / 2, 0, 2 * Math.PI);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case SHAPE_SQUARE:
            this.context2d.beginPath();
            this.context2d.rect(aoe.x - aoe.size / 2, aoe.y - aoe.size / 2, aoe.size, aoe.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
        }
      }
      
      //Actors
      this.context2d.strokeStyle = "rgba(0,0,0,1)";
      for (let actor of this.actors) {
        switch (actor.shape) {
          case SHAPE_CIRCLE:
            this.context2d.beginPath();
            this.context2d.arc(actor.x, actor.y, actor.size / 2, 0, 2 * Math.PI);
            this.context2d.stroke();
            this.context2d.closePath();
            this.context2d.beginPath();
            this.context2d.moveTo(actor.x, actor.y);
            this.context2d.lineTo(actor.x + Math.cos(actor.rotation) * actor.size, actor.y + Math.sin(actor.rotation) * actor.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case SHAPE_SQUARE:
            this.context2d.beginPath();
            this.context2d.rect(actor.x - actor.size / 2, actor.y - actor.size / 2, actor.size, actor.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
        }
      }
    }
    //--------------------------------
    
    //Paint sprites
    //TODO: IMPROVE
    //TODO: Layering
    //--------------------------------
    //AoEs
    for (let aoe of this.areasOfEffect) {
      this.paintSprite(aoe);
      aoe.nextAnimationFrame();
    }
    
    //Actors
    for (let actor of this.actors) {
      this.paintSprite(actor);
      actor.nextAnimationFrame();
    }
    //--------------------------------
  }
  
  paint_comic() {
    if (!this.comicStrip) return;
    const comic = this.comicStrip;
    
    this.context2d.beginPath();
    this.context2d.rect(0, 0, this.width, this.height);
    this.context2d.fillStyle = comic.background;
    this.context2d.fill();
    this.context2d.closePath();
    
    switch (comic.state) {
      case COMIC_STRIP_STATE_TRANSITIONING:
        const offsetY = (comic.transitionTime > 0)
          ? Math.floor(comic.counter / comic.transitionTime * -this.height)
          : 0;
        this.paintComicPanel(comic.getPreviousPanel(), offsetY);
        this.paintComicPanel(comic.getCurrentPanel(), offsetY + this.height);
        break;
      case COMIC_STRIP_STATE_WAIT_BEFORE_INPUT:
        this.paintComicPanel(comic.getCurrentPanel());
        break;
      case COMIC_STRIP_STATE_IDLE:
        this.paintComicPanel(comic.getCurrentPanel());
        //TODO: Paint "NEXT" icon
        break;
    }
  }
  
  paintSprite(obj) {
    if (!obj.spritesheet || !obj.spritesheet.loaded ||
        !obj.animationSet || !obj.animationSet.actions[obj.animationName])
      return;
    
    const animationSet = obj.animationSet;
    
    const srcW = animationSet.tileWidth;
    const srcH = animationSet.tileHeight;    
    let srcX = 0;
    let srcY = 0;
    if (animationSet.rule === ANIMATION_RULE_DIRECTIONAL) {
      srcX = obj.direction * srcW;
      srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
    } else {
      srcX = animationSet.actions[obj.animationName].steps[obj.animationStep].col * srcW;
      srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
    }
    
    const tgtX = Math.floor(obj.x - srcW / 2 + animationSet.tileOffsetX);
    const tgtY = Math.floor(obj.y - srcH / 2 + animationSet.tileOffsetY);
    const tgtW = srcW;
    const tgtH = srcH;
    
    this.context2d.drawImage(obj.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
  }
  
  paintComicPanel(panel = null, offsetY = 0) {
    if (!panel || !panel.loaded) return;
    
    const ratioX = this.width / panel.img.width;
    const ratioY = this.height / panel.img.height;
    const ratio = Math.min(1, Math.min(ratioX, ratioY));
    
    const srcX = 0;
    const srcY = 0;
    const srcW = panel.img.width;
    const srcH = panel.img.height;
    
    const tgtW = panel.img.width * ratio;
    const tgtH = panel.img.height * ratio;
    const tgtX = (this.width - tgtW) / 2;  //TODO
    const tgtY = (this.height - tgtH) / 2 + offsetY;  //TODO
    
    this.context2d.drawImage(panel.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
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
const DEFAULT_FONT = "32px monospace";

const STATE_START = 0;
const STATE_ACTION = 1;
const STATE_COMIC = 2;
const STATE_END = 3;

const ANIMATION_RULE_BASIC = "basic";
const ANIMATION_RULE_DIRECTIONAL = "directional";  
//==============================================================================

/*  Actor Class
 */
//==============================================================================
class Actor {
  constructor(name = "", x = 0, y = 0, size = 32, shape = SHAPE_NONE) {
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
    
    this.attributes = {};
    this.effects = [];
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
  
  setAnimation(animationName = "", restart = false) {
    if (!this.animationSet || !this.animationSet.actions[animationName]) return;
    
    if (restart || this.animationName !== animationName) {  //Set this as the new animation
      this.animationStep = 0;
      this.animationName = animationName;
    }
  }
  
  nextAnimationFrame() {
    if (!this.animationSet || !this.animationSet.actions[this.animationName]) return;
    
    let animationAction = this.animationSet.actions[this.animationName];
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

/*  Area of Effect Class
 */
//==============================================================================
class AoE {
  constructor(name = "", x = 0, y = 0, size = 32, shape = SHAPE_CIRCLE, duration = 1, effects = []) {
    this.name = name; 
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.duration = duration;
    this.startDuration = duration;
    this.effects = effects;
        
    this.spritesheet = null;
    this.animationStep = 0;
    this.animationSet = null;
    this.animationName = "";
  }
  
  get left() { return this.x - this.size / 2; }
  get right() { return this.x + this.size / 2; }
  get top() { return this.y - this.size / 2; }
  get bottom() { return this.y + this.size / 2; }
  get radius() { return this.size / 2; }
  
  hasInfiniteDuration() {
    return this.startDuration === DURATION_INFINITE;
  }
  
  setAnimation(animationName = "", restart = false) {
    if (!this.animationSet || !this.animationSet.actions[animationName]) return;
    
    if (restart || this.animationName !== animationName) {  //Set this as the new animation
      this.animationStep = 0;
      this.animationName = animationName;
    }
  }
  
  nextAnimationFrame() {
    if (!this.animationSet || !this.animationSet.actions[this.animationName]) return;
    
    let animationAction = this.animationSet.actions[this.animationName];
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

const DURATION_INFINITE = 0;
//==============================================================================

/*  4-Koma Comic Strip Class
 */
//==============================================================================
class ComicStrip {
  constructor(name = "", panels = [], onFinish = null) {
    this.name = name;
    this.panels = panels;
    this.onFinish = onFinish;
    
    this.waitTime = DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT;
    this.transitionTime = DEFAULT_COMIC_STRIP_TRANSITION_TIME;    
    this.background = "#333";
    
    this.start();
  }
  
  start() {
    this.currentPanel = 0;
    this.state = COMIC_STRIP_STATE_TRANSITIONING;
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
  
  /* Logic loop should be as follows
  
  loop {
    if !TRANSITIONING && currentPanel >= panels.length
      onFinish()
      FINISH
        
    if TRANSITIONING
      if counter < transitionTime
        counter++
        reposition and paint image n-1
        reposition and paint image n    //NOTE: if 0 panels, this will display an empty scenario for a short time.
      else
        counter = 0
        state = WAIT BEFORE INPUT
    
    if IDLE
      paint image n
      paint "next" icon
      
      if INPUT
        currentPanel++
        state = TRANSITIONING
      
    if WAIT BEFORE INPUT
      paint image n
      
      if counter < waitTime
        counter++
      else
        counter = 0
        state = IDLE
  }
  
  check for conditions: 0 panels, 1 panel, 2 panels.
  
  */
  
}

const COMIC_STRIP_STATE_TRANSITIONING = 0;
const COMIC_STRIP_STATE_WAIT_BEFORE_INPUT = 1;
const COMIC_STRIP_STATE_IDLE = 2;

const DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT = 10;
const DEFAULT_COMIC_STRIP_TRANSITION_TIME = 20;
//==============================================================================

/*  Effect Class
 */
//==============================================================================
class Effect {
  constructor(name = "", data = {}, duration = 1, stackingRule = STACKING_RULE_ADD) {
    this.name = name;
    this.data = data;
    this.duration = duration;
    this.stackingRule = stackingRule;
    this.startDuration = duration;
  }
  
  hasInfiniteDuration() {
    return this.startDuration === DURATION_INFINITE;
  }
  
  copy() {
    return new Effect(this.name, this.data, this.duration, this.stackingRule);
  }
}

const STACKING_RULE_ADD = 0;
const STACKING_RULE_REPLACE = 1;
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
};

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
};

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
};

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
  window.app = new App(initialise);
};
//==============================================================================

/*  Game Scripts
 */
//==============================================================================
function initialise() {
  //Scripts
  //--------------------------------
  this.scripts.runStart = runStart;
  this.scripts.runAction = runAction;
  this.scripts.runEnd = runEnd;
  //--------------------------------
  
  //Images
  //--------------------------------
  this.assets.images.actor = new ImageAsset("assets/actor.png");
  this.assets.images.sarcophagus = new ImageAsset("assets/sarcophagus.png");
  this.assets.images.gate = new ImageAsset("assets/gate.png");
  this.assets.images.plate = new ImageAsset("assets/plate.png");
  this.assets.images.goal = new ImageAsset("assets/goal.png");
  this.assets.images.background = new ImageAsset("assets/background.png");
  
  this.assets.images.comicPanelA = new ImageAsset("assets/comic-panel-800x600-red.png");
  this.assets.images.comicPanelB = new ImageAsset("assets/comic-panel-800x600-blue.png");
  this.assets.images.comicPanelC = new ImageAsset("assets/comic-panel-800x600-yellow.png");
  this.assets.images.comicPanelSmall = new ImageAsset("assets/comic-panel-500x500-green.png");
  this.assets.images.comicPanelBig = new ImageAsset("assets/comic-panel-1000x1000-pink.png");
  this.assets.images.comicPanelWide = new ImageAsset("assets/comic-panel-1000x300-teal.png");
  //--------------------------------
  
  //Animations
  //--------------------------------
  const STEPS_PER_SECOND = FRAMES_PER_SECOND / 10;
  this.animationSets = {
    actor: {
      rule: ANIMATION_RULE_DIRECTIONAL,
      tileWidth: 64,
      tileHeight: 64,
      tileOffsetX: 0,
      tileOffsetY: -16,
      actions: {
        idle: {
          loop: true,
          steps: [
            { row: 0, duration: 1 }
          ],
        },
        walk: {
          loop: true,
          steps: [
            { row: 1, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
            { row: 3, duration: STEPS_PER_SECOND },
            { row: 2, duration: STEPS_PER_SECOND },
          ],
        },
      },
    },
    
    sarcophagus: {
      rule: ANIMATION_RULE_BASIC,
      tileWidth: 64,
      tileHeight: 128,
      tileOffsetX: 0,
      tileOffsetY: -32,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
        glow: {
          loop: true,
          steps: [
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
          ],
        },
      },
    },
    
    plate: {
      rule: ANIMATION_RULE_BASIC,
      tileWidth: 64,
      tileHeight: 64,
      tileOffsetX: 0,
      tileOffsetY: 0,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
        glow: {
          loop: true,
          steps: [
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 },
          ],
        },
      },
    },
    
    simple128: {
      rule: ANIMATION_RULE_BASIC,
      tileWidth: 128,
      tileHeight: 128,
      tileOffsetX: 0,
      tileOffsetY: 0,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
      },
    },
    
    simple64: {
      rule: ANIMATION_RULE_BASIC,
      tileWidth: 64,
      tileHeight: 64,
      tileOffsetX: 0,
      tileOffsetY: 0,
      actions: {
        idle: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: 1 }
          ],
        },
        glow: {
          loop: true,
          steps: [
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 },
            { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 },
            { col: 0, row: 0, duration: STEPS_PER_SECOND * 3 },
          ],
        },
      },
    },
    
  };
  
  //Process Animations; expand steps to many frames per steps.
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
  //--------------------------------
}

function runStart() {
  this.store.level = 1;
  
  if (this.pointer.state === INPUT_ACTIVE || 
      this.keys[KEY_CODES.UP].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.SPACE].state === INPUT_ACTIVE ||
      this.keys[KEY_CODES.ENTER].state === INPUT_ACTIVE) {
    this.changeState(STATE_COMIC, comicStart);
  }
}

function comicStart() {
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ this.assets.images.comicPanelA,
      this.assets.images.comicPanelB,
      this.assets.images.comicPanelC ],
    comicStartFinished);
  this.comicStrip.start();
  
  this.comicStrip = new ComicStrip(
    "startcomic",
    [ this.assets.images.comicPanelA, 
      this.assets.images.comicPanelSmall, 
      this.assets.images.comicPanelBig, 
      this.assets.images.comicPanelWide ],
    comicStartFinished);
  this.comicStrip.start();
  
  //this.comicStrip = new ComicStrip(
  //  "startcomic",
  //  [],
  //  comicStartFinished);
  //this.comicStrip.start();
}

function comicStartFinished() {
  this.changeState(STATE_ACTION, startLevel1);
}

function runEnd() {}

function runAction() {
  //Input & Actions
  //--------------------------------
  let playerIsIdle = true;
  const PLAYER_SPEED = 4;
  if (this.pointer.state === INPUT_ACTIVE) {
    const distX = this.pointer.now.x - this.pointer.start.x;
    const distY = this.pointer.now.y - this.pointer.start.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    
    if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
      const angle = Math.atan2(distY, distX);
      const speed = PLAYER_SPEED;
      this.refs["player"].x += Math.cos(angle) * speed;
      this.refs["player"].y += Math.sin(angle) * speed;
      this.refs["player"].rotation = angle;
      playerIsIdle = false;
      
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
    this.refs["player"].y -= PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_NORTH;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
    this.refs["player"].y += PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_SOUTH;
    playerIsIdle = false;
  }
  if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
    this.refs["player"].x -= PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_WEST;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
    this.refs["player"].x += PLAYER_SPEED;
    this.refs["player"].direction = DIRECTION_EAST;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.A].state === INPUT_ACTIVE && this.keys[KEY_CODES.D].state !== INPUT_ACTIVE) {
    this.refs["player"].rotation -= Math.PI / 36;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.A].state !== INPUT_ACTIVE && this.keys[KEY_CODES.D].state === INPUT_ACTIVE) {
    this.refs["player"].rotation += Math.PI / 36;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.W].state === INPUT_ACTIVE) {
    this.refs["player"].x += Math.cos(this.refs["player"].rotation) * PLAYER_SPEED;
    this.refs["player"].y += Math.sin(this.refs["player"].rotation) * PLAYER_SPEED;
    playerIsIdle = false;
  } else if (this.keys[KEY_CODES.S].state === INPUT_ACTIVE) {
    this.refs["player"].x -= Math.cos(this.refs["player"].rotation) * PLAYER_SPEED;
    this.refs["player"].y -= Math.sin(this.refs["player"].rotation) * PLAYER_SPEED;
    playerIsIdle = false;
  }
  
  if (this.keys[KEY_CODES.Z].duration === 1) {
    this.refs["player"].shape = (this.refs["player"].shape === SHAPE_CIRCLE)
      ? SHAPE_SQUARE
      : SHAPE_CIRCLE;
  }
  
  if (this.keys[KEY_CODES.SPACE].duration === 1) {
    const PUSH_POWER = 12;
    const AOE_SIZE = this.refs["player"].size;
    let distance = this.refs["player"].radius + AOE_SIZE / 2;
    let x = this.refs["player"].x + Math.cos(this.refs["player"].rotation) * distance;
    let y = this.refs["player"].y + Math.sin(this.refs["player"].rotation) * distance;;
    let newAoE = new AoE("", x, y, AOE_SIZE, SHAPE_CIRCLE, 5,
      [
        new Effect("push",
          { x: Math.cos(this.refs["player"].rotation) * PUSH_POWER, y: Math.sin(this.refs["player"].rotation) * PUSH_POWER },
          2, STACKING_RULE_ADD)
      ]);
    this.areasOfEffect.push(newAoE);
  }
  //--------------------------------
  
  //Animations
  //--------------------------------
  if (playerIsIdle) {
    this.refs["player"].setAnimation("idle");
  } else {
    this.refs["player"].setAnimation("walk");
  }
  
  if (this.refs["boxes"]) {
    for (let box of this.refs["boxes"]) {
      if (box.effects.find((eff) => { return eff.name === "charge" })) {
        box.setAnimation("glow");
      } else {
        box.setAnimation("idle");
      }
    }
  }
  //--------------------------------
  
  //Game rules
  //--------------------------------
  checkIfAllBoxesAreCharged.apply(this);
  //--------------------------------
  
  //Win Condition
  //--------------------------------
  checkIfPlayerIsAtGoal.apply(this);
  //--------------------------------
}

function startLevelInit() {
  //Reset
  this.actors = [];
  this.areasOfEffect = [];
  this.refs = {};
  
  const midX = this.width / 2, midY = this.height / 2;
  
  this.refs["player"] = new Actor("player", midX, midY + 256, 32, SHAPE_CIRCLE);
  this.refs["player"].spritesheet = this.assets.images.actor;
  this.refs["player"].animationSet = this.animationSets.actor;
  this.refs["player"].rotation = ROTATION_NORTH;
  this.actors.push(this.refs["player"]);
  
  let wallN = new Actor("wallN", midX, midY - 672, this.width, SHAPE_SQUARE);
  let wallS = new Actor("wallS", midX, midY + 688, this.width, SHAPE_SQUARE);
  let wallE = new Actor("wallE", midX + 688, midY, this.height, SHAPE_SQUARE);
  let wallW = new Actor("wallW", midX - 688, midY, this.height, SHAPE_SQUARE);
  wallE.canBeMoved = false;
  wallS.canBeMoved = false;
  wallW.canBeMoved = false;
  wallN.canBeMoved = false;
  this.actors.push(wallE, wallS, wallW, wallN);

  this.refs["gate"] = new Actor("gate", midX, 16, 128, SHAPE_SQUARE);
  this.refs["gate"].canBeMoved = false;
  this.refs["gate"].spritesheet = this.assets.images.gate;
  this.refs["gate"].animationSet = this.animationSets.simple128;
  this.refs["gate"].setAnimation("idle");
  this.actors.push(this.refs["gate"]);
  
  this.refs["goal"] = new AoE("goal", this.width / 2, 32, 64, SHAPE_SQUARE, DURATION_INFINITE, []);
  this.refs["goal"].spritesheet = this.assets.images.goal;
  this.refs["goal"].animationSet = this.animationSets.simple64;
  this.refs["goal"].setAnimation("glow");
  this.areasOfEffect.push(this.refs["goal"]);
}

function startLevel1() {
  startLevelInit.apply(this);
  //this.areasOfEffect.push(
  //  new AoE("conveyorBelt", this.width / 2, this.height / 2 + 64, 64, SHAPE_SQUARE, DURATION_INFINITE,
  //    [new Effect("push", { x: 0, y: 4 }, 4, STACKING_RULE_ADD, null)], null)
  //);
  //this.actors.push(new Actor("s1", Math.floor(Math.random() * this.width * 0.8) + this.width * 0.1, Math.floor(Math.random() * this.height * 0.8) + this.height * 0.1, 32 + Math.random() * 64, SHAPE_SQUARE));
  
  const midX = this.width / 2, midY = this.height / 2;
  
  this.refs.boxes = [];
  this.refs.plates = [];
  let newBox, newPlate;
  const chargeEffect = new Effect("charge", {}, 4, STACKING_RULE_ADD, null);
  
  this.refs.boxes = [
    new Actor("", midX - 128, midY - 64, 64, SHAPE_SQUARE),
    new Actor("", midX + 128, midY - 64, 64, SHAPE_SQUARE),
  ];
  for (let box of this.refs.boxes) {
    box.attributes.box = true;
    box.spritesheet = this.assets.images.sarcophagus;
    box.animationSet = this.animationSets.sarcophagus;
    this.actors.push(box);
  }
  
  this.refs.plates = [
    new AoE("plate", midX - 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()]),
    new AoE("plate", midX + 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()]),
  ];
  for (let plate of this.refs.plates) {
    plate.spritesheet = this.assets.images.plate;
    plate.animationSet = this.animationSets.plate;
    plate.setAnimation("idle");
    this.areasOfEffect.push(plate);
  }
  
  this.ui.backgroundImage = this.assets.images.background;
}

function startLevel2() {
  startLevelInit.apply(this);
}

function startLevel3() {
  startLevelInit.apply(this);
}

function checkIfAllBoxesAreCharged() {
  let allBoxesAreCharged = true;
  
  if (this.refs["plates"] && this.refs["boxes"]) {
    for (let plate of this.refs["plates"]) {
      let thisPlateIsCharged = false;
      for (let box of this.refs["boxes"]) {
        if (this.isATouchingB(box, plate)) {
          thisPlateIsCharged = true;
          plate.setAnimation("glow");
        }
      }
      !thisPlateIsCharged && plate.setAnimation("idle");
      allBoxesAreCharged = allBoxesAreCharged && thisPlateIsCharged;
    }
  }
  
  if (allBoxesAreCharged) {
    if (this.refs["gate"] && this.refs["gate"].y >= -32) {
      this.refs["gate"].x = this.width / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y -= 1;
    }
  } else {
    if (this.refs["gate"] && this.refs["gate"].y <= 16) {
      this.refs["gate"].x = this.width / 2 - 1 + Math.random() * 2;
      this.refs["gate"].y += 1;
    }
  }
}

function checkIfPlayerIsAtGoal() {
  if (this.isATouchingB(this.refs["player"], this.refs["goal"])) {
    this.store.level && this.store.level++;
    
    switch (this.store.level) {
      case 1:
        startLevel1.apply(this);
        break;
      case 2:
        startLevel2.apply(this);
        break;
      case 3:
        startLevel3.apply(this);
        break;      
      default:
        this.changeState(STATE_END);
    }    
  }
}
//==============================================================================
