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

  _createClass(App, [{
    key: "run",
    value: function run() {
      this.paint();
    }
  }, {
    key: "paint",
    value: function paint() {
      //Clear
      this.context.clearRect(0, 0, this.width, this.height);

      //Paint hitboxes
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.actors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var actor = _step.value;

          this.context.beginPath();
          switch (actor.shape) {
            case SHAPE_CIRCLE:
              this.context.arc(actor.x, actor.y, actor.size / 2, 0, 2 * Math.PI);
              this.context.stroke();
              break;
            case SHAPE_SQUARE:
              this.context.rect(actor.x - actor.size / 2, actor.y - actor.size / 2, actor.size, actor.size);
              this.context.stroke();
              break;
          }
          this.context.closePath();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
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

var FRAMES_PER_SECOND = 50;
var INPUT_IDLE = 0;
var INPUT_ACTIVE = 1;
var INPUT_ENDED = 2;
var MAX_KEYS = 128;
//==============================================================================

/*  Actor Class
 */
//==============================================================================

var Actor = function Actor() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
  var shape = arguments.length <= 4 || arguments[4] === undefined ? SHAPE_CIRCLE : arguments[4];

  _classCallCheck(this, Actor);

  this.name = name;
  this.x = x;
  this.y = y;
  this.size = size;
  this.shape = shape;
};

var SHAPE_SQUARE = 0;
var SHAPE_CIRCLE = 1;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function () {
  window.app = new App();
};
//==============================================================================