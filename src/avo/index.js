/*  
AvO Adventure Game Engine
=========================

(Shaun A. Noordin || shaunanoordin.com || 20170322)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.
import { Story } from "./story.js";
import { Physics } from "../avo/physics.js";
import { Utility } from "./utility.js";
import { StandardActions } from "./standard-actions.js";

/*  Primary AvO Game Engine
 */
//==============================================================================
export class AvO {  //Naming note: small 'v' between capital 'A' and 'O'.
  constructor(story) {
    //Initialise properties
    //--------------------------------
    this.config = {
      framesPerSecond: AVO.FRAMES_PER_SECOND,
      debugMode: false,
      topDownView: true,  //Top-down view sorts Actors on paint().
      skipStandardRun: false,  //Skips the standard run() code, including physics.
      skipStandardPaint: false,  //Skips the standard paint() code.
      autoFitCanvas: true,
      backgroundColour: "#333",
    };
    this.runCycle = null;
    this.html = {
      app: document.getElementById("app"),
      canvas: document.getElementById("canvas"),
      dialogue: document.getElementById("dialogue"),
    };
    this.context2d = this.html.canvas.getContext("2d");
    this.boundingBox = null;  //To be defined by this.updateSize().
    //this.sizeRatioX = 1;
    //this.sizeRatioY = 1;
    this.canvasSizeRatio = 1;
    this.canvasWidth = this.html.canvas.width;  //The intended width/height of the canvas.
    this.canvasHeight = this.html.canvas.height;
    this.state = null;
    this.animationSets = {};
    //--------------------------------
    
    //Account for graphical settings
    //--------------------------------
    this.context2d.mozImageSmoothingEnabled = false;
    this.context2d.msImageSmoothingEnabled = false;
    this.context2d.imageSmoothingEnabled = false;
    //--------------------------------
    
    //Initialise Game Objects
    //--------------------------------
    this.story = (story) ? story : new Story();
    this.story.avo = this;
    this.assets = {
      images: {}
    };
    this.assetsLoaded = 0;
    this.assetsTotal = 0;
    this.actors = [];
    this.playerActor = null;
    this.zones = [];
    this.refs = {};
    this.store = {};
    this.room = null;  //Current room.
    //this.ui = {};
    this.comicStrip = null;
    this.actions = {};
    
    this.camera = {
      x: 0,
      y: 0,
      targetActor: null,  //If not null, automatically focus on the target actor.
    };
    //--------------------------------
    
    //Prepare Input
    //--------------------------------
    this.keys = new Array(AVO.MAX_KEYS);
    for (let i = 0; i < this.keys.length; i++) {
      this.keys[i] = {
        state: AVO.INPUT_IDLE,
        duration: 0
      };
    }
    this.pointer = {
      start: { x: 0, y: 0 },
      now: { x: 0, y: 0 },
      state: AVO.INPUT_IDLE,
      duration: 0
    };
    //--------------------------------
    
    //Bind Events
    //--------------------------------
    if ("onmousedown" in this.html.canvas && "onmousemove" in this.html.canvas &&
        "onmouseup" in this.html.canvas) {
      this.html.canvas.onmousedown = this.onPointerStart.bind(this);
      this.html.canvas.onmousemove = this.onPointerMove.bind(this);
      this.html.canvas.onmouseup = this.onPointerEnd.bind(this);
    }    
    if ("ontouchstart" in this.html.canvas && "ontouchmove" in this.html.canvas &&
        "ontouchend" in this.html.canvas && "ontouchcancel" in this.html.canvas) {
      this.html.canvas.ontouchstart = this.onPointerStart.bind(this);
      this.html.canvas.ontouchmove = this.onPointerMove.bind(this);
      this.html.canvas.ontouchend = this.onPointerEnd.bind(this);
      this.html.canvas.ontouchcancel = this.onPointerEnd.bind(this);
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
    //TEST
    this.changeState(AVO.STATE_START, this.story.init);
    
    this.runCycle = setInterval(this.run.bind(this), 1000 / this.config.framesPerSecond);
    //--------------------------------
  }
  
  //----------------------------------------------------------------
  
  changeState(state, callbackScript = null) {
    this.state = state;
    
    //Show/hide dialogue interface.
    if (state === AVO.STATE_DIALOGUE) {
      this.html.dialogue.style = "display: block;";
    } else {
      this.html.dialogue.style = "display: none;";
    }
    
    //Run script
    if (callbackScript && typeof callbackScript === "function") {
      callbackScript();
    }
  }
  
  run() {
    //Run Story script
    this.story.preRun(this);
    
    if (!this.config.skipCoreRun) {
      switch (this.state) {
        case AVO.STATE_START:
          this.run_start();
          break;
        case AVO.STATE_END:
          this.run_end();
          break;
        case AVO.STATE_ACTION:
          this.run_action();
          break;
        case AVO.STATE_COMIC:
          this.run_comic();
          break;
      }
      
      if (this.camera.targetActor) {
        this.camera.x = Math.floor(this.canvasWidth / 2 - this.camera.targetActor.x);
        this.camera.y = Math.floor(this.canvasHeight / 2 - this.camera.targetActor.y);
      }
    }
    
    //Run Story script
    this.story.postRun();
    
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
    
    //Run Story script
    this.story.run_start();
  }
  
  run_end() {
    //Run Story script
    this.story.run_end();
  }
    
  run_action() {
    //Run Story script
    this.story.run_action();
    
    //Actors determine intent
    //--------------------------------
    if (this.playerActor) {
      const player = this.playerActor;
      player.intent = { name: AVO.ACTION.IDLE };
      
      //Mouse/touch input
      if (this.pointer.state === AVO.INPUT_ACTIVE) {
        const distX = this.pointer.now.x - this.pointer.start.x;
        const distY = this.pointer.now.y - this.pointer.start.y;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist > AVO.INPUT_DISTANCE_SENSITIVITY * this.canvasSizeRatio) {
          const angle = Math.atan2(distY, distX);
          player.intent = {
            name: AVO.ACTION.MOVING,
            angle: angle,
          };

          //UX improvement: reset the base point of the pointer so the player can
          //switch directions much more easily.
          if (dist > AVO.INPUT_DISTANCE_SENSITIVITY * this.canvasSizeRatio * 2) {
            this.pointer.start.x = this.pointer.now.x - Math.cos(angle) *
              AVO.INPUT_DISTANCE_SENSITIVITY * this.canvasSizeRatio * 2;
            this.pointer.start.y = this.pointer.now.y - Math.sin(angle) *
              AVO.INPUT_DISTANCE_SENSITIVITY * this.canvasSizeRatio * 2;
          }
        }
      } else if (this.pointer.state === AVO.INPUT_ENDED) {
        const distX = this.pointer.now.x - this.pointer.start.x;
        const distY = this.pointer.now.y - this.pointer.start.y;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist <= AVO.INPUT_DISTANCE_SENSITIVITY * this.canvasSizeRatio) {
          player.intent = {
            name: AVO.ACTION.PRIMARY,
          };
        }
      }
      
      //Keyboard input
      let xDir = 0, yDir = 0;
      if (this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE) yDir--;
      if (this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE) yDir++;
      if (this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE) xDir--;
      if (this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE) xDir++;
      
      if (xDir > 0 && yDir === 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_EAST,
        };
      } else if (xDir > 0 && yDir > 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_SOUTHEAST,
        };
      } else if (xDir === 0 && yDir > 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_SOUTH,
        };
      } else if (xDir < 0 && yDir > 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_SOUTHWEST,
        };
      } else if (xDir < 0 && yDir === 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_WEST,
        };
      } else if (xDir < 0 && yDir < 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_NORTHWEST,
        };
      } else if (xDir === 0 && yDir < 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_NORTH,
        };
      } else if (xDir > 0 && yDir < 0) {
        player.intent = {
          name: AVO.ACTION.MOVING,
          angle: AVO.ROTATION_NORTHEAST,
        };
      }
      
      if (this.keys[AVO.KEY_CODES.SPACE].duration === 1) {
        player.intent = {
          name: AVO.ACTION.PRIMARY,
        };
      }
    }
    //--------------------------------
    
    //Zones apply Effects
    //--------------------------------
    for (let zone of this.zones) {
      for (let actor of this.actors) {
        if (Physics.checkCollision(zone, actor)) {
          for (let effect of zone.effects) {
            actor.effects.push(effect.copy());
          }
        }
      }
    }
    //--------------------------------
    
    //Actors react to Effects and perform actions
    //--------------------------------
    for (let actor of this.actors) {
      //First react to Effects.
      for (let effect of actor.effects) {
        //TODO make this an external script
        //----------------
        if (effect.name === "push" && actor.movable) {
          actor.x += effect.data.x || 0;
          actor.y += effect.data.y || 0;
        }
        //----------------
      }
      
      //If the actor is not busy, transform the intent into an action.
      if (actor.state !== AVO.ACTOR_ACTING && actor.state !== AVO.ACTOR_REACTING) {
        if (actor.intent) {
          actor.action = actor.intent;
        } else {
          actor.action = null;
        }
      }
      
      //If the Actor has an action, perform it.
      if (actor.action) {
        if (this.actions[actor.action.name]) {  //Run a custom Action.
          this.actions[actor.action.name].apply(this, [actor]);
        } else if (StandardActions[actor.action.name]) {  //Run a standard Action.
          StandardActions[actor.action.name].apply(this, [actor]);
        }
      }
    }
    //--------------------------------
        
    //Physics
    //--------------------------------
    this.physics();
    //--------------------------------
    
    //Cleanup Zones
    //--------------------------------
    for (let i = this.zones.length - 1; i >= 0; i--) {
      var zone = this.zones[i];
      if (!zone.hasInfiniteDuration()) {
        zone.duration--;
        if (zone.duration <= 0) {
          this.zones.splice(i, 1);
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
    if (this.pointer.state === AVO.INPUT_ENDED) {
      this.pointer.duration = 0;
      this.pointer.state = AVO.INPUT_IDLE;
    }
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].state === AVO.INPUT_ACTIVE) {
        this.keys[i].duration++;
      } else if (this.keys[i].state === AVO.INPUT_ENDED) {
        this.keys[i].duration = 0;
        this.keys[i].state = AVO.INPUT_IDLE;
      }
    }
    //--------------------------------
  }
  
  run_comic() {
    //Run Story script
    this.story.run_comic();
    
    if (!this.comicStrip) return;
    const comic = this.comicStrip;
    
    //TODO: Move logic into the ComicStrip class.
    
    if (comic.state !== AVO.COMIC_STRIP_STATE_TRANSITIONING &&
        comic.currentPanel >= comic.panels.length) {
      comic.onFinish.apply(this);
    }
    
    switch (comic.state) {
      case AVO.COMIC_STRIP_STATE_TRANSITIONING:
        if (comic.counter < comic.transitionTime) {
          comic.counter++;          
        } else {
          comic.counter = 0;
          comic.state = AVO.COMIC_STRIP_STATE_WAIT_BEFORE_INPUT
        }
        break;
      case AVO.COMIC_STRIP_STATE_WAIT_BEFORE_INPUT:
        if (comic.counter < comic.waitTime) {
          comic.counter++;
        } else {
          comic.counter = 0;
          comic.state = AVO.COMIC_STRIP_STATE_IDLE;
        }
        break;
      case AVO.COMIC_STRIP_STATE_IDLE:
        if (this.pointer.state === AVO.INPUT_ACTIVE || 
            this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE ||
            this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE ||
            this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE ||
            this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE ||
            this.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE ||
            this.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
          comic.currentPanel++;
          comic.state = AVO.COMIC_STRIP_STATE_TRANSITIONING;
        }        
        break;
    }
  }
  
  //----------------------------------------------------------------
  
  physics() {
    //Check Actor collisions...
    for (let a = 0; a < this.actors.length; a++) {
      let actorA = this.actors[a];
      
      //...with the terrain.
      //if (this.room) {
      if (actorA === this.playerActor && this.room) {
        
        
        /*const room = this.room;
        const actorLeftCol = Math.floor(actorA.left / room.tileWidth);
        const actorRightCol = Math.floor(actorA.right / room.tileWidth);
        const actorTopRow = Math.floor(actorA.top / room.tileHeight);
        const actorBottomRow = Math.floor(actorA.bottom / room.tileHeight);
        
        const topLeftTile = room.getFloorTile(actorLeftCol, actorTopRow);
        const topRightTile = room.getFloorTile(actorRightCol, actorTopRow);
        const bottomLeftTile = room.getFloorTile(actorLeftCol, actorBottomRow);
        const bottomRightTile = room.getFloorTile(actorRightCol, actorBottomRow);
        const topLeftCollision = topLeftTile && topLeftTile.solid;
        const topRightCollision = topRightTile && topRightTile.solid;
        const bottomLeftCollision = bottomLeftTile && bottomLeftTile.solid;
        const bottomRightCollision = bottomRightTile && bottomRightTile.solid;
        let correctionX = 0;
        let correctionY = 0;
        
        if (topLeftCollision && !bottomRightCollision) { correctionX++; correctionY++; }
        if (!topLeftCollision && bottomRightCollision) { correctionX--; correctionY--; }
        if (topRightCollision && !bottomLeftCollision) { correctionX--; correctionY++; }
        if (!topRightCollision && bottomLeftCollision) { correctionX++; correctionY--; }
        
        if (correctionX < 0) { actorA.right = actorRightCol * room.tileWidth + 1; }
        else if (correctionX > 0) { actorA.left = (actorLeftCol + 1) * room.tileWidth + 1; }
        if (correctionY < 0) { actorA.bottom = actorBottomRow * room.tileWidth + 1; }
        else if (correctionY > 0) { actorA.top = (actorTopRow + 1) * room.tileWidth + 1; }*/
      }
      
      //...with other Actors.
      for (let b = a + 1; b < this.actors.length; b++) {
        let actorB = this.actors[b];
        let collisionCorrection = Physics.checkCollision(actorA, actorB);
                
        if (collisionCorrection) {  //TODO: Check if this needs to be (!!collisionCorrection).
          actorA.x = collisionCorrection.ax;
          actorA.y = collisionCorrection.ay;
          actorB.x = collisionCorrection.bx;
          actorB.y = collisionCorrection.by;
        }
      }
    }
  }
  
  /*
  isATouchingB(objA, objB) {
    if (!objA || !objB) return false;
    
    if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_CIRCLE) {
      const distX = objA.x - objB.x;
      const distY = objA.y - objB.y;
      const minimumDist = objA.radius + objB.radius;
      if (distX * distX + distY * distY < minimumDist * minimumDist) {
        return true;
      }
    }
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_SQUARE) {
      if (objA.left < objB.right &&
          objA.right > objB.left &&
          objA.top < objB.bottom &&
          objA.bottom > objB.top) {
        return true;
      }
    }
    
    else if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_SQUARE) {
      const distX = objA.x - Math.max(objB.left, Math.min(objB.right, objA.x));
      const distY = objA.y - Math.max(objB.top, Math.min(objB.bottom, objA.y));
      if (distX * distX + distY * distY < objA.radius * objA.radius) {
        return true;
      }
    }
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_CIRCLE) {
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
    if (objA.movable && objB.movable) {
      fractionA = 0.5;
      fractionB = 0.5;
    } else if (objA.movable) {
      fractionA = 1;
    } else if (objB.movable) {
      fractionB = 1;
    }
    
    if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_CIRCLE) {
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
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_SQUARE) {
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
    
    else if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_SQUARE) {
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
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_CIRCLE) {
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
  */
  
  //----------------------------------------------------------------
  
  paint() {
    //Clear
    this.context2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    //Base colour
    if (this.config.backgroundColour) {
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context2d.fillStyle = this.config.backgroundColour;
      this.context2d.fill();
      this.context2d.closePath();
    }
    
    //Run Story script
    this.story.prePaint();
    
    if (!this.config.skipCorePaint) {
      switch (this.state) {
        case AVO.STATE_START:
          this.paint_start();
          break;
        case AVO.STATE_END:
          this.paint_end();
          break;
        case AVO.STATE_ACTION:
        case AVO.STATE_DIALOGUE:
          this.paint_action();
          break;
        case AVO.STATE_COMIC:
          this.paint_comic();
          break;
      }
    }
    
    //Run Story script
    this.story.postPaint();
  }
  
  paint_start() {
    const percentage = (this.assetsTotal > 0) ? this.assetsLoaded / this.assetsTotal : 1;
    
    this.context2d.font = AVO.DEFAULT_FONT;
    this.context2d.textAlign = "center";
    this.context2d.textBaseline = "middle";

    if (this.assetsLoaded < this.assetsTotal) {
      const rgb = Math.floor(percentage * 255);
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context2d.fillStyle = "rgba("+rgb+","+rgb+","+rgb+",1)";
      this.context2d.fill();
      this.context2d.fillStyle = "#fff";
      this.context2d.fillText("Loading... (" + this.assetsLoaded+"/" + this.assetsTotal + ")", this.canvasWidth / 2, this.canvasHeight / 2); 
      this.context2d.closePath();
    } else {
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
      this.context2d.fillStyle = "#fff";
      this.context2d.fill();
      this.context2d.fillStyle = "#000";
      this.context2d.fillText("Adventure on!", this.canvasWidth / 2, this.canvasHeight / 2); 
      this.context2d.closePath();
    }
  }
  
  paint_end() {}
  
  paint_action() {
    //Arrange sprites by vertical order.
    //--------------------------------
    if (this.config.topDownView) {
      this.actors.sort((a, b) => {
        return a.bottom - b.bottom;
      });
    }
    //--------------------------------
    
    //Paint room floor
    //--------------------------------
    const room = this.room;
    if (room && room.spritesheet && room.spritesheet.loaded) {
      for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
          const tile = (room.floorTiles[y * room.width + x] !== undefined)
            ? room.tileTypes[room.floorTiles[y * room.width + x]]
            : null;
          
          if (!tile) continue;
          
          const srcW = room.tileWidth;
          const srcH = room.tileHeight;    
          const srcX = tile.sprite.col * srcW;
          const srcY = tile.sprite.row * srcH;
          const tgtX = Math.floor(x * srcW + this.camera.x);
          const tgtY = Math.floor(y * srcH + this.camera.y);
          const tgtW = Math.floor(srcW);
          const tgtH = Math.floor(srcH);
          
          this.context2d.drawImage(room.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
        }
      }
    }
    //--------------------------------
    
    //DEBUG: Paint hitboxes
    //--------------------------------
    if (this.config.debugMode) {
      this.context2d.lineWidth = 1;
      let coords;
      
      //Zones
      for (let zone of this.zones) {
        let durationPercentage = 1;
        if (!zone.hasInfiniteDuration() && zone.startDuration > 0) {
          durationPercentage = Math.max(0, zone.duration / zone.startDuration);
        }
        this.context2d.strokeStyle = "rgba(204,51,51,"+durationPercentage+")";
        
        switch (zone.shape) {
          case AVO.SHAPE_CIRCLE:
            this.context2d.beginPath();
            this.context2d.arc(zone.x + this.camera.x, zone.y + this.camera.y, zone.size / 2, 0, 2 * Math.PI);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case AVO.SHAPE_SQUARE:
            this.context2d.beginPath();
            this.context2d.rect(zone.x + this.camera.x - zone.size / 2, zone.y + this.camera.y - zone.size / 2, zone.size, zone.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case AVO.SHAPE_POLYGON:
            //NOTE: Polygon doesn't account for shadowSize yet.
            this.context2d.beginPath();
            coords = zone.vertices;
            if (coords.length >= 1) this.context2d.moveTo(coords[coords.length-1].x + this.camera.x, coords[coords.length-1].y + this.camera.y);
            for (let i = 0; i < coords.length; i++) {
              this.context2d.lineTo(coords[i].x + this.camera.x, coords[i].y + this.camera.y);
            }            
            this.context2d.stroke();
            this.context2d.closePath();
            break;
        }
      }
      
      //Actors
      this.context2d.strokeStyle = "rgba(0,0,0,1)";
      for (let actor of this.actors) {
        switch (actor.shape) {
          case AVO.SHAPE_CIRCLE:
            this.context2d.beginPath();
            this.context2d.arc(actor.x + this.camera.x, actor.y + this.camera.y, actor.size / 2, 0, 2 * Math.PI);
            this.context2d.stroke();
            this.context2d.closePath();
            this.context2d.beginPath();
            this.context2d.moveTo(actor.x + this.camera.x, actor.y + this.camera.y);
            this.context2d.lineTo(
              actor.x + this.camera.x + Math.cos(actor.rotation) * actor.size,
              actor.y + this.camera.y + Math.sin(actor.rotation) * actor.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case AVO.SHAPE_SQUARE:
            this.context2d.beginPath();
            this.context2d.rect(
              actor.x + this.camera.x - actor.size / 2,
              actor.y + this.camera.y - actor.size / 2,
              actor.size, actor.size);
            this.context2d.stroke();
            this.context2d.closePath();
            break;
          case AVO.SHAPE_POLYGON:
            //NOTE: Polygon doesn't account for shadowSize yet.
            this.context2d.beginPath();
            coords = actor.vertices;
            if (coords.length >= 1) this.context2d.moveTo(coords[coords.length-1].x + this.camera.x, coords[coords.length-1].y + this.camera.y);
            for (let i = 0; i < coords.length; i++) {
              this.context2d.lineTo(coords[i].x + this.camera.x, coords[i].y + this.camera.y);
            }            
            this.context2d.stroke();
            this.context2d.closePath();
            break;
        }
      }
    }
    //--------------------------------
    
    //Paint sprites
    //--------------------------------
    for (let z = AVO.MIN_Z_INDEX; z <= AVO.MAX_Z_INDEX; z ++) {
      //Zones
      for (let zone of this.zones) {
        if (zone.z === z) {
          this.paintSprite(zone);
          zone.nextAnimationFrame();
        }
      }
      
      //Actors
      for (let actor of this.actors) {
        if (actor.z === z) {
          this.paintShadow(actor);
        }
      }
      for (let actor of this.actors) {
        if (actor.z === z) {
          this.paintSprite(actor);
          actor.nextAnimationFrame();
        }
      }
    }
    //--------------------------------
    
    //Paint room floor
    //--------------------------------
    if (room && room.spritesheet && room.spritesheet.loaded) {
      for (let y = 0; y < room.height; y++) {
        for (let x = 0; x < room.width; x++) {
          const tile = (room.ceilingTiles[y * room.width + x] !== undefined)
            ? room.tileTypes[room.ceilingTiles[y * room.width + x]]
            : null;
          
          if (!tile) continue;
          
          const srcW = room.tileWidth;
          const srcH = room.tileHeight;    
          const srcX = tile.sprite.col * srcW;
          const srcY = tile.sprite.row * srcH;
          const tgtX = Math.floor(x * srcW + this.camera.x);
          const tgtY = Math.floor(y * srcH + this.camera.y);
          const tgtW = Math.floor(srcW);
          const tgtH = Math.floor(srcH);
          
          this.context2d.drawImage(room.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
        }
      }
    }
    //--------------------------------
    
    //DEBUG: Paint touch/mouse input
    //--------------------------------
    if (this.config.debugMode) {      
      this.context2d.strokeStyle = "rgba(128,128,128,0.8)";
      this.context2d.lineWidth = 1;
      this.context2d.beginPath();
      this.context2d.arc(this.pointer.start.x, this.pointer.start.y, AVO.INPUT_DISTANCE_SENSITIVITY * 2 * this.canvasSizeRatio, 0, 2 * Math.PI);
      this.context2d.stroke();
      this.context2d.closePath();
    }
    //--------------------------------
  }
  
  paint_comic() {
    if (!this.comicStrip) return;
    const comic = this.comicStrip;
    
    //TODO: Move logic into the ComicStrip class.
    
    this.context2d.beginPath();
    this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context2d.fillStyle = comic.background;
    this.context2d.fill();
    this.context2d.closePath();
    
    switch (comic.state) {
      case AVO.COMIC_STRIP_STATE_TRANSITIONING:
        const offsetY = (comic.transitionTime > 0)
          ? Math.floor(comic.counter / comic.transitionTime * -this.canvasHeight)
          : 0;
        this.paintComicPanel(comic.getPreviousPanel(), offsetY);
        this.paintComicPanel(comic.getCurrentPanel(), offsetY + this.canvasHeight);
        break;
      case AVO.COMIC_STRIP_STATE_WAIT_BEFORE_INPUT:
        this.paintComicPanel(comic.getCurrentPanel());
        break;
      case AVO.COMIC_STRIP_STATE_IDLE:
        this.paintComicPanel(comic.getCurrentPanel());
        //TODO: Paint "NEXT" icon
        break;
    }
  }
  
  paintSprite(obj) {
    if (!obj || !obj.spritesheet || !obj.spritesheet.loaded ||
        !obj.animationSet || !obj.animationSet.actions[obj.animationName])
      return;
    
    const animationSet = obj.animationSet;
    
    const srcW = animationSet.tileWidth;
    const srcH = animationSet.tileHeight;    
    let srcX = 0;
    let srcY = 0;
    if (animationSet.rule === AVO.ANIMATION_RULE_DIRECTIONAL) {
      srcX = obj.direction * srcW;
      srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
    } else {
      srcX = animationSet.actions[obj.animationName].steps[obj.animationStep].col * srcW;
      srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
    }
    
    const tgtX = Math.floor(obj.x - srcW / 2 + animationSet.tileOffsetX + this.camera.x);
    const tgtY = Math.floor(obj.y - srcH / 2 + animationSet.tileOffsetY + this.camera.y);
    const tgtW = Math.floor(srcW);
    const tgtH = Math.floor(srcH);
    
    this.context2d.drawImage(obj.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
  }
  
  paintShadow(obj) {
    if (!obj || !obj.shadowSize || obj.shadowSize <= 0) return;
    
    let coords;
    this.context2d.fillStyle = AVO.SHADOW_COLOUR;
    
    switch (obj.shape) {
      case AVO.SHAPE_CIRCLE:
        this.context2d.beginPath();
        this.context2d.arc(obj.x + this.camera.x, obj.y + this.camera.y, obj.size / 2 * obj.shadowSize, 0, 2 * Math.PI);
        this.context2d.fill();
        this.context2d.closePath();
        break;
      case AVO.SHAPE_SQUARE:
        this.context2d.beginPath();
        this.context2d.rect(
          obj.x + this.camera.x - obj.size / 2  * obj.shadowSize,
          obj.y + this.camera.y - obj.size / 2 * obj.shadowSize,
          obj.size * obj.shadowSize, obj.size * obj.shadowSize);
        this.context2d.fill();
        this.context2d.closePath();
        break;
      case AVO.SHAPE_POLYGON:
        //NOTE: Polygon doesn't account for shadowSize yet.
        this.context2d.beginPath();
        coords = obj.vertices;
        if (coords.length >= 1) this.context2d.moveTo(coords[coords.length-1].x + this.camera.x, coords[coords.length-1].y + this.camera.y);
        for (let i = 0; i < coords.length; i++) {
          this.context2d.lineTo(coords[i].x + this.camera.x, coords[i].y + this.camera.y);
        }            
        this.context2d.fill();
        this.context2d.closePath();
        break;
    }
  }
  
  paintComicPanel(panel = null, offsetY = 0) {
    if (!panel || !panel.loaded) return;
    
    const ratioX = this.canvasWidth / panel.img.width;
    const ratioY = this.canvasHeight / panel.img.height;
    const ratio = Math.min(1, Math.min(ratioX, ratioY));
    
    const srcX = 0;
    const srcY = 0;
    const srcW = panel.img.width;
    const srcH = panel.img.height;
    
    const tgtW = panel.img.width * ratio;
    const tgtH = panel.img.height * ratio;
    const tgtX = (this.canvasWidth - tgtW) / 2;  //TODO
    const tgtY = (this.canvasHeight - tgtH) / 2 + offsetY;  //TODO
    
    this.context2d.drawImage(panel.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
  }
  
  //----------------------------------------------------------------
  
  onPointerStart(e) {
    this.pointer.state = AVO.INPUT_ACTIVE;
    this.pointer.duration = 1;
    this.pointer.start = this.getPointerXY(e);
    this.pointer.now = this.pointer.start;
    return Utility.stopEvent(e);
  }
  
  onPointerMove(e) {
    if (this.pointer.state === AVO.INPUT_ACTIVE) {
      this.pointer.now = this.getPointerXY(e);
    }
    return Utility.stopEvent(e);
  }
  
  onPointerEnd(e) {
    this.pointer.state = AVO.INPUT_ENDED;
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
    let inputX = (clientX - this.boundingBox.left) * this.canvasSizeRatio;
    let inputY = (clientY - this.boundingBox.top) * this.canvasSizeRatio;
    return { x: inputX, y: inputY };
  }
  
  //----------------------------------------------------------------
  
  onKeyDown(e) {
    let keyCode = Utility.getKeyCode(e);
    if (keyCode > 0 && keyCode < AVO.MAX_KEYS && this.keys[keyCode].state != AVO.INPUT_ACTIVE) {
      this.keys[keyCode].state = AVO.INPUT_ACTIVE;
      this.keys[keyCode].duration = 1;
    }  //if keyCode == 0, there's an error.
  }
  
  onKeyUp(e) {
    let keyCode = Utility.getKeyCode(e);    
    if (keyCode > 0 && keyCode < AVO.MAX_KEYS) {
      this.keys[keyCode].state = AVO.INPUT_ENDED;
    }  //if keyCode == 0, there's an error.
  }
  
  //----------------------------------------------------------------
  
  updateSize() {
    if (this.config.autoFitCanvas) {
      const bestFit = Math.min(
        this.html.app.offsetWidth / this.canvasWidth,
        this.html.app.offsetHeight / this.canvasHeight
      );
      
      this.html.canvas.style =
        "width: " + Math.round(bestFit * this.canvasWidth) + "px; " +
        "height: " + Math.round(bestFit * this.canvasHeight) + "px; ";
    }
    
    let boundingBox = (this.html.canvas.getBoundingClientRect)
      ? this.html.canvas.getBoundingClientRect()
      : { left: 0, top: 0 };
    this.boundingBox = boundingBox;
    //this.sizeRatioX = this.canvasWidth / this.boundingBox.width;
    //this.sizeRatioY = this.canvasHeight / this.boundingBox.height;
    this.canvasSizeRatio = Math.min(
      this.canvasWidth / this.boundingBox.width,
      this.canvasHeight / this.boundingBox.height
    );
  }
}

//==============================================================================
