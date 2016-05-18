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
    
    //Bind Events
    //--------------------------------
    if ("onresize" in window) {
      window.onresize = this.updateSize.bind(this);
    }
    this.updateSize();
    //--------------------------------
    
    //TEST
    //--------------------------------
    this.actors.push(new Actor('c1', this.width / 2, this.height / 2, 32, SHAPE_CIRCLE));
    this.actors.push(new Actor('s1', Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32, SHAPE_SQUARE));
    //--------------------------------
    
    //Start!
    //--------------------------------
    this.runCycle = setInterval(this.run, 1 / FRAMES_PER_SECOND);
    //--------------------------------
  }
  
  run() {
    this.paint();
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

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function() {
  window.app = new App();
};
//==============================================================================
