"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*  
AvO Adventure Game
==================

(Shaun A. Noordin || shaunanoordin.com || 20160517)
********************************************************************************
 */

/*  Primary App Class
 */
//==============================================================================

var App = function () {
  function App() {
    _classCallCheck(this, App);

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
    this.boundingBox = undefined; //To be defined by this.updateSize().
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

  _createClass(App, [{
    key: "run",
    value: function run() {
      this.paint();
      this.runCycle = setTimeout(this.run, 1 / App.FRAMES_PER_SECOND);
    }
  }, {
    key: "paint",
    value: function paint() {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.beginPath();
      this.context.arc(100, 75, 50, 0, 2 * Math.PI);
      this.context.stroke();
      this.context.closePath();
    }
  }, {
    key: "updateSize",
    value: function updateSize() {
      var boundingBox = this.canvas.getBoundingClientRect ? this.canvas.getBoundingClientRect() : { left: 0, top: 0 };
      this.boundingBox = boundingBox;
      this.sizeRatioX = this.width / this.boundingBox.width;
      this.sizeRatioY = this.height / this.boundingBox.height;
    }
  }]);

  return App;
}();

App.FRAMES_PER_SECOND = 50;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function () {
  window.app = new App();
};
//==============================================================================