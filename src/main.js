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
    
    
    //--------------------------------
    if ("onresize" in window) {
      window.onresize = this.updateSize.bind(this);
    }
    this.updateSize();
    //--------------------------------
    
    //Start!
    //--------------------------------
    this.run();
    //--------------------------------
  }
  
  run() {
    this.paint();
    this.runCycle = setTimeout(this.run, 1/App.FRAMES_PER_SECOND);
  }
  
  paint() {
    this.context.clearRect(0, 0, this.width, this.height);    
    this.context.beginPath();
    this.context.arc(100,75,50,0,2*Math.PI);
    this.context.stroke();
    this.context.closePath();
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

App.FRAMES_PER_SECOND = 50;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function() {
  window.app = new App();
};
//==============================================================================
