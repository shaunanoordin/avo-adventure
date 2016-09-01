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
  function App(startScript) {
    _classCallCheck(this, App);

    //Initialise properties
    //--------------------------------
    this.debugMode = false;
    this.runCycle = undefined;
    this.html = document.getElementById("app");
    this.canvas = document.getElementById("canvas");
    this.context2d = this.canvas.getContext("2d");
    this.boundingBox = undefined; //To be defined by this.updateSize().
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
      runEnd: null
    };
    this.actors = [];
    this.areasOfEffect = [];
    this.refs = {};
    this.store = {};
    this.ui = {
      foregroundImage: null,
      backgroundImage: null
    };
    this.comicStrip = null;
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

    //Start!
    //--------------------------------
    this.changeState(STATE_START, startScript);
    this.runCycle = setInterval(this.run.bind(this), 1000 / FRAMES_PER_SECOND);
    //--------------------------------
  }

  //----------------------------------------------------------------

  _createClass(App, [{
    key: "changeState",
    value: function changeState(state) {
      var script = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.state = state;
      if (script && typeof script === "function") {
        script.apply(this);
      }
    }
  }, {
    key: "run",
    value: function run() {
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

      if (this.scripts.runStart) this.scripts.runStart.apply(this);
    }
  }, {
    key: "run_end",
    value: function run_end() {
      if (this.scripts.runEnd) this.scripts.runEnd.apply(this);
    }
  }, {
    key: "run_action",
    value: function run_action() {
      //Run Global Scripts
      //--------------------------------
      if (this.scripts.runAction) this.scripts.runAction.apply(this);
      //--------------------------------

      //AoEs apply Effects
      //--------------------------------
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.areasOfEffect[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _aoe = _step.value;
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = this.actors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var actor = _step4.value;

              if (this.isATouchingB(_aoe, actor)) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                  for (var _iterator5 = _aoe.effects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
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

        //Actors react to Effects
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
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = _actor.effects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _effect = _step6.value;

              //TODO make this an external script
              //----------------
              if (_effect.name === "push" && _actor.canBeMoved) {
                _actor.x += _effect.data.x || 0;
                _actor.y += _effect.data.y || 0;
              }
              //----------------
            }
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

      //Visuals
      //--------------------------------
      //Arrange sprites by vertical order.
      this.actors.sort(function (a, b) {
        return a.bottom - b.bottom;
      });
      //this.paint();  //moved to run()
      //--------------------------------

      //Cleanup AoEs
      //--------------------------------
      for (var i = this.areasOfEffect.length - 1; i >= 0; i--) {
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

      if (this.pointer.state === INPUT_ENDED) {
        this.pointer.duration = 0;
        this.pointer.state = INPUT_IDLE;
      }
      for (var _i = 0; _i < this.keys.length; _i++) {
        if (this.keys[_i].state === INPUT_ACTIVE) {
          this.keys[_i].duration++;
        } else if (this.keys[_i].state === INPUT_ENDED) {
          this.keys[_i].duration = 0;
          this.keys[_i].state = INPUT_IDLE;
        }
      }
      //--------------------------------
    }
  }, {
    key: "run_comic",
    value: function run_comic() {
      if (this.scripts.runComic) this.scripts.runComic.apply(this);

      if (!this.comicStrip) return;
      var comic = this.comicStrip;

      if (comic.state !== COMIC_STRIP_STATE_TRANSITIONING && comic.currentPanel >= comic.panels.length) {
        comic.onFinish.apply(this);
      }

      switch (comic.state) {
        case COMIC_STRIP_STATE_TRANSITIONING:
          if (comic.counter < comic.transitionTime) {
            comic.counter++;
          } else {
            comic.counter = 0;
            comic.state = COMIC_STRIP_STATE_WAIT_BEFORE_INPUT;
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
          if (this.pointer.state === INPUT_ACTIVE || this.keys[KEY_CODES.UP].state === INPUT_ACTIVE || this.keys[KEY_CODES.SPACE].state === INPUT_ACTIVE || this.keys[KEY_CODES.ENTER].state === INPUT_ACTIVE) {
            comic.currentPanel++;
            comic.state = COMIC_STRIP_STATE_TRANSITIONING;
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
          if (this.isATouchingB(actorA, actorB)) {
            this.correctCollision(actorA, actorB);
          }
        }
      }
    }
  }, {
    key: "isATouchingB",
    value: function isATouchingB(objA, objB) {
      if (!objA || !objB) return false;

      if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_CIRCLE) {
        var distX = objA.x - objB.x;
        var distY = objA.y - objB.y;
        var minimumDist = objA.radius + objB.radius;
        if (distX * distX + distY * distY < minimumDist * minimumDist) {
          return true;
        }
      } else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_SQUARE) {
        if (objA.left < objB.right && objA.right > objB.left && objA.top < objB.bottom && objA.bottom > objB.top) {
          return true;
        }
      } else if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_SQUARE) {
        var _distX = objA.x - Math.max(objB.left, Math.min(objB.right, objA.x));
        var _distY = objA.y - Math.max(objB.top, Math.min(objB.bottom, objA.y));
        if (_distX * _distX + _distY * _distY < objA.radius * objA.radius) {
          return true;
        }
      } else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_CIRCLE) {
        var _distX2 = objB.x - Math.max(objA.left, Math.min(objA.right, objB.x));
        var _distY2 = objB.y - Math.max(objA.top, Math.min(objA.bottom, objB.y));
        if (_distX2 * _distX2 + _distY2 * _distY2 < objB.radius * objB.radius) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "correctCollision",
    value: function correctCollision(objA, objB) {
      if (!objA || !objB || !objA.solid || !objB.solid) return;

      var fractionA = 0;
      var fractionB = 0;
      if (objA.canBeMoved && objB.canBeMoved) {
        fractionA = 0.5;
        fractionB = 0.5;
      } else if (objA.canBeMoved) {
        fractionA = 1;
      } else if (objB.canBeMoved) {
        fractionB = 1;
      }

      if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_CIRCLE) {
        var distX = objB.x - objA.x;
        var distY = objB.y - objA.y;
        var dist = Math.sqrt(distX * distX + distY * distY);
        var angle = Math.atan2(distY, distX);
        var correctDist = objA.radius + objB.radius;
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        objA.x -= cosAngle * (correctDist - dist) * fractionA;
        objA.y -= sinAngle * (correctDist - dist) * fractionA;
        objB.x += cosAngle * (correctDist - dist) * fractionB;
        objB.y += sinAngle * (correctDist - dist) * fractionB;
      } else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_SQUARE) {
        var _distX3 = objB.x - objA.x;
        var _distY3 = objB.y - objA.y;
        var _correctDist = (objA.size + objB.size) / 2;
        if (Math.abs(_distX3) > Math.abs(_distY3)) {
          objA.x -= Math.sign(_distX3) * (_correctDist - Math.abs(_distX3)) * fractionA;
          objB.x += Math.sign(_distX3) * (_correctDist - Math.abs(_distX3)) * fractionB;
        } else {
          objA.y -= Math.sign(_distY3) * (_correctDist - Math.abs(_distY3)) * fractionA;
          objB.y += Math.sign(_distY3) * (_correctDist - Math.abs(_distY3)) * fractionB;
        }
      } else if (objA.shape === SHAPE_CIRCLE && objB.shape === SHAPE_SQUARE) {
        var _distX4 = objA.x - Math.max(objB.left, Math.min(objB.right, objA.x));
        var _distY4 = objA.y - Math.max(objB.top, Math.min(objB.bottom, objA.y));
        var _dist = Math.sqrt(_distX4 * _distX4 + _distY4 * _distY4);
        var _angle = Math.atan2(_distY4, _distX4);
        var _correctDist2 = objA.radius;
        var _cosAngle = Math.cos(_angle);
        var _sinAngle = Math.sin(_angle);
        objA.x += _cosAngle * (_correctDist2 - _dist) * fractionA;
        objA.y += _sinAngle * (_correctDist2 - _dist) * fractionA;
        objB.x -= _cosAngle * (_correctDist2 - _dist) * fractionB;
        objB.y -= _sinAngle * (_correctDist2 - _dist) * fractionB;
      } else if (objA.shape === SHAPE_SQUARE && objB.shape === SHAPE_CIRCLE) {
        var _distX5 = objB.x - Math.max(objA.left, Math.min(objA.right, objB.x));
        var _distY5 = objB.y - Math.max(objA.top, Math.min(objA.bottom, objB.y));
        var _dist2 = Math.sqrt(_distX5 * _distX5 + _distY5 * _distY5);
        var _angle2 = Math.atan2(_distY5, _distX5);
        var _correctDist3 = objB.radius;
        var _cosAngle2 = Math.cos(_angle2);
        var _sinAngle2 = Math.sin(_angle2);
        objA.x -= _cosAngle2 * (_correctDist3 - _dist2) * fractionA;
        objA.y -= _sinAngle2 * (_correctDist3 - _dist2) * fractionA;
        objB.x += _cosAngle2 * (_correctDist3 - _dist2) * fractionB;
        objB.y += _sinAngle2 * (_correctDist3 - _dist2) * fractionB;
      }
    }

    //----------------------------------------------------------------

  }, {
    key: "paint",
    value: function paint() {
      //Clear
      this.context2d.clearRect(0, 0, this.width, this.height);

      if (this.ui.backgroundImage && this.ui.backgroundImage.loaded) {
        var image = this.ui.backgroundImage;
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
        var _image = this.ui.foregroundImage;
        this.context2d.drawImage(_image.img, (this.width - _image.img.width) / 2, (this.height - _image.img.height) / 2);
      }
    }
  }, {
    key: "paint_start",
    value: function paint_start() {
      var percentage = this.assetsTotal > 0 ? this.assetsLoaded / this.assetsTotal : 1;

      this.context2d.font = DEFAULT_FONT;
      this.context2d.textAlign = "center";
      this.context2d.textBaseline = "middle";

      if (this.assetsLoaded < this.assetsTotal) {
        var rgb = Math.floor(percentage * 255);
        this.context2d.beginPath();
        this.context2d.rect(0, 0, this.width, this.height);
        this.context2d.fillStyle = "rgba(" + rgb + "," + rgb + "," + rgb + ",1)";
        this.context2d.fill();
        this.context2d.fillStyle = "#fff";
        this.context2d.fillText("Loading... (" + this.assetsLoaded + "/" + this.assetsTotal + ")", this.width / 2, this.height / 2);
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
  }, {
    key: "paint_end",
    value: function paint_end() {
      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.width, this.height);
      this.context2d.fillStyle = "#3cc";
      this.context2d.fill();
      this.context2d.closePath();
    }
  }, {
    key: "paint_action",
    value: function paint_action() {
      //DEBUG: Paint hitboxes
      //--------------------------------
      if (this.debugMode) {
        //Areas of Effects
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.areasOfEffect[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var aoe = _step7.value;

            var durationPercentage = 1;
            if (!aoe.hasInfiniteDuration() && aoe.startDuration > 0) {
              durationPercentage = Math.max(0, aoe.duration / aoe.startDuration);
            }
            this.context2d.strokeStyle = "rgba(204,51,51," + durationPercentage + ")";

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
      //AoEs
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.areasOfEffect[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _aoe2 = _step9.value;

          this.paintSprite(_aoe2);
          _aoe2.nextAnimationFrame();
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
    }
  }, {
    key: "paint_comic",
    value: function paint_comic() {
      if (!this.comicStrip) return;
      var comic = this.comicStrip;

      this.context2d.beginPath();
      this.context2d.rect(0, 0, this.width, this.height);
      this.context2d.fillStyle = comic.background;
      this.context2d.fill();
      this.context2d.closePath();

      switch (comic.state) {
        case COMIC_STRIP_STATE_TRANSITIONING:
          var offsetY = comic.transitionTime > 0 ? Math.floor(comic.counter / comic.transitionTime * -this.height) : 0;
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
  }, {
    key: "paintSprite",
    value: function paintSprite(obj) {
      if (!obj.spritesheet || !obj.spritesheet.loaded || !obj.animationSet || !obj.animationSet.actions[obj.animationName]) return;

      var animationSet = obj.animationSet;

      var srcW = animationSet.tileWidth;
      var srcH = animationSet.tileHeight;
      var srcX = 0;
      var srcY = 0;
      if (animationSet.rule === ANIMATION_RULE_DIRECTIONAL) {
        srcX = obj.direction * srcW;
        srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
      } else {
        srcX = animationSet.actions[obj.animationName].steps[obj.animationStep].col * srcW;
        srcY = animationSet.actions[obj.animationName].steps[obj.animationStep].row * srcH;
      }

      var tgtX = Math.floor(obj.x - srcW / 2 + animationSet.tileOffsetX);
      var tgtY = Math.floor(obj.y - srcH / 2 + animationSet.tileOffsetY);
      var tgtW = srcW;
      var tgtH = srcH;

      this.context2d.drawImage(obj.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
    }
  }, {
    key: "paintComicPanel",
    value: function paintComicPanel() {
      var panel = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var offsetY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (!panel || !panel.loaded) return;

      var ratioX = this.width / panel.img.width;
      var ratioY = this.height / panel.img.height;
      var ratio = Math.min(1, Math.min(ratioX, ratioY));

      var srcX = 0;
      var srcY = 0;
      var srcW = panel.img.width;
      var srcH = panel.img.height;

      var tgtW = panel.img.width * ratio;
      var tgtH = panel.img.height * ratio;
      var tgtX = (this.width - tgtW) / 2; //TODO
      var tgtY = (this.height - tgtH) / 2 + offsetY; //TODO

      this.context2d.drawImage(panel.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
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
var DEFAULT_FONT = "32px monospace";

var STATE_START = 0;
var STATE_ACTION = 1;
var STATE_COMIC = 2;
var STATE_END = 3;

var ANIMATION_RULE_BASIC = "basic";
var ANIMATION_RULE_DIRECTIONAL = "directional";
//==============================================================================

/*  Actor Class
 */
//==============================================================================

var Actor = function () {
  function Actor() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
    var shape = arguments.length <= 4 || arguments[4] === undefined ? SHAPE_NONE : arguments[4];

    _classCallCheck(this, Actor);

    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.shape = shape;
    this.solid = shape !== SHAPE_NONE;
    this.canBeMoved = true;
    this.rotation = ROTATION_SOUTH; //Rotation in radians; clockwise positive.

    this.spritesheet = null;
    this.animationStep = 0;
    this.animationSet = null;
    this.animationName = "";

    this.attributes = {};
    this.effects = [];
  }

  _createClass(Actor, [{
    key: "setAnimation",
    value: function setAnimation() {
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
        return DIRECTION_EAST;
      } else if (this._rotation > Math.PI * 0.25 && this._rotation < Math.PI * 0.75) {
        return DIRECTION_SOUTH;
      } else if (this._rotation < Math.PI * -0.25 && this._rotation > Math.PI * -0.75) {
        return DIRECTION_NORTH;
      } else {
        return DIRECTION_WEST;
      }
    },
    set: function set(val) {
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
  }]);

  return Actor;
}();

var SHAPE_NONE = 0; //No shape = no collision
var SHAPE_SQUARE = 1;
var SHAPE_CIRCLE = 2;

var ROTATION_EAST = 0;
var ROTATION_SOUTH = Math.PI / 2;
var ROTATION_WEST = Math.PI;
var ROTATION_NORTH = -Math.PI / 2;

var DIRECTION_EAST = 0;
var DIRECTION_SOUTH = 1;
var DIRECTION_WEST = 2;
var DIRECTION_NORTH = 3;
//==============================================================================

/*  Area of Effect Class
 */
//==============================================================================

var AoE = function () {
  function AoE() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
    var shape = arguments.length <= 4 || arguments[4] === undefined ? SHAPE_CIRCLE : arguments[4];
    var duration = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
    var effects = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];

    _classCallCheck(this, AoE);

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

  _createClass(AoE, [{
    key: "hasInfiniteDuration",
    value: function hasInfiniteDuration() {
      return this.startDuration === DURATION_INFINITE;
    }
  }, {
    key: "setAnimation",
    value: function setAnimation() {
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
  }]);

  return AoE;
}();

var DURATION_INFINITE = 0;
//==============================================================================

/*  4-Koma Comic Strip Class
 */
//==============================================================================

var ComicStrip = function () {
  function ComicStrip() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var panels = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var onFinish = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, ComicStrip);

    this.name = name;
    this.panels = panels;
    this.onFinish = onFinish;

    this.waitTime = DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT;
    this.transitionTime = DEFAULT_COMIC_STRIP_TRANSITION_TIME;
    this.background = "#333";

    this.start();
  }

  _createClass(ComicStrip, [{
    key: "start",
    value: function start() {
      this.currentPanel = 0;
      this.state = COMIC_STRIP_STATE_TRANSITIONING;
      this.counter = 0;
    }
  }, {
    key: "getCurrentPanel",
    value: function getCurrentPanel() {
      if (this.currentPanel < 0 || this.currentPanel >= this.panels.length) {
        return null;
      } else {
        return this.panels[this.currentPanel];
      }
    }
  }, {
    key: "getPreviousPanel",
    value: function getPreviousPanel() {
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

  }]);

  return ComicStrip;
}();

var COMIC_STRIP_STATE_TRANSITIONING = 0;
var COMIC_STRIP_STATE_WAIT_BEFORE_INPUT = 1;
var COMIC_STRIP_STATE_IDLE = 2;

var DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT = 10;
var DEFAULT_COMIC_STRIP_TRANSITION_TIME = 20;
//==============================================================================

/*  Effect Class
 */
//==============================================================================

var Effect = function () {
  function Effect() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var duration = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
    var stackingRule = arguments.length <= 3 || arguments[3] === undefined ? STACKING_RULE_ADD : arguments[3];

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
      return this.startDuration === DURATION_INFINITE;
    }
  }, {
    key: "copy",
    value: function copy() {
      return new Effect(this.name, this.data, this.duration, this.stackingRule);
    }
  }]);

  return Effect;
}();

var STACKING_RULE_ADD = 0;
var STACKING_RULE_REPLACE = 1;
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
  var STEPS_PER_SECOND = FRAMES_PER_SECOND / 10;
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
          steps: [{ row: 0, duration: 1 }]
        },
        walk: {
          loop: true,
          steps: [{ row: 1, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }, { row: 3, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }]
        }
      }
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
          steps: [{ col: 0, row: 0, duration: 1 }]
        },
        glow: {
          loop: true,
          steps: [{ col: 1, row: 0, duration: STEPS_PER_SECOND * 4 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 }]
        }
      }
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
          steps: [{ col: 0, row: 0, duration: 1 }]
        },
        glow: {
          loop: true,
          steps: [{ col: 1, row: 0, duration: STEPS_PER_SECOND * 4 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 1, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 4 }, { col: 1, row: 0, duration: STEPS_PER_SECOND * 4 }]
        }
      }
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
          steps: [{ col: 0, row: 0, duration: 1 }]
        }
      }
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
          steps: [{ col: 0, row: 0, duration: 1 }]
        },
        glow: {
          loop: true,
          steps: [{ col: 0, row: 0, duration: STEPS_PER_SECOND * 3 }, { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 }, { col: 1, row: 1, duration: STEPS_PER_SECOND * 3 }, { col: 0, row: 1, duration: STEPS_PER_SECOND * 3 }, { col: 1, row: 0, duration: STEPS_PER_SECOND * 3 }, { col: 0, row: 0, duration: STEPS_PER_SECOND * 3 }]
        }
      }
    }

  };

  //Process Animations; expand steps to many frames per steps.
  for (var animationTitle in this.animationSets) {
    var animationSet = this.animationSets[animationTitle];
    for (var animationName in animationSet.actions) {
      var animationAction = animationSet.actions[animationName];
      var newSteps = [];
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = animationAction.steps[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var step = _step11.value;

          for (var i = 0; i < step.duration; i++) {
            newSteps.push(step);
          }
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      animationAction.steps = newSteps;
    }
  }
  //--------------------------------
}

