/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _index = __webpack_require__(1);

	var _index2 = __webpack_require__(9);

	/*  Initialisations
	 */
	//==============================================================================
	/*  
	AvO Adventure Game
	==================

	(Shaun A. Noordin || shaunanoordin.com || 20160517)
	********************************************************************************
	 */

	var app;
	window.onload = function () {
	  window.app = new _index.AvO(new _index2.Nonita60());
	};
	//==============================================================================

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.AvO = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*  
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     AvO Adventure Game Engine
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     =========================
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     (Shaun A. Noordin || shaunanoordin.com || 20170322)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ********************************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	//Naming note: all caps.


	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	var _story = __webpack_require__(3);

	var _physics = __webpack_require__(4);

	var _utility = __webpack_require__(5);

	var _standardActions = __webpack_require__(6);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var HTML_CANVAS_CSS_SCALE = 2;

	/*  Primary AvO Game Engine
	 */
	//==============================================================================

	var AvO = exports.AvO = function () {
	  //Naming note: small 'v' between capital 'A' and 'O'.
	  function AvO(story) {
	    _classCallCheck(this, AvO);

	    //Initialise properties
	    //--------------------------------
	    this.config = {
	      framesPerSecond: AVO.FRAMES_PER_SECOND,
	      debugMode: false,
	      topDownView: true, //Top-down view sorts Actors on paint().
	      skipStandardRun: false, //Skips the standard run() code, including physics.
	      skipStandardPaint: false };
	    this.runCycle = null;
	    this.html = {
	      app: document.getElementById("app"),
	      canvas: document.getElementById("canvas")
	    };
	    this.context2d = this.html.canvas.getContext("2d");
	    this.boundingBox = null; //To be defined by this.updateSize().
	    this.sizeRatioX = 1;
	    this.sizeRatioY = 1;
	    this.canvasWidth = this.html.canvas.width;
	    this.canvasHeight = this.html.canvas.height;
	    this.state = null;
	    this.animationSets = {};
	    //--------------------------------

	    //Account for graphical settings
	    //--------------------------------
	    if (HTML_CANVAS_CSS_SCALE !== 1) this.html.canvas.style = "width: " + Math.floor(this.canvasWidth * HTML_CANVAS_CSS_SCALE) + "px";
	    this.context2d.mozImageSmoothingEnabled = false;
	    this.context2d.msImageSmoothingEnabled = false;
	    this.context2d.imageSmoothingEnabled = false;
	    //--------------------------------

	    //Initialise Game Objects
	    //--------------------------------
	    this.story = story ? story : new _story.Story();
	    this.story.avo = this;
	    this.assets = {
	      images: {}
	    };
	    this.assetsLoaded = 0;
	    this.assetsTotal = 0;
	    //this.scripts = {
	    //  preRun: null,
	    //  postRun: null,
	    //  customRunStart: null,
	    //  customRunAction: null,
	    //  customRunComic: null,
	    //  customRunEnd: null,
	    //  prePaint: null,
	    //  postPaint: null,
	    //};
	    this.actors = [];
	    this.zones = [];
	    this.refs = {};
	    this.store = {};
	    //this.ui = {};
	    this.comicStrip = null;
	    this.actions = {};
	    //--------------------------------

	    //Prepare Input
	    //--------------------------------
	    this.keys = new Array(AVO.MAX_KEYS);
	    for (var i = 0; i < this.keys.length; i++) {
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
	    if ("onmousedown" in this.html.canvas && "onmousemove" in this.html.canvas && "onmouseup" in this.html.canvas) {
	      this.html.canvas.onmousedown = this.onPointerStart.bind(this);
	      this.html.canvas.onmousemove = this.onPointerMove.bind(this);
	      this.html.canvas.onmouseup = this.onPointerEnd.bind(this);
	    }
	    if ("ontouchstart" in this.html.canvas && "ontouchmove" in this.html.canvas && "ontouchend" in this.html.canvas && "ontouchcancel" in this.html.canvas) {
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
	    this.changeState(AVO.STATE_START, this.story.init);
	    this.runCycle = setInterval(this.run.bind(this), 1000 / this.config.framesPerSecond);
	    //--------------------------------
	  }

	  //----------------------------------------------------------------

	  _createClass(AvO, [{
	    key: "changeState",
	    value: function changeState(state) {
	      var storyScript = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

	      this.state = state;
	      if (storyScript && typeof storyScript === "function") {
	        storyScript();
	      }
	    }
	  }, {
	    key: "run",
	    value: function run() {
	      //if (this.scripts.preRun) this.scripts.preRun.apply(this);
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
	      }

	      //if (this.scripts.postRun) this.scripts.postRun.apply(this);
	      this.story.postRun();

	      this.paint();
	    }
	  }, {
	    key: "run_start",
	    value: function run_start() {
	      this.assetsLoaded = 0;
	      this.assetsTotal = 0;
	      for (var category in this.assets) {
	        for (var asset in this.assets[category]) {
	          this.assetsTotal++;
	          if (this.assets[category][asset].loaded) this.assetsLoaded++;
	        }
	      }
	      if (this.assetsLoaded < this.assetsTotal) return;

	      //Run Story script
	      //--------------------------------
	      this.story.run_start();
	      //--------------------------------
	    }
	  }, {
	    key: "run_end",
	    value: function run_end() {
	      //Run Story script
	      //--------------------------------
	      this.story.run_end();
	      //--------------------------------
	    }
	  }, {
	    key: "run_action",
	    value: function run_action() {
	      //Run Story script
	      //--------------------------------
	      this.story.run_action();
	      //--------------------------------

	      //Actors determine intent
	      //--------------------------------
	      if (this.refs[AVO.REF.PLAYER]) {
	        var player = this.refs[AVO.REF.PLAYER];
	        player.intent = { name: AVO.ACTION.IDLE };

	        //Mouse/touch input
	        if (this.pointer.state === AVO.INPUT_ACTIVE) {
	          var distX = this.pointer.now.x - this.pointer.start.x;
	          var distY = this.pointer.now.y - this.pointer.start.y;
	          var dist = Math.sqrt(distX * distX + distY * distY);

	          if (dist > AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
	            var angle = Math.atan2(distY, distX);
	            player.intent = {
	              name: AVO.ACTION.MOVING,
	              angle: angle
	            };

	            //UX improvement: reset the base point of the pointer so the player can
	            //switch directions much more easily.
	            if (dist > AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2) {
	              this.pointer.start.x = this.pointer.now.x - Math.cos(angle) * AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
	              this.pointer.start.y = this.pointer.now.y - Math.sin(angle) * AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
	            }
	          }
	        } else if (this.pointer.state === AVO.INPUT_ENDED) {
	          var _distX = this.pointer.now.x - this.pointer.start.x;
	          var _distY = this.pointer.now.y - this.pointer.start.y;
	          var _dist = Math.sqrt(_distX * _distX + _distY * _distY);

	          if (_dist <= AVO.INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
	            player.intent = {
	              name: AVO.ACTION.PRIMARY
	            };
	          }
	        }

	        //Keyboard input
	        var xDir = 0,
	            yDir = 0;
	        if (this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE) yDir--;
	        if (this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE) yDir++;
	        if (this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE) xDir--;
	        if (this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE) xDir++;

	        if (xDir > 0 && yDir === 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_EAST
	          };
	        } else if (xDir > 0 && yDir > 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_SOUTHEAST
	          };
	        } else if (xDir === 0 && yDir > 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_SOUTH
	          };
	        } else if (xDir < 0 && yDir > 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_SOUTHWEST
	          };
	        } else if (xDir < 0 && yDir === 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_WEST
	          };
	        } else if (xDir < 0 && yDir < 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_NORTHWEST
	          };
	        } else if (xDir === 0 && yDir < 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_NORTH
	          };
	        } else if (xDir > 0 && yDir < 0) {
	          player.intent = {
	            name: AVO.ACTION.MOVING,
	            angle: AVO.ROTATION_NORTHEAST
	          };
	        }

	        if (this.keys[AVO.KEY_CODES.SPACE].duration === 1) {
	          player.intent = {
	            name: AVO.ACTION.PRIMARY
	          };
	        }
	      }
	      //--------------------------------

	      //Zones apply Effects
	      //--------------------------------
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = this.zones[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var _zone = _step.value;
	          var _iteratorNormalCompletion4 = true;
	          var _didIteratorError4 = false;
	          var _iteratorError4 = undefined;

	          try {
	            for (var _iterator4 = this.actors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	              var actor = _step4.value;

	              if (_physics.Physics.checkCollision(_zone, actor)) {
	                var _iteratorNormalCompletion5 = true;
	                var _didIteratorError5 = false;
	                var _iteratorError5 = undefined;

	                try {
	                  for (var _iterator5 = _zone.effects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                    var effect = _step5.value;

	                    actor.effects.push(effect.copy());
	                  }
	                } catch (err) {
	                  _didIteratorError5 = true;
	                  _iteratorError5 = err;
	                } finally {
	                  try {
	                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
	                      _iterator5.return();
	                    }
	                  } finally {
	                    if (_didIteratorError5) {
	                      throw _iteratorError5;
	                    }
	                  }
	                }
	              }
	            }
	          } catch (err) {
	            _didIteratorError4 = true;
	            _iteratorError4 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                _iterator4.return();
	              }
	            } finally {
	              if (_didIteratorError4) {
	                throw _iteratorError4;
	              }
	            }
	          }
	        }
	        //--------------------------------

	        //Actors react to Effects and perform actions
	        //--------------------------------
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

	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = this.actors[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var _actor = _step2.value;

	          //First react to Effects.
	          var _iteratorNormalCompletion6 = true;
	          var _didIteratorError6 = false;
	          var _iteratorError6 = undefined;

	          try {
	            for (var _iterator6 = _actor.effects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	              var _effect = _step6.value;

	              //TODO make this an external script
	              //----------------
	              if (_effect.name === "push" && _actor.movable) {
	                _actor.x += _effect.data.x || 0;
	                _actor.y += _effect.data.y || 0;
	              }
	              //----------------
	            }

	            //If the actor is not busy, transform the intent into an action.
	          } catch (err) {
	            _didIteratorError6 = true;
	            _iteratorError6 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                _iterator6.return();
	              }
	            } finally {
	              if (_didIteratorError6) {
	                throw _iteratorError6;
	              }
	            }
	          }

	          if (_actor.state !== AVO.ACTOR_ACTING && _actor.state !== AVO.ACTOR_REACTING) {
	            if (_actor.intent) {
	              _actor.action = _actor.intent;
	            } else {
	              _actor.action = null;
	            }
	          }

	          //If the Actor has an action, perform it.
	          if (_actor.action) {
	            if (this.actions[_actor.action.name]) {
	              //Run a custom Action.
	              this.actions[_actor.action.name].apply(this, [_actor]);
	            } else if (_standardActions.StandardActions[_actor.action.name]) {
	              //Run a standard Action.
	              _standardActions.StandardActions[_actor.action.name].apply(this, [_actor]);
	            }
	          }
	        }
	        //--------------------------------

	        //Physics
	        //--------------------------------
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }

	      this.physics();
	      //--------------------------------

	      //Cleanup Zones
	      //--------------------------------
	      for (var i = this.zones.length - 1; i >= 0; i--) {
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
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = this.actors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var _actor2 = _step3.value;

	          for (var _i2 = _actor2.effects.length - 1; _i2 >= 0; _i2--) {
	            if (!_actor2.effects[_i2].hasInfiniteDuration()) {
	              _actor2.effects[_i2].duration--;
	              if (_actor2.effects[_i2].duration <= 0) {
	                _actor2.effects.splice(_i2, 1);
	              }
	            }
	          }
	        }
	        //--------------------------------

	        //Cleanup Input
	        //--------------------------------
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }

	      if (this.pointer.state === AVO.INPUT_ENDED) {
	        this.pointer.duration = 0;
	        this.pointer.state = AVO.INPUT_IDLE;
	      }
	      for (var _i = 0; _i < this.keys.length; _i++) {
	        if (this.keys[_i].state === AVO.INPUT_ACTIVE) {
	          this.keys[_i].duration++;
	        } else if (this.keys[_i].state === AVO.INPUT_ENDED) {
	          this.keys[_i].duration = 0;
	          this.keys[_i].state = AVO.INPUT_IDLE;
	        }
	      }
	      //--------------------------------
	    }
	  }, {
	    key: "run_comic",
	    value: function run_comic() {
	      //Run Story script
	      //--------------------------------
	      this.story.run_comic();
	      //--------------------------------

	      if (!this.comicStrip) return;
	      var comic = this.comicStrip;

	      if (comic.state !== AVO.COMIC_STRIP_STATE_TRANSITIONING && comic.currentPanel >= comic.panels.length) {
	        comic.onFinish.apply(this);
	      }

	      switch (comic.state) {
	        case AVO.COMIC_STRIP_STATE_TRANSITIONING:
	          if (comic.counter < comic.transitionTime) {
	            comic.counter++;
	          } else {
	            comic.counter = 0;
	            comic.state = AVO.COMIC_STRIP_STATE_WAIT_BEFORE_INPUT;
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
	          if (this.pointer.state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE || this.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
	            comic.currentPanel++;
	            comic.state = AVO.COMIC_STRIP_STATE_TRANSITIONING;
	          }
	          break;
	      }
	    }

	    //----------------------------------------------------------------

	  }, {
	    key: "physics",
	    value: function physics() {
	      for (var a = 0; a < this.actors.length; a++) {
	        var actorA = this.actors[a];
	        for (var b = a + 1; b < this.actors.length; b++) {
	          var actorB = this.actors[b];
	          var collisionCorrection = _physics.Physics.checkCollision(actorA, actorB);

	          if (collisionCorrection) {
	            //TODO: Check if this needs to be (!!collisionCorrection).
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

	  }, {
	    key: "paint",
	    value: function paint() {
	      //Clear
	      this.context2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

	      //if (this.scripts.prePaint) this.scripts.prePaint.apply(this);
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
	            this.paint_action();
	            break;
	          case AVO.STATE_COMIC:
	            this.paint_comic();
	            break;
	        }
	      }

	      //if (this.scripts.postPaint) this.scripts.postPaint.apply(this);
	      this.story.postPaint();
	    }
	  }, {
	    key: "paint_start",
	    value: function paint_start() {
	      var percentage = this.assetsTotal > 0 ? this.assetsLoaded / this.assetsTotal : 1;

	      this.context2d.font = AVO.DEFAULT_FONT;
	      this.context2d.textAlign = "center";
	      this.context2d.textBaseline = "middle";

	      if (this.assetsLoaded < this.assetsTotal) {
	        var rgb = Math.floor(percentage * 255);
	        this.context2d.beginPath();
	        this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
	        this.context2d.fillStyle = "rgba(" + rgb + "," + rgb + "," + rgb + ",1)";
	        this.context2d.fill();
	        this.context2d.fillStyle = "#fff";
	        this.context2d.fillText("Loading... (" + this.assetsLoaded + "/" + this.assetsTotal + ")", this.canvasWidth / 2, this.canvasHeight / 2);
	        this.context2d.closePath();
	      } else {
	        this.context2d.beginPath();
	        this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
	        this.context2d.fillStyle = "#fff";
	        this.context2d.fill();
	        this.context2d.fillStyle = "#000";
	        this.context2d.fillText("Ready!", this.canvasWidth / 2, this.canvasHeight / 2);
	        this.context2d.closePath();
	      }
	    }
	  }, {
	    key: "paint_end",
	    value: function paint_end() {
	      this.context2d.beginPath();
	      this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
	      this.context2d.fillStyle = "#3cc";
	      this.context2d.fill();
	      this.context2d.closePath();
	    }
	  }, {
	    key: "paint_action",
	    value: function paint_action() {
	      //Arrange sprites by vertical order.
	      //--------------------------------
	      if (this.config.topDownView) {
	        this.actors.sort(function (a, b) {
	          return a.bottom - b.bottom;
	        });
	      }
	      //--------------------------------

	      //DEBUG: Paint hitboxes
	      //--------------------------------
	      if (this.config.debugMode) {
	        this.context2d.lineWidth = 1;

	        //Areas of Effects
	        var _iteratorNormalCompletion7 = true;
	        var _didIteratorError7 = false;
	        var _iteratorError7 = undefined;

	        try {
	          for (var _iterator7 = this.zones[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	            var zone = _step7.value;

	            var durationPercentage = 1;
	            if (!zone.hasInfiniteDuration() && zone.startDuration > 0) {
	              durationPercentage = Math.max(0, zone.duration / zone.startDuration);
	            }
	            this.context2d.strokeStyle = "rgba(204,51,51," + durationPercentage + ")";

	            switch (zone.shape) {
	              case AVO.SHAPE_CIRCLE:
	                this.context2d.beginPath();
	                this.context2d.arc(zone.x, zone.y, zone.size / 2, 0, 2 * Math.PI);
	                this.context2d.stroke();
	                this.context2d.closePath();
	                break;
	              case AVO.SHAPE_SQUARE:
	                this.context2d.beginPath();
	                this.context2d.rect(zone.x - zone.size / 2, zone.y - zone.size / 2, zone.size, zone.size);
	                this.context2d.stroke();
	                this.context2d.closePath();
	                break;
	            }
	          }

	          //Actors
	        } catch (err) {
	          _didIteratorError7 = true;
	          _iteratorError7 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion7 && _iterator7.return) {
	              _iterator7.return();
	            }
	          } finally {
	            if (_didIteratorError7) {
	              throw _iteratorError7;
	            }
	          }
	        }

	        this.context2d.strokeStyle = "rgba(0,0,0,1)";
	        var _iteratorNormalCompletion8 = true;
	        var _didIteratorError8 = false;
	        var _iteratorError8 = undefined;

	        try {
	          for (var _iterator8 = this.actors[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	            var actor = _step8.value;

	            switch (actor.shape) {
	              case AVO.SHAPE_CIRCLE:
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
	              case AVO.SHAPE_SQUARE:
	                this.context2d.beginPath();
	                this.context2d.rect(actor.x - actor.size / 2, actor.y - actor.size / 2, actor.size, actor.size);
	                this.context2d.stroke();
	                this.context2d.closePath();
	                break;
	            }
	          }
	        } catch (err) {
	          _didIteratorError8 = true;
	          _iteratorError8 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion8 && _iterator8.return) {
	              _iterator8.return();
	            }
	          } finally {
	            if (_didIteratorError8) {
	              throw _iteratorError8;
	            }
	          }
	        }
	      }
	      //--------------------------------

	      //Paint sprites
	      //TODO: IMPROVE
	      //TODO: Layering
	      //--------------------------------
	      //Zones
	      var _iteratorNormalCompletion9 = true;
	      var _didIteratorError9 = false;
	      var _iteratorError9 = undefined;

	      try {
	        for (var _iterator9 = this.zones[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	          var _zone2 = _step9.value;

	          this.paintSprite(_zone2);
	          _zone2.nextAnimationFrame();
	        }

	        //Actors
	      } catch (err) {
	        _didIteratorError9 = true;
	        _iteratorError9 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion9 && _iterator9.return) {
	            _iterator9.return();
	          }
	        } finally {
	          if (_didIteratorError9) {
	            throw _iteratorError9;
	          }
	        }
	      }

	      var _iteratorNormalCompletion10 = true;
	      var _didIteratorError10 = false;
	      var _iteratorError10 = undefined;

	      try {
	        for (var _iterator10 = this.actors[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	          var _actor3 = _step10.value;

	          this.paintSprite(_actor3);
	          _actor3.nextAnimationFrame();
	        }
	        //--------------------------------

	        //DEBUG: Paint touch/mouse input
	        //--------------------------------
	      } catch (err) {
	        _didIteratorError10 = true;
	        _iteratorError10 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion10 && _iterator10.return) {
	            _iterator10.return();
	          }
	        } finally {
	          if (_didIteratorError10) {
	            throw _iteratorError10;
	          }
	        }
	      }

	      if (this.config.debugMode) {
	        this.context2d.strokeStyle = "rgba(128,128,128,0.8)";
	        this.context2d.lineWidth = 1;
	        this.context2d.beginPath();
	        this.context2d.arc(this.pointer.start.x, this.pointer.start.y, AVO.INPUT_DISTANCE_SENSITIVITY * 2 / HTML_CANVAS_CSS_SCALE, 0, 2 * Math.PI);
	        this.context2d.stroke();
	        this.context2d.closePath();
	      }
	      //--------------------------------
	    }
	  }, {
	    key: "paint_comic",
	    value: function paint_comic() {
	      if (!this.comicStrip) return;
	      var comic = this.comicStrip;

	      this.context2d.beginPath();
	      this.context2d.rect(0, 0, this.canvasWidth, this.canvasHeight);
	      this.context2d.fillStyle = comic.background;
	      this.context2d.fill();
	      this.context2d.closePath();

	      switch (comic.state) {
	        case AVO.COMIC_STRIP_STATE_TRANSITIONING:
	          var offsetY = comic.transitionTime > 0 ? Math.floor(comic.counter / comic.transitionTime * -this.canvasHeight) : 0;
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
	  }, {
	    key: "paintSprite",
	    value: function paintSprite(obj) {
	      if (!obj.spritesheet || !obj.spritesheet.loaded || !obj.animationSet || !obj.animationSet.actions[obj.animationName]) return;

	      var animationSet = obj.animationSet;

	      var srcW = animationSet.tileWidth;
	      var srcH = animationSet.tileHeight;
	      var srcX = 0;
	      var srcY = 0;
	      if (animationSet.rule === AVO.ANIMATION_RULE_DIRECTIONAL) {
	        srcX = obj.direction * srcW;
	        srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
	      } else {
	        srcX = animationSet.actions[obj.animationName].steps[obj.animationStep].col * srcW;
	        srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
	      }

	      var tgtX = Math.floor(obj.x - srcW / 2 + animationSet.tileOffsetX);
	      var tgtY = Math.floor(obj.y - srcH / 2 + animationSet.tileOffsetY);
	      var tgtW = Math.floor(srcW);
	      var tgtH = Math.floor(srcH);

	      this.context2d.drawImage(obj.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
	    }
	  }, {
	    key: "paintComicPanel",
	    value: function paintComicPanel() {
	      var panel = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	      var offsetY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	      if (!panel || !panel.loaded) return;

	      var ratioX = this.canvasWidth / panel.img.width;
	      var ratioY = this.canvasHeight / panel.img.height;
	      var ratio = Math.min(1, Math.min(ratioX, ratioY));

	      var srcX = 0;
	      var srcY = 0;
	      var srcW = panel.img.width;
	      var srcH = panel.img.height;

	      var tgtW = panel.img.width * ratio;
	      var tgtH = panel.img.height * ratio;
	      var tgtX = (this.canvasWidth - tgtW) / 2; //TODO
	      var tgtY = (this.canvasHeight - tgtH) / 2 + offsetY; //TODO

	      this.context2d.drawImage(panel.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
	    }

	    //----------------------------------------------------------------

	  }, {
	    key: "onPointerStart",
	    value: function onPointerStart(e) {
	      this.pointer.state = AVO.INPUT_ACTIVE;
	      this.pointer.duration = 1;
	      this.pointer.start = this.getPointerXY(e);
	      this.pointer.now = this.pointer.start;
	      return _utility.Utility.stopEvent(e);
	    }
	  }, {
	    key: "onPointerMove",
	    value: function onPointerMove(e) {
	      if (this.pointer.state === AVO.INPUT_ACTIVE) {
	        this.pointer.now = this.getPointerXY(e);
	      }
	      return _utility.Utility.stopEvent(e);
	    }
	  }, {
	    key: "onPointerEnd",
	    value: function onPointerEnd(e) {
	      this.pointer.state = AVO.INPUT_ENDED;
	      //this.pointer.now = this.getPointerXY(e);
	      return _utility.Utility.stopEvent(e);
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
	      var keyCode = _utility.Utility.getKeyCode(e);
	      if (keyCode > 0 && keyCode < AVO.MAX_KEYS && this.keys[keyCode].state != AVO.INPUT_ACTIVE) {
	        this.keys[keyCode].state = AVO.INPUT_ACTIVE;
	        this.keys[keyCode].duration = 1;
	      } //if keyCode == 0, there's an error.
	    }
	  }, {
	    key: "onKeyUp",
	    value: function onKeyUp(e) {
	      var keyCode = _utility.Utility.getKeyCode(e);
	      if (keyCode > 0 && keyCode < AVO.MAX_KEYS) {
	        this.keys[keyCode].state = AVO.INPUT_ENDED;
	      } //if keyCode == 0, there's an error.
	    }

	    //----------------------------------------------------------------

	  }, {
	    key: "updateSize",
	    value: function updateSize() {
	      var boundingBox = this.html.canvas.getBoundingClientRect ? this.html.canvas.getBoundingClientRect() : { left: 0, top: 0 };
	      this.boundingBox = boundingBox;
	      this.sizeRatioX = this.canvasWidth / this.boundingBox.width;
	      this.sizeRatioY = this.canvasHeight / this.boundingBox.height;
	    }
	  }]);

	  return AvO;
	}();

	//==============================================================================

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	Constant Values
	===============

	(Shaun A. Noordin || shaunanoordin.com || 20160901)
	********************************************************************************
	 */
	var FRAMES_PER_SECOND = exports.FRAMES_PER_SECOND = 50;
	var INPUT_IDLE = exports.INPUT_IDLE = 0;
	var INPUT_ACTIVE = exports.INPUT_ACTIVE = 1;
	var INPUT_ENDED = exports.INPUT_ENDED = 2;
	var INPUT_DISTANCE_SENSITIVITY = exports.INPUT_DISTANCE_SENSITIVITY = 16;
	var MAX_KEYS = exports.MAX_KEYS = 128;

	var STATE_START = exports.STATE_START = 0; //AvO App states
	var STATE_ACTION = exports.STATE_ACTION = 1;
	var STATE_COMIC = exports.STATE_COMIC = 2;
	var STATE_END = exports.STATE_END = 3;

	var ACTOR_IDLE = exports.ACTOR_IDLE = 0; //Actor states
	var ACTOR_MOVING = exports.ACTOR_MOVING = 1;
	var ACTOR_ACTING = exports.ACTOR_ACTING = 2;
	var ACTOR_REACTING = exports.ACTOR_REACTING = 3;

	var REF = exports.REF = { //Standard References
	  PLAYER: "player"
	};

	var ACTION = exports.ACTION = { //Standard Actions
	  IDLE: "idle",
	  MOVING: "moving",
	  PRIMARY: "primary"
	};

	var ATTR = exports.ATTR = { //Standard Attributes
	  SPEED: "speed"
	};

	var ANIMATION_RULE_BASIC = exports.ANIMATION_RULE_BASIC = "basic";
	var ANIMATION_RULE_DIRECTIONAL = exports.ANIMATION_RULE_DIRECTIONAL = "directional";

	var SHAPE_NONE = exports.SHAPE_NONE = 0; //No shape = no collision
	var SHAPE_SQUARE = exports.SHAPE_SQUARE = 1;
	var SHAPE_CIRCLE = exports.SHAPE_CIRCLE = 2;

	var ROTATION_EAST = exports.ROTATION_EAST = 0;
	var ROTATION_SOUTH = exports.ROTATION_SOUTH = Math.PI * 0.5;
	var ROTATION_WEST = exports.ROTATION_WEST = Math.PI;
	var ROTATION_NORTH = exports.ROTATION_NORTH = Math.PI * -0.5;

	var ROTATION_SOUTHEAST = exports.ROTATION_SOUTHEAST = Math.PI * 0.25;
	var ROTATION_SOUTHWEST = exports.ROTATION_SOUTHWEST = Math.PI * 0.75;
	var ROTATION_NORTHWEST = exports.ROTATION_NORTHWEST = Math.PI * -0.75;
	var ROTATION_NORTHEAST = exports.ROTATION_NORTHEAST = Math.PI * -0.25;

	var DIRECTION_EAST = exports.DIRECTION_EAST = 0;
	var DIRECTION_SOUTH = exports.DIRECTION_SOUTH = 1;
	var DIRECTION_WEST = exports.DIRECTION_WEST = 2;
	var DIRECTION_NORTH = exports.DIRECTION_NORTH = 3;

	var DURATION_INFINITE = exports.DURATION_INFINITE = 0;

	var COMIC_STRIP_STATE_TRANSITIONING = exports.COMIC_STRIP_STATE_TRANSITIONING = 0;
	var COMIC_STRIP_STATE_WAIT_BEFORE_INPUT = exports.COMIC_STRIP_STATE_WAIT_BEFORE_INPUT = 1;
	var COMIC_STRIP_STATE_IDLE = exports.COMIC_STRIP_STATE_IDLE = 2;

	var DEFAULT_FONT = exports.DEFAULT_FONT = "32px monospace";
	var DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT = exports.DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT = 10;
	var DEFAULT_COMIC_STRIP_TRANSITION_TIME = exports.DEFAULT_COMIC_STRIP_TRANSITION_TIME = 20;

	var STACKING_RULE_ADD = exports.STACKING_RULE_ADD = 0;
	var STACKING_RULE_REPLACE = exports.STACKING_RULE_REPLACE = 1;

	var KEY_CODES = exports.KEY_CODES = {
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
	  NUM9: 57
	};

	var KEY_VALUES = exports.KEY_VALUES = {
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
	  "Digit9": KEY_CODES.NUM9
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*  
	AvO Adventure Story
	===================

	(Shaun A. Noordin || shaunanoordin.com || 20170322)
	********************************************************************************
	 */

	var Story = exports.Story = function () {
	  function Story() {
	    _classCallCheck(this, Story);

	    this.avo = null; //Reference to the AvO game engine, automatically set when
	    //the AvO engine is initialised.

	    this.init = this.init.bind(this);

	    this.run_start = this.run_start.bind(this);
	    this.run_end = this.run_end.bind(this);
	    this.run_action = this.run_action.bind(this);
	    this.run_comic = this.run_comic.bind(this);

	    this.preRun = this.preRun.bind(this);
	    this.postRun = this.postRun.bind(this);

	    this.prePaint = this.prePaint.bind(this);
	    this.postPaint = this.postPaint.bind(this);
	  }

	  _createClass(Story, [{
	    key: "init",
	    value: function init() {}
	  }, {
	    key: "run_start",
	    value: function run_start() {}
	  }, {
	    key: "run_end",
	    value: function run_end() {}
	  }, {
	    key: "run_action",
	    value: function run_action() {}
	  }, {
	    key: "run_comic",
	    value: function run_comic() {}
	  }, {
	    key: "preRun",
	    value: function preRun() {}
	  }, {
	    key: "postRun",
	    value: function postRun() {}
	  }, {
	    key: "prePaint",
	    value: function prePaint() {}
	  }, {
	    key: "postPaint",
	    value: function postPaint() {}
	  }]);

	  return Story;
	}();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Physics = undefined;

	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /*
	                                                                                                                                                                                                    Physics Classes
	                                                                                                                                                                                                    ===============
	                                                                                                                                                                                                    
	                                                                                                                                                                                                    (Shaun A. Noordin || shaunanoordin.com || 20170209)
	                                                                                                                                                                                                    ********************************************************************************
	                                                                                                                                                                                                     */

	//Naming note: all caps.

	var USE_CIRCLE_APPROXIMATION = false;

	var Physics = exports.Physics = {
	  //----------------------------------------------------------------

	  /*  Checks if objA is touching objB.
	      If true, returns the corrected coordinates for objA and objB, in form:
	        { ax, ay, bx, by }
	      If false, returns null.
	   */
	  checkCollision: function checkCollision(objA, objB) {
	    if (!objA || !objB || objA === objB) return null;

	    if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_CIRCLE) {
	      return this.checkCollision_circleCircle(objA, objB);
	    } else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_SQUARE) {
	      return this.checkCollision_polygonPolygon(objA, objB);
	    } else if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_SQUARE) {
	      if (USE_CIRCLE_APPROXIMATION) return this.checkCollision_polygonPolygon(objA, objB);

	      return this.checkCollision_circlePolygon(objA, objB);
	    } else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_CIRCLE) {
	      if (USE_CIRCLE_APPROXIMATION) return this.checkCollision_polygonPolygon(objA, objB);

	      var correction = this.checkCollision_circlePolygon(objB, objA);
	      if (correction) {
	        correction = {
	          ax: correction.bx,
	          ay: correction.by,
	          bx: correction.ax,
	          by: correction.ay
	        };
	      }
	      return correction;
	    }

	    return null;
	  },

	  //----------------------------------------------------------------

	  checkCollision_circleCircle: function checkCollision_circleCircle(objA, objB) {
	    var fractionA = 0;
	    var fractionB = 0;
	    if (!objA.solid || !objB.solid) {
	      //If either object isn't solid, there's no collision correction.
	    } else if (objA.movable && objB.movable) {
	      fractionA = 0.5;
	      fractionB = 0.5;
	    } else if (objA.movable) {
	      fractionA = 1;
	    } else if (objB.movable) {
	      fractionB = 1;
	    }

	    var distX = objB.x - objA.x;
	    var distY = objB.y - objA.y;
	    var dist = Math.sqrt(distX * distX + distY * distY);
	    var minimumDist = objA.radius + objB.radius;
	    if (dist < minimumDist) {
	      var angle = Math.atan2(distY, distX);
	      var correctDist = minimumDist;
	      var cosAngle = Math.cos(angle);
	      var sinAngle = Math.sin(angle);

	      return {
	        ax: objA.x - cosAngle * (correctDist - dist) * fractionA,
	        ay: objA.y - sinAngle * (correctDist - dist) * fractionA,
	        bx: objB.x + cosAngle * (correctDist - dist) * fractionB,
	        by: objB.y + sinAngle * (correctDist - dist) * fractionB
	      };
	    }

	    return null;
	  },

	  //----------------------------------------------------------------

	  checkCollision_polygonPolygon: function checkCollision_polygonPolygon(objA, objB) {
	    var fractionA = 0;
	    var fractionB = 0;
	    if (!objA.solid || !objB.solid) {
	      //If either object isn't solid, there's no collision correction.
	    } else if (objA.movable && objB.movable) {
	      fractionA = 0.5;
	      fractionB = 0.5;
	    } else if (objA.movable) {
	      fractionA = 1;
	    } else if (objB.movable) {
	      fractionB = 1;
	    }

	    var correction = null;
	    var verticesA = objA.vertices;
	    var verticesB = objB.vertices;
	    var projectionAxes = [].concat(_toConsumableArray(this.getShapeNormals(objA)), _toConsumableArray(this.getShapeNormals(objB)));
	    for (var i = 0; i < projectionAxes.length; i++) {
	      var axis = projectionAxes[i];
	      var projectionA = { min: Infinity, max: -Infinity };
	      var projectionB = { min: Infinity, max: -Infinity };

	      for (var j = 0; j < verticesA.length; j++) {
	        var val = this.dotProduct(axis, verticesA[j]);
	        projectionA.min = Math.min(projectionA.min, val);
	        projectionA.max = Math.max(projectionA.max, val);
	      }
	      for (var _j = 0; _j < verticesB.length; _j++) {
	        var _val = this.dotProduct(axis, verticesB[_j]);
	        projectionB.min = Math.min(projectionB.min, _val);
	        projectionB.max = Math.max(projectionB.max, _val);
	      }

	      var overlap = Math.max(0, Math.min(projectionA.max, projectionB.max) - Math.max(projectionA.min, projectionB.min));
	      if (!correction || overlap < correction.magnitude) {
	        var sign = Math.sign(projectionB.min + projectionB.max - (projectionA.min + projectionA.max));
	        correction = {
	          magnitude: overlap,
	          x: axis.x * overlap * sign,
	          y: axis.y * overlap * sign
	        };
	      }
	    }

	    if (correction && correction.magnitude > 0) {
	      return {
	        ax: objA.x - correction.x * fractionA,
	        ay: objA.y - correction.y * fractionA,
	        bx: objB.x + correction.x * fractionB,
	        by: objB.y + correction.y * fractionB
	      };
	    }

	    return null;
	  },

	  //----------------------------------------------------------------

	  checkCollision_circlePolygon: function checkCollision_circlePolygon(objA, objB) {
	    var fractionA = 0;
	    var fractionB = 0;
	    if (!objA.solid || !objB.solid) {
	      //If either object isn't solid, there's no collision correction.
	    } else if (objA.movable && objB.movable) {
	      fractionA = 0.5;
	      fractionB = 0.5;
	    } else if (objA.movable) {
	      fractionA = 1;
	    } else if (objB.movable) {
	      fractionB = 1;
	    }

	    var distX = objB.x - objA.x;
	    var distY = objB.y - objA.y;
	    var dist = Math.sqrt(distX * distX + distY * distY);
	    var angle = Math.atan2(distY, distX);
	    var centreToCentreAxis = dist !== 0 ? { x: distX / dist, y: distY / dist } : { x: 0, y: 0 };

	    var correction = null;
	    var verticesB = objB.vertices;
	    var projectionAxes = [centreToCentreAxis].concat(_toConsumableArray(this.getShapeNormals(objB)));
	    for (var i = 0; i < projectionAxes.length; i++) {
	      var axis = projectionAxes[i];
	      var scalarA = this.dotProduct(axis, { x: objA.x, y: objA.y });
	      var projectionA = { min: scalarA - objA.radius, max: scalarA + objA.radius };
	      var projectionB = { min: Infinity, max: -Infinity };

	      for (var j = 0; j < verticesB.length; j++) {
	        var val = this.dotProduct(axis, verticesB[j]);
	        projectionB.min = Math.min(projectionB.min, val);
	        projectionB.max = Math.max(projectionB.max, val);
	      }

	      var overlap = Math.max(0, Math.min(projectionA.max, projectionB.max) - Math.max(projectionA.min, projectionB.min));
	      if (!correction || overlap < correction.magnitude) {
	        var sign = Math.sign(projectionB.min + projectionB.max - (projectionA.min + projectionA.max));
	        correction = {
	          magnitude: overlap,
	          x: axis.x * overlap * sign,
	          y: axis.y * overlap * sign
	        };
	      }
	    }

	    if (correction && correction.magnitude > 0) {
	      return {
	        ax: objA.x - correction.x * fractionA,
	        ay: objA.y - correction.y * fractionA,
	        bx: objB.x + correction.x * fractionB,
	        by: objB.y + correction.y * fractionB
	      };
	    }
	  },

	  //----------------------------------------------------------------

	  /*  Gets the NORMALISED normals for each edge of the object's shape. Assumes the object has the 'vertices' property.
	   */
	  getShapeNormals: function getShapeNormals(obj) {
	    var vertices = obj.vertices;
	    if (!vertices) return null;
	    if (vertices.length < 2) return []; //Look you need to have at least three vertices to be a shape.

	    //First, calculate the edges connecting each vertice.
	    //--------------------------------
	    var edges = [];
	    for (var i = 0; i < vertices.length; i++) {
	      var p1 = vertices[i];
	      var p2 = vertices[(i + 1) % vertices.length];
	      edges.push({
	        x: p2.x - p1.x,
	        y: p2.y - p1.y
	      });
	    }
	    //--------------------------------

	    //Calculate the NORMALISED normals for each edge.
	    //--------------------------------
	    return edges.map(function (edge) {
	      var dist = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
	      if (dist === 0) return { x: 0, y: 0 };
	      return {
	        x: -edge.y / dist,
	        y: edge.x / dist
	      };
	    });
	    //--------------------------------
	  },

	  //----------------------------------------------------------------

	  dotProduct: function dotProduct(vectorA, vectorB) {
	    if (!vectorA || !vectorB) return null;
	    return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Utility = undefined;
	exports.ImageAsset = ImageAsset;

	var _constants = __webpack_require__(2);

	var Utility = exports.Utility = {
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
	    if (e.code && _constants.KEY_VALUES[e.code]) {
	      return _constants.KEY_VALUES[e.code];
	    } else if (e.key && _constants.KEY_VALUES[e.key]) {
	      return _constants.KEY_VALUES[e.key];
	    }

	    return 0;
	  }
	}; /*
	   Utility Classes
	   ===============
	   
	   (Shaun A. Noordin || shaunanoordin.com || 20160901)
	   ********************************************************************************
	    */

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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.StandardActions = undefined;

	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	var _entities = __webpack_require__(7);

	var _effect = __webpack_require__(8);

	var _utility = __webpack_require__(5);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/*  
	AvO Standard Actions
	====================

	(Shaun A. Noordin || shaunanoordin.com || 20161008)
	********************************************************************************
	 */

	var StandardActions = exports.StandardActions = {}; //Naming note: all caps.


	StandardActions[AVO.ACTION.IDLE] = function (actor) {
	  actor.state = AVO.ACTOR_IDLE;
	  actor.playAnimation(AVO.ACTION.IDLE);
	};

	StandardActions[AVO.ACTION.MOVING] = function (actor) {
	  var angle = actor.action.angle || 0;
	  var speed = actor.attributes[AVO.ATTR.SPEED] || 0;
	  actor.x += Math.cos(angle) * speed;
	  actor.y += Math.sin(angle) * speed;
	  actor.rotation = angle;
	  actor.state = AVO.ACTOR_MOVING;
	  actor.playAnimation(AVO.ACTION.MOVING);
	};

	StandardActions[AVO.ACTION.PRIMARY] = function (actor) {
	  //TODO This is just a placeholder
	  //................
	  console.log('X');
	  var PUSH_POWER = 12;
	  var ZONE_SIZE = this.refs[AVO.REF.PLAYER].size;
	  var distance = this.refs[AVO.REF.PLAYER].radius + ZONE_SIZE / 2;
	  var x = this.refs[AVO.REF.PLAYER].x + Math.cos(this.refs[AVO.REF.PLAYER].rotation) * distance;
	  var y = this.refs[AVO.REF.PLAYER].y + Math.sin(this.refs[AVO.REF.PLAYER].rotation) * distance;;
	  var newZone = new _entities.Zone("", x, y, ZONE_SIZE, AVO.SHAPE_CIRCLE, 5, [new _effect.Effect("push", { x: Math.cos(this.refs[AVO.REF.PLAYER].rotation) * PUSH_POWER, y: Math.sin(this.refs[AVO.REF.PLAYER].rotation) * PUSH_POWER }, 2, AVO.STACKING_RULE_ADD)]);
	  this.zones.push(newZone);
	  actor.playAnimation(AVO.ACTION.PRIMARY);
	  //................
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Zone = exports.Actor = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*  
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     AvO Entities (In-Game Objects)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ==============================
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     (Shaun A. Noordin || shaunanoordin.com || 20161001)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ********************************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	//Naming note: all caps.


	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	var _utility = __webpack_require__(5);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*  Entity Class
	    A general abstract object within the game.
	 */
	//==============================================================================
	var Entity = function () {
	  function Entity() {
	    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
	    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
	    var shape = arguments.length <= 4 || arguments[4] === undefined ? AVO.SHAPE_NONE : arguments[4];

	    _classCallCheck(this, Entity);

	    this.name = name;
	    this.x = x;
	    this.y = y;
	    this.size = size;
	    this.shape = shape;
	    this.solid = shape !== AVO.SHAPE_NONE;
	    this.movable = true;
	    this.rotation = AVO.ROTATION_SOUTH; //Rotation in radians; clockwise positive.

	    this.spritesheet = null;
	    this.animationStep = 0;
	    this.animationSet = null;
	    this.animationName = "";
	  }

	  _createClass(Entity, [{
	    key: "playAnimation",
	    value: function playAnimation() {
	      var animationName = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
	      var restart = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	      if (!this.animationSet || !this.animationSet.actions[animationName]) return;

	      if (restart || this.animationName !== animationName) {
	        //Set this as the new animation
	        this.animationStep = 0;
	        this.animationName = animationName;
	      }
	    }
	  }, {
	    key: "nextAnimationFrame",
	    value: function nextAnimationFrame() {
	      if (!this.animationSet || !this.animationSet.actions[this.animationName]) return;

	      var animationAction = this.animationSet.actions[this.animationName];
	      this.animationStep++;
	      if (animationAction.steps.length === 0) {
	        this.animationStep = 0;
	      } else if (animationAction.loop) {
	        while (this.animationStep >= animationAction.steps.length) {
	          this.animationStep -= animationAction.steps.length;
	        }
	      } else {
	        this.animationStep = animationAction.steps.length - 1;
	      }
	    }
	  }, {
	    key: "left",
	    get: function get() {
	      return this.x - this.size / 2;
	    }
	  }, {
	    key: "right",
	    get: function get() {
	      return this.x + this.size / 2;
	    }
	  }, {
	    key: "top",
	    get: function get() {
	      return this.y - this.size / 2;
	    }
	  }, {
	    key: "bottom",
	    get: function get() {
	      return this.y + this.size / 2;
	    }
	  }, {
	    key: "radius",
	    get: function get() {
	      return this.size / 2;
	    }
	  }, {
	    key: "rotation",
	    get: function get() {
	      return this._rotation;
	    },
	    set: function set(val) {
	      this._rotation = val;
	      while (this._rotation > Math.PI) {
	        this._rotation -= Math.PI * 2;
	      }
	      while (this._rotation <= -Math.PI) {
	        this._rotation += Math.PI * 2;
	      }
	    }
	  }, {
	    key: "direction",
	    get: function get() {
	      //Get cardinal direction
	      //Favour East and West when rotation is exactly SW, NW, SE or NE.
	      if (this._rotation <= Math.PI * 0.25 && this._rotation >= Math.PI * -0.25) {
	        return AVO.DIRECTION_EAST;
	      } else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) {
	        return AVO.DIRECTION_SOUTH;
	      } else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) {
	        return AVO.DIRECTION_NORTH;
	      } else {
	        return AVO.DIRECTION_WEST;
	      }
	    },
	    set: function set(val) {
	      switch (val) {
	        case AVO.DIRECTION_EAST:
	          this._rotation = AVO.ROTATION_EAST;
	          break;
	        case AVO.DIRECTION_SOUTH:
	          this._rotation = AVO.ROTATION_SOUTH;
	          break;
	        case AVO.DIRECTION_WEST:
	          this._rotation = AVO.ROTATION_WEST;
	          break;
	        case AVO.DIRECTION_NORTH:
	          this._rotation = AVO.ROTATION_NORTH;
	          break;
	      }
	    }
	  }, {
	    key: "vertices",
	    get: function get() {
	      var _this = this;

	      var v = [];
	      if (this.shape === AVO.SHAPE_SQUARE) {
	        v.push({ x: this.left, y: this.top });
	        v.push({ x: this.right, y: this.top });
	        v.push({ x: this.right, y: this.bottom });
	        v.push({ x: this.left, y: this.bottom });
	      } else if (this.shape === AVO.SHAPE_CIRCLE) {
	        //Approximation
	        CIRCLE_TO_POLYGON_APPROXIMATOR.map(function (approximator) {
	          v.push({ x: _this.x + _this.radius * approximator.cosAngle, y: _this.y + _this.radius * approximator.sinAngle });
	        });
	      }
	      return v;
	    }
	  }]);

	  return Entity;
	}();

	var CIRCLE_TO_POLYGON_APPROXIMATOR = [AVO.ROTATION_EAST, AVO.ROTATION_SOUTHEAST, AVO.ROTATION_SOUTH, AVO.ROTATION_SOUTHWEST, AVO.ROTATION_WEST, AVO.ROTATION_NORTHWEST, AVO.ROTATION_NORTH, AVO.ROTATION_NORTHEAST].map(function (angle) {
	  return { cosAngle: Math.cos(angle), sinAngle: Math.sin(angle) };
	});

	//==============================================================================

	/*  Actor Class
	    An active character in the game.
	 */
	//==============================================================================

	var Actor = exports.Actor = function (_Entity) {
	  _inherits(Actor, _Entity);

	  function Actor() {
	    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
	    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
	    var shape = arguments.length <= 4 || arguments[4] === undefined ? AVO.SHAPE_NONE : arguments[4];

	    _classCallCheck(this, Actor);

	    var _this2 = _possibleConstructorReturn(this, (Actor.__proto__ || Object.getPrototypeOf(Actor)).call(this, name, x, y, size, shape));

	    _this2.state = AVO.ACTOR_IDLE;
	    _this2.intent = null;
	    _this2.action = null;

	    _this2.attributes = {};
	    _this2.effects = [];
	    return _this2;
	  }

	  return Actor;
	}(Entity);
	//==============================================================================

	/*  Zone Class
	    An area that applies Effects to Actors that touch it.
	 */
	//==============================================================================


	var Zone = exports.Zone = function (_Entity2) {
	  _inherits(Zone, _Entity2);

	  function Zone() {
	    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
	    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
	    var shape = arguments.length <= 4 || arguments[4] === undefined ? AVO.SHAPE_CIRCLE : arguments[4];
	    var duration = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
	    var effects = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];

	    _classCallCheck(this, Zone);

	    var _this3 = _possibleConstructorReturn(this, (Zone.__proto__ || Object.getPrototypeOf(Zone)).call(this, name, x, y, size, shape));

	    _this3.duration = duration;
	    _this3.startDuration = duration;
	    _this3.effects = effects;
	    return _this3;
	  }

	  _createClass(Zone, [{
	    key: "hasInfiniteDuration",
	    value: function hasInfiniteDuration() {
	      return this.startDuration === AVO.DURATION_INFINITE;
	    }
	  }]);

	  return Zone;
	}(Entity);
	//==============================================================================

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Effect = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*  
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Effect
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ======
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     (Shaun A. Noordin || shaunanoordin.com || 20161011)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ********************************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	//Naming note: all caps.

	/*  Effect Class
	    A general effect that's applied to an Actor. 
	 */
	//==============================================================================
	var Effect = exports.Effect = function () {
	  function Effect() {
	    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
	    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	    var duration = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
	    var stackingRule = arguments.length <= 3 || arguments[3] === undefined ? AVO.STACKING_RULE_ADD : arguments[3];

	    _classCallCheck(this, Effect);

	    this.name = name;
	    this.data = data;
	    this.duration = duration;
	    this.stackingRule = stackingRule;
	    this.startDuration = duration;
	  }

	  _createClass(Effect, [{
	    key: "hasInfiniteDuration",
	    value: function hasInfiniteDuration() {
	      return this.startDuration === AVO.DURATION_INFINITE;
	    }
	  }, {
	    key: "copy",
	    value: function copy() {
	      return new Effect(this.name, this.data, this.duration, this.stackingRule);
	    }
	  }]);

	  return Effect;
	}();
	//==============================================================================

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Nonita60 = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _constants = __webpack_require__(2);

	var AVO = _interopRequireWildcard(_constants);

	var _story = __webpack_require__(3);

	var _entities = __webpack_require__(7);

	var _utility = __webpack_require__(5);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               Nonita 60
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               =========
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               (Shaun A. Noordin || shaunanoordin.com || 20170322)
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ********************************************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

	var Nonita60 = exports.Nonita60 = function (_Story) {
	  _inherits(Nonita60, _Story);

	  function Nonita60() {
	    _classCallCheck(this, Nonita60);

	    var _this = _possibleConstructorReturn(this, (Nonita60.__proto__ || Object.getPrototypeOf(Nonita60)).call(this));

	    _this.init = _this.init.bind(_this);
	    _this.run_start = _this.run_start.bind(_this);
	    _this.prepareRoom = _this.prepareRoom.bind(_this);
	    _this.enterRoom1 = _this.enterRoom1.bind(_this);
	    return _this;
	  }

	  _createClass(Nonita60, [{
	    key: "init",
	    value: function init() {
	      var avo = this.avo;

	      //Config
	      //--------------------------------
	      avo.config.debugMode = true;
	      //--------------------------------

	      //Images
	      //--------------------------------
	      avo.assets.images.actor = new _utility.ImageAsset("assets/nonita-60/actor.png");
	      avo.assets.images.boxes = new _utility.ImageAsset("assets/nonita-60/boxes.png");
	      //--------------------------------

	      //Animations
	      //--------------------------------
	      var STEPS_PER_SECOND = AVO.FRAMES_PER_SECOND / 10;
	      avo.animationSets = {
	        actor: {
	          rule: AVO.ANIMATION_RULE_DIRECTIONAL,
	          tileWidth: 64,
	          tileHeight: 64,
	          tileOffsetX: 0,
	          tileOffsetY: -16,
	          actions: {
	            idle: {
	              loop: true,
	              steps: [{ row: 0, duration: 1 }]
	            },
	            moving: {
	              loop: true,
	              steps: [{ row: 1, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }, { row: 3, duration: STEPS_PER_SECOND }, { row: 4, duration: STEPS_PER_SECOND }, { row: 5, duration: STEPS_PER_SECOND }, { row: 4, duration: STEPS_PER_SECOND }, { row: 3, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }]
	            }
	          }
	        },

	        box: {
	          rule: AVO.ANIMATION_RULE_BASIC,
	          tileWidth: 32,
	          tileHeight: 64,
	          tileOffsetX: 0,
	          tileOffsetY: -16,
	          actions: {
	            idle: {
	              loop: true,
	              steps: [{ col: 1, row: 0, duration: 1 }]
	            }
	          }
	        }
	      };

	      //Process Animations; expand steps to many frames per steps.
	      for (var animationTitle in avo.animationSets) {
	        var animationSet = avo.animationSets[animationTitle];
	        for (var animationName in animationSet.actions) {
	          var animationAction = animationSet.actions[animationName];
	          var newSteps = [];
	          var _iteratorNormalCompletion = true;
	          var _didIteratorError = false;
	          var _iteratorError = undefined;

	          try {
	            for (var _iterator = animationAction.steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	              var step = _step.value;

	              for (var i = 0; i < step.duration; i++) {
	                newSteps.push(step);
	              }
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

	          animationAction.steps = newSteps;
	        }
	      }
	      //--------------------------------
	    }
	  }, {
	    key: "run_start",
	    value: function run_start() {
	      var avo = this.avo;

	      if (avo.pointer.state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.UP].state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.DOWN].state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.LEFT].state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.RIGHT].state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.SPACE].state === AVO.INPUT_ACTIVE || avo.keys[AVO.KEY_CODES.ENTER].state === AVO.INPUT_ACTIVE) {
	        avo.changeState(AVO.STATE_ACTION, this.enterRoom1);
	      }
	    }
	  }, {
	    key: "prepareRoom",
	    value: function prepareRoom() {
	      var avo = this.avo;

	      //Reset
	      var player = avo.refs[AVO.REF.PLAYER];
	      avo.actors = [];
	      avo.areasOfEffect = [];
	      avo.refs = {};

	      //Create the player character if she doesn't yet exist.
	      if (!player) {
	        avo.refs[AVO.REF.PLAYER] = new _entities.Actor(AVO.REF.PLAYER, avo.canvasWidth / 2, avo.canvasHeight / 2, 32, AVO.SHAPE_CIRCLE);
	        avo.refs[AVO.REF.PLAYER].spritesheet = avo.assets.images.actor;
	        avo.refs[AVO.REF.PLAYER].animationSet = avo.animationSets.actor;
	        avo.refs[AVO.REF.PLAYER].attributes[AVO.ATTR.SPEED] = 4;
	        avo.refs[AVO.REF.PLAYER].rotation = AVO.ROTATION_NORTH;
	        avo.actors.push(avo.refs[AVO.REF.PLAYER]);
	      } else {
	        avo.refs[AVO.REF.PLAYER] = player;
	        avo.actors.push(avo.refs[AVO.REF.PLAYER]);
	      }
	    }
	  }, {
	    key: "enterRoom1",
	    value: function enterRoom1() {
	      var avo = this.avo;
	      this.prepareRoom();

	      var newActor = void 0;
	      newActor = new _entities.Actor("box", avo.canvasWidth * 0.25, avo.canvasHeight * 0.5, 32, AVO.SHAPE_SQUARE);
	      newActor.spritesheet = avo.assets.images.boxes;
	      newActor.animationSet = avo.animationSets.box;
	      newActor.rotation = AVO.ROTATION_NORTH;
	      newActor.playAnimation("idle");
	      avo.actors.push(newActor);
	    }
	  }]);

	  return Nonita60;
	}(_story.Story);

/***/ }
/******/ ]);