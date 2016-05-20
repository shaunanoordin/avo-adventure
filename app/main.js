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
    this.physics = this.physics.bind(this);
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

    //Prepare Input
    //--------------------------------
    this.keys = new Array(MAX_KEYS);
    for (var i = 0; i < this.keys.length; i++) {
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
    if ("onmousedown" in this.canvas && "onmousemove" in this.canvas && "onmouseup" in this.canvas) {
      this.canvas.onmousedown = this.onPointerStart.bind(this);
      this.canvas.onmousemove = this.onPointerMove.bind(this);
      this.canvas.onmouseup = this.onPointerEnd.bind(this);
    }
    if ("ontouchstart" in this.canvas && "ontouchmove" in this.canvas && "ontouchend" in this.canvas && "ontouchcancel" in this.canvas) {
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

  _createClass(App, [{
    key: "run",
    value: function run() {
      //TEST: Input & Actions
      //--------------------------------
      if (this.pointer.state === INPUT_ACTIVE) {
        var distX = this.pointer.now.x - this.pointer.start.x;
        var distY = this.pointer.now.y - this.pointer.start.y;
        var dist = Math.sqrt(distX * distX + distY * distY);

        if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
          var angle = Math.atan2(distY, distX);
          var speed = 1;
          this.actors[0].x += Math.cos(angle) * speed;
          this.actors[0].y += Math.sin(angle) * speed;

          //UX improvement: reset the base point of the pointer so the player can
          //switch directions much more easily.
          if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2) {
            this.pointer.start.x = this.pointer.now.x - Math.cos(angle) * INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
            this.pointer.start.y = this.pointer.now.y - Math.sin(angle) * INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
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
        this.actors[0].shape = this.actors[0].shape === SHAPE_CIRCLE ? SHAPE_SQUARE : SHAPE_CIRCLE;
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
      for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i].state === INPUT_ACTIVE) {
          this.keys[i].duration++;
        } else if (this.keys[i].state === INPUT_ENDED) {
          this.keys[i].duration = 0;
          this.keys[i].state = INPUT_IDLE;
        }
      }
      //--------------------------------
    }
  }, {
    key: "physics",
    value: function physics() {
      for (var a = 0; a < this.actors.length; a++) {
        var actorA = this.actors[a];
        for (var b = a + 1; b < this.actors.length; b++) {
          var actorB = this.actors[b];
          var collisionCorrection = this.checkCollision(actorA, actorB);
          if (collisionCorrection) {
            actorA.size += actorA.size > 8 ? -1 : 0;
            actorB.size += actorB.size > 8 ? -1 : 0;
          }
        }
      }
    }
  }, {
    key: "checkCollision",
    value: function checkCollision(actorA, actorB) {
      if (!actorA || !actorB) return false;

      if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_CIRCLE) {
        var distX = actorA.x - actorB.x;
        var distY = actorA.y - actorB.y;
        var minimumDist = (actorA.size + actorB.size) / 2;
        if (distX * distX + distY * distY < minimumDist * minimumDist) {
          return true;
        } else {
          return false;
        }
      } else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_SQUARE) {
        if (actorA.x - actorA.size / 2 < actorB.x + actorB.size / 2 && actorA.x + actorA.size / 2 > actorB.x - actorB.size / 2 && actorA.y - actorA.size / 2 < actorB.y + actorB.size / 2 && actorA.y + actorA.size / 2 > actorB.y - actorB.size / 2) {
          return true;
        } else {
          return false;
        }
      }

      return false;
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

    //----------------------------------------------------------------

  }, {
    key: "onPointerStart",
    value: function onPointerStart(e) {
      this.pointer.state = INPUT_ACTIVE;
      this.pointer.duration = 1;
      this.pointer.start = this.getPointerXY(e);
      this.pointer.now = this.pointer.start;
      return Utility.stopEvent(e);
    }
  }, {
    key: "onPointerMove",
    value: function onPointerMove(e) {
      if (this.pointer.state === INPUT_ACTIVE) {
        this.pointer.now = this.getPointerXY(e);
      }
      return Utility.stopEvent(e);
    }
  }, {
    key: "onPointerEnd",
    value: function onPointerEnd(e) {
      this.pointer.state = INPUT_ENDED;
      //this.pointer.now = this.getPointerXY(e);
      return Utility.stopEvent(e);
    }
  }, {
    key: "getPointerXY",
    value: function getPointerXY(e) {
      var clientX = 0;
      var clientY = 0;
      if (e.clientX && e.clientY) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.touches && e.touches.length > 0 && e.touches[0].clientX && e.touches[0].clientY) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      var inputX = (clientX - this.boundingBox.left) * this.sizeRatioX;
      var inputY = (clientY - this.boundingBox.top) * this.sizeRatioY;
      return { x: inputX, y: inputY };
    }

    //----------------------------------------------------------------

  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      var keyCode = Utility.getKeyCode(e);
      if (keyCode > 0 && keyCode < MAX_KEYS && this.keys[keyCode].state != INPUT_ACTIVE) {
        this.keys[keyCode].state = INPUT_ACTIVE;
        this.keys[keyCode].duration = 1;
      } //if keyCode == 0, there's an error.
    }
  }, {
    key: "onKeyUp",
    value: function onKeyUp(e) {
      var keyCode = Utility.getKeyCode(e);
      if (keyCode > 0 && keyCode < MAX_KEYS) {
        this.keys[keyCode].state = INPUT_ENDED;
      } //if keyCode == 0, there's an error.
    }

    //----------------------------------------------------------------

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
var INPUT_DISTANCE_SENSITIVITY = 16;
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

/*  Utility Classes
 */
//==============================================================================
var Utility = {
  randomInt: function randomInt(min, max) {
    var a = min < max ? min : max;
    var b = min < max ? max : min;
    return Math.floor(a + Math.random() * (b - a + 1));
  },

  stopEvent: function stopEvent(e) {
    //var eve = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.returnValue = false;
    e.cancelBubble = true;
    return false;
  },

  getKeyCode: function getKeyCode(e) {
    //KeyboardEvent.keyCode is the most reliable identifier for a keyboard event
    //at the moment, but unfortunately it's being deprecated.
    if (e.keyCode) {
      return e.keyCode;
    }

    //KeyboardEvent.code and KeyboardEvent.key are the 'new' standards, but it's
    //far from being standardised between browsers.
    if (e.code && KeyValues[e.code]) {
      return KeyValues[e.code];
    } else if (e.key && KeyValues[e.key]) {
      return KeyValues[e.key];
    }

    return 0;
  }
};

var KEY_CODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,
  SPACE: 32,
  ESCAPE: 27
};

var KEY_VALUES = {
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
};

function ImageAsset(url) {
  this.url = url;
  this.img = null;
  this.loaded = false;
  this.img = new Image();
  this.img.onload = function () {
    this.loaded = true;
  }.bind(this);
  this.img.src = this.url;
}
//==============================================================================

/*  Initialisations
 */
//==============================================================================
var app;
window.onload = function () {
  window.app = new App();
};
//==============================================================================