function runStart() {
  this.store.level = 1;

  if (this.pointer.state === INPUT_ACTIVE || this.keys[KEY_CODES.UP].state === INPUT_ACTIVE || this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE || this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE || this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE || this.keys[KEY_CODES.SPACE].state === INPUT_ACTIVE || this.keys[KEY_CODES.ENTER].state === INPUT_ACTIVE) {
    this.changeState(STATE_COMIC, comicStart);
  }
}

function comicStart() {
  this.comicStrip = new ComicStrip("startcomic", [this.assets.images.comicPanelA, this.assets.images.comicPanelB, this.assets.images.comicPanelC], comicStartFinished);
  this.comicStrip.start();

  this.comicStrip = new ComicStrip("startcomic", [this.assets.images.comicPanelA, this.assets.images.comicPanelSmall, this.assets.images.comicPanelBig, this.assets.images.comicPanelWide], comicStartFinished);
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
  var playerIsIdle = true;
  var PLAYER_SPEED = 4;
  if (this.pointer.state === INPUT_ACTIVE) {
    var distX = this.pointer.now.x - this.pointer.start.x;
    var distY = this.pointer.now.y - this.pointer.start.y;
    var dist = Math.sqrt(distX * distX + distY * distY);

    if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY) {
      var angle = Math.atan2(distY, distX);
      var speed = PLAYER_SPEED;
      this.refs["player"].x += Math.cos(angle) * speed;
      this.refs["player"].y += Math.sin(angle) * speed;
      this.refs["player"].rotation = angle;
      playerIsIdle = false;

      //UX improvement: reset the base point of the pointer so the player can
      //switch directions much more easily.
      if (dist >= INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2) {
        this.pointer.start.x = this.pointer.now.x - Math.cos(angle) * INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
        this.pointer.start.y = this.pointer.now.y - Math.sin(angle) * INPUT_DISTANCE_SENSITIVITY * this.sizeRatioY * 2;
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
    this.refs["player"].shape = this.refs["player"].shape === SHAPE_CIRCLE ? SHAPE_SQUARE : SHAPE_CIRCLE;
  }

  if (this.keys[KEY_CODES.SPACE].duration === 1) {
    var PUSH_POWER = 12;
    var AOE_SIZE = this.refs["player"].size;
    var distance = this.refs["player"].radius + AOE_SIZE / 2;
    var x = this.refs["player"].x + Math.cos(this.refs["player"].rotation) * distance;
    var y = this.refs["player"].y + Math.sin(this.refs["player"].rotation) * distance;;
    var newAoE = new AoE("", x, y, AOE_SIZE, SHAPE_CIRCLE, 5, [new Effect("push", { x: Math.cos(this.refs["player"].rotation) * PUSH_POWER, y: Math.sin(this.refs["player"].rotation) * PUSH_POWER }, 2, STACKING_RULE_ADD)]);
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
    var _iteratorNormalCompletion12 = true;
    var _didIteratorError12 = false;
    var _iteratorError12 = undefined;

    try {
      for (var _iterator12 = this.refs["boxes"][Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
        var box = _step12.value;

        if (box.effects.find(function (eff) {
          return eff.name === "charge";
        })) {
          box.setAnimation("glow");
        } else {
          box.setAnimation("idle");
        }
      }
    } catch (err) {
      _didIteratorError12 = true;
      _iteratorError12 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion12 && _iterator12.return) {
          _iterator12.return();
        }
      } finally {
        if (_didIteratorError12) {
          throw _iteratorError12;
        }
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

  var midX = this.width / 2,
      midY = this.height / 2;

  this.refs["player"] = new Actor("player", midX, midY + 256, 32, SHAPE_CIRCLE);
  this.refs["player"].spritesheet = this.assets.images.actor;
  this.refs["player"].animationSet = this.animationSets.actor;
  this.refs["player"].rotation = ROTATION_NORTH;
  this.actors.push(this.refs["player"]);

  var wallN = new Actor("wallN", midX, midY - 672, this.width, SHAPE_SQUARE);
  var wallS = new Actor("wallS", midX, midY + 688, this.width, SHAPE_SQUARE);
  var wallE = new Actor("wallE", midX + 688, midY, this.height, SHAPE_SQUARE);
  var wallW = new Actor("wallW", midX - 688, midY, this.height, SHAPE_SQUARE);
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

  var midX = this.width / 2,
      midY = this.height / 2;

  this.refs.boxes = [];
  this.refs.plates = [];
  var newBox = void 0,
      newPlate = void 0;
  var chargeEffect = new Effect("charge", {}, 4, STACKING_RULE_ADD, null);

  this.refs.boxes = [new Actor("", midX - 128, midY - 64, 64, SHAPE_SQUARE), new Actor("", midX + 128, midY - 64, 64, SHAPE_SQUARE)];
  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = this.refs.boxes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var box = _step13.value;

      box.attributes.box = true;
      box.spritesheet = this.assets.images.sarcophagus;
      box.animationSet = this.animationSets.sarcophagus;
      this.actors.push(box);
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }

  this.refs.plates = [new AoE("plate", midX - 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()]), new AoE("plate", midX + 128, midY + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [chargeEffect.copy()])];
  var _iteratorNormalCompletion14 = true;
  var _didIteratorError14 = false;
  var _iteratorError14 = undefined;

  try {
    for (var _iterator14 = this.refs.plates[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
      var plate = _step14.value;

      plate.spritesheet = this.assets.images.plate;
      plate.animationSet = this.animationSets.plate;
      plate.setAnimation("idle");
      this.areasOfEffect.push(plate);
    }
  } catch (err) {
    _didIteratorError14 = true;
    _iteratorError14 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion14 && _iterator14.return) {
        _iterator14.return();
      }
    } finally {
      if (_didIteratorError14) {
        throw _iteratorError14;
      }
    }
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
  var allBoxesAreCharged = true;

  if (this.refs["plates"] && this.refs["boxes"]) {
    var _iteratorNormalCompletion15 = true;
    var _didIteratorError15 = false;
    var _iteratorError15 = undefined;

    try {
      for (var _iterator15 = this.refs["plates"][Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
        var plate = _step15.value;

        var thisPlateIsCharged = false;
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = this.refs["boxes"][Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var box = _step16.value;

            if (this.isATouchingB(box, plate)) {
              thisPlateIsCharged = true;
              plate.setAnimation("glow");
            }
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16.return) {
              _iterator16.return();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        !thisPlateIsCharged && plate.setAnimation("idle");
        allBoxesAreCharged = allBoxesAreCharged && thisPlateIsCharged;
      }
    } catch (err) {
      _didIteratorError15 = true;
      _iteratorError15 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion15 && _iterator15.return) {
          _iterator15.return();
        }
      } finally {
        if (_didIteratorError15) {
          throw _iteratorError15;
        }
      }
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