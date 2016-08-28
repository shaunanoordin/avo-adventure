"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    this.context2d = this.canvas.getContext("2d");
    this.boundingBox = undefined; //To be defined by this.updateSize().
    this.sizeRatioX = 1;
    this.sizeRatioY = 1;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    //--------------------------------

    //Initialise Game Objects
    //--------------------------------
    this.assets = {
      images: {
        actor: new ImageAsset("assets/actor.png")
      }
    };
    this.actors = [];
    this.areasOfEffect = [];
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

    //TEST: ANIMATIONS
    //--------------------------------
    var STEPS_PER_SECOND = FRAMES_PER_SECOND / 10;
    this.animationSets = {
      "actor": {
        "tileWidth": 64,
        "tileHeight": 64,
        "tileOffsetX": 0,
        "tileOffsetY": -16,
        "actions": {
          "idle": {
            "loop": true,
            "steps": [{ row: 0, duration: STEPS_PER_SECOND }]
          },
          "walk": {
            "tileWidth": 64,
            "tileHeight": 64,
            "tileOffsetX": 0,
            "tileOffsetY": 0,
            "loop": true,
            "steps": [{ row: 1, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }, { row: 3, duration: STEPS_PER_SECOND }, { row: 2, duration: STEPS_PER_SECOND }]
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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = animationAction.steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var step = _step.value;

            for (var _i = 0; _i < step.duration; _i++) {
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

    //TEST: In-Game Objects
    //--------------------------------
    this.player = new Actor("player", this.width / 2, this.height / 2, 32, SHAPE_CIRCLE, true);
    this.player.spritesheet = new ImageAsset("assets/actor.png");
    this.player.animationStep = 0;
    this.player.animationSet = this.animationSets["actor"];
    this.actors.push(this.player);
    //TODO

    this.actors.push(new Actor("s1", Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_SQUARE));
    this.actors.push(new Actor("s2", Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_SQUARE));
    this.actors.push(new Actor("c1", Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));
    this.actors.push(new Actor("c2", Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), 32 + Math.random() * 64, SHAPE_CIRCLE));

    this.actors[0].canBeMoved = true;
    this.actors[1].canBeMoved = true;
    this.actors[2].canBeMoved = true;
    this.actors[3].canBeMoved = true;
    this.actors[4].canBeMoved = true;

    this.areasOfEffect.push(new AoE("aoe1", this.width / 2, this.height / 2 + 64, 64, SHAPE_SQUARE, DURATION_INFINITE, [new Effect("push", { x: 0, y: 4 }, 1, STACKING_RULE_ADD, null)], null));
    //--------------------------------

    //Start!
    //--------------------------------
    this.runCycle = setInterval(this.run, 1000 / FRAMES_PER_SECOND);
    //--------------------------------
  }

  //----------------------------------------------------------------

  _createClass(App, [{
    key: "run",
    value: function run() {
      //TEST: Input & Actions
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
          this.player.x += Math.cos(angle) * speed;
          this.player.y += Math.sin(angle) * speed;
          this.player.rotation = angle;
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
        this.player.y -= PLAYER_SPEED;
        this.player.direction = DIRECTION_NORTH;
        playerIsIdle = false;
      } else if (this.keys[KEY_CODES.UP].state !== INPUT_ACTIVE && this.keys[KEY_CODES.DOWN].state === INPUT_ACTIVE) {
        this.player.y += PLAYER_SPEED;
        this.player.direction = DIRECTION_SOUTH;
        playerIsIdle = false;
      }
      if (this.keys[KEY_CODES.LEFT].state === INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state !== INPUT_ACTIVE) {
        this.player.x -= PLAYER_SPEED;
        this.player.direction = DIRECTION_WEST;
        playerIsIdle = false;
      } else if (this.keys[KEY_CODES.LEFT].state !== INPUT_ACTIVE && this.keys[KEY_CODES.RIGHT].state === INPUT_ACTIVE) {
        this.player.x += PLAYER_SPEED;
        this.player.direction = DIRECTION_EAST;
        playerIsIdle = false;
      }

      if (this.keys[KEY_CODES.A].state === INPUT_ACTIVE && this.keys[KEY_CODES.D].state !== INPUT_ACTIVE) {
        this.player.rotation -= Math.PI / 36;
        playerIsIdle = false;
      } else if (this.keys[KEY_CODES.A].state !== INPUT_ACTIVE && this.keys[KEY_CODES.D].state === INPUT_ACTIVE) {
        this.player.rotation += Math.PI / 36;
        playerIsIdle = false;
      }

      if (this.keys[KEY_CODES.W].state === INPUT_ACTIVE) {
        this.player.x += Math.cos(this.player.rotation) * PLAYER_SPEED;
        this.player.y += Math.sin(this.player.rotation) * PLAYER_SPEED;
        playerIsIdle = false;
      } else if (this.keys[KEY_CODES.S].state === INPUT_ACTIVE) {
        this.player.x -= Math.cos(this.player.rotation) * PLAYER_SPEED;
        this.player.y -= Math.sin(this.player.rotation) * PLAYER_SPEED;
        playerIsIdle = false;
      }

      if (this.keys[KEY_CODES.Z].duration === 1) {
        this.player.shape = this.player.shape === SHAPE_CIRCLE ? SHAPE_SQUARE : SHAPE_CIRCLE;
      }

      if (this.keys[KEY_CODES.SPACE].duration === 1) {
        var PUSH_POWER = 12;
        var AOE_SIZE = this.player.size;
        var distance = this.player.radius + AOE_SIZE / 2;
        var x = this.player.x + Math.cos(this.player.rotation) * distance;
        var y = this.player.y + Math.sin(this.player.rotation) * distance;;
        var newAoE = new AoE("", x, y, AOE_SIZE, SHAPE_CIRCLE, 5, [new Effect("push", { x: Math.cos(this.player.rotation) * PUSH_POWER, y: Math.sin(this.player.rotation) * PUSH_POWER }, 2, STACKING_RULE_ADD, this.player)], this.player);
        this.areasOfEffect.push(newAoE);
      }

      //Try animation!
      if (playerIsIdle) {
        this.player.playAnimation("idle");
      } else {
        this.player.playAnimation("walk");
      }

      //--------------------------------

      //AoEs apply Effects
      //--------------------------------
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.areasOfEffect[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _aoe = _step2.value;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this.actors[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var actor = _step5.value;

              if (this.checkCollision(_aoe, actor)) {
                var _actor$effects;

                (_actor$effects = actor.effects).push.apply(_actor$effects, _toConsumableArray(_aoe.effects)); //Array.push can push multiple elements.
              }
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
        //--------------------------------

        //Actors react to Effects
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.actors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _actor = _step3.value;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = _actor.effects[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var effect = _step6.value;

              if (effect.name === "push") {
                _actor.x += effect.data.x || 0;
                _actor.y += effect.data.y || 0;
              }
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

      this.physics();
      //--------------------------------

      //Visuals
      //--------------------------------
      //Arrange sprites by vertical order.
      this.actors.sort(function (a, b) {
        return a.y < b.y;
      });

      this.paint();
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
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.actors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _actor2 = _step4.value;

          for (var _i3 = _actor2.effects.length - 1; _i3 >= 0; _i3--) {
            if (!_actor2.effects[_i3].hasInfiniteDuration()) {
              _actor2.effects[_i3].duration--;
              if (_actor2.effects[_i3].duration <= 0) {
                _actor2.effects.splice(_i3, 1);
              }
            }
          }
        }
        //--------------------------------

        //Cleanup Input
        //--------------------------------
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

      if (this.pointer.state === INPUT_ENDED) {
        this.pointer.duration = 0;
        this.pointer.state = INPUT_IDLE;
      }
      for (var _i2 = 0; _i2 < this.keys.length; _i2++) {
        if (this.keys[_i2].state === INPUT_ACTIVE) {
          this.keys[_i2].duration++;
        } else if (this.keys[_i2].state === INPUT_ENDED) {
          this.keys[_i2].duration = 0;
          this.keys[_i2].state = INPUT_IDLE;
        }
      }
      //--------------------------------
    }

    //----------------------------------------------------------------

  }, {
    key: "physics",
    value: function physics() {
      for (var a = 0; a < this.actors.length; a++) {
        var actorA = this.actors[a];
        for (var b = a + 1; b < this.actors.length; b++) {
          var actorB = this.actors[b];
          if (this.checkCollision(actorA, actorB)) {
            this.correctCollision(actorA, actorB);
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
        var minimumDist = actorA.radius + actorB.radius;
        if (distX * distX + distY * distY < minimumDist * minimumDist) {
          return true;
        }
      } else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_SQUARE) {
        if (actorA.left < actorB.right && actorA.right > actorB.left && actorA.top < actorB.bottom && actorA.bottom > actorB.top) {
          return true;
        }
      } else if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_SQUARE) {
        var _distX = actorA.x - Math.max(actorB.left, Math.min(actorB.right, actorA.x));
        var _distY = actorA.y - Math.max(actorB.top, Math.min(actorB.bottom, actorA.y));
        if (_distX * _distX + _distY * _distY < actorA.radius * actorA.radius) {
          return true;
        }
      } else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_CIRCLE) {
        var _distX2 = actorB.x - Math.max(actorA.left, Math.min(actorA.right, actorB.x));
        var _distY2 = actorB.y - Math.max(actorA.top, Math.min(actorA.bottom, actorB.y));
        if (_distX2 * _distX2 + _distY2 * _distY2 < actorB.radius * actorB.radius) {
          return true;
        }
      }

      return false;
    }
  }, {
    key: "correctCollision",
    value: function correctCollision(actorA, actorB) {
      if (!actorA || !actorB || !actorA.solid || !actorB.solid) return;

      var fractionA = 0;
      var fractionB = 0;
      if (actorA.canBeMoved && actorB.canBeMoved) {
        fractionA = 0.5;
        fractionB = 0.5;
      } else if (actorA.canBeMoved) {
        fractionA = 1;
      } else if (actorB.canBeMoved) {
        fractionB = 1;
      }

      if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_CIRCLE) {
        var distX = actorB.x - actorA.x;
        var distY = actorB.y - actorA.y;
        var dist = Math.sqrt(distX * distX + distY * distY);
        var angle = Math.atan2(distY, distX);
        var correctDist = actorA.radius + actorB.radius;
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        actorA.x -= cosAngle * (correctDist - dist) * fractionA;
        actorA.y -= sinAngle * (correctDist - dist) * fractionA;
        actorB.x += cosAngle * (correctDist - dist) * fractionB;
        actorB.y += sinAngle * (correctDist - dist) * fractionB;
      } else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_SQUARE) {
        var _distX3 = actorB.x - actorA.x;
        var _distY3 = actorB.y - actorA.y;
        var _correctDist = (actorA.size + actorB.size) / 2;
        if (Math.abs(_distX3) > Math.abs(_distY3)) {
          actorA.x -= Math.sign(_distX3) * (_correctDist - Math.abs(_distX3)) * fractionA;
          actorB.x += Math.sign(_distX3) * (_correctDist - Math.abs(_distX3)) * fractionB;
        } else {
          actorA.y -= Math.sign(_distY3) * (_correctDist - Math.abs(_distY3)) * fractionA;
          actorB.y += Math.sign(_distY3) * (_correctDist - Math.abs(_distY3)) * fractionB;
        }
      } else if (actorA.shape === SHAPE_CIRCLE && actorB.shape === SHAPE_SQUARE) {
        var _distX4 = actorA.x - Math.max(actorB.left, Math.min(actorB.right, actorA.x));
        var _distY4 = actorA.y - Math.max(actorB.top, Math.min(actorB.bottom, actorA.y));
        var _dist = Math.sqrt(_distX4 * _distX4 + _distY4 * _distY4);
        var _angle = Math.atan2(_distY4, _distX4);
        var _correctDist2 = actorA.radius;
        var _cosAngle = Math.cos(_angle);
        var _sinAngle = Math.sin(_angle);
        actorA.x += _cosAngle * (_correctDist2 - _dist) * fractionA;
        actorA.y += _sinAngle * (_correctDist2 - _dist) * fractionA;
        actorB.x -= _cosAngle * (_correctDist2 - _dist) * fractionB;
        actorB.y -= _sinAngle * (_correctDist2 - _dist) * fractionB;
      } else if (actorA.shape === SHAPE_SQUARE && actorB.shape === SHAPE_CIRCLE) {
        var _distX5 = actorB.x - Math.max(actorA.left, Math.min(actorA.right, actorB.x));
        var _distY5 = actorB.y - Math.max(actorA.top, Math.min(actorA.bottom, actorB.y));
        var _dist2 = Math.sqrt(_distX5 * _distX5 + _distY5 * _distY5);
        var _angle2 = Math.atan2(_distY5, _distX5);
        var _correctDist3 = actorB.radius;
        var _cosAngle2 = Math.cos(_angle2);
        var _sinAngle2 = Math.sin(_angle2);
        actorA.x -= _cosAngle2 * (_correctDist3 - _dist2) * fractionA;
        actorA.y -= _sinAngle2 * (_correctDist3 - _dist2) * fractionA;
        actorB.x += _cosAngle2 * (_correctDist3 - _dist2) * fractionB;
        actorB.y += _sinAngle2 * (_correctDist3 - _dist2) * fractionB;
      }
    }

    //----------------------------------------------------------------

  }, {
    key: "paint",
    value: function paint() {
      //Clear
      this.context2d.clearRect(0, 0, this.width, this.height);

      //Pain Areas of Effects
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
              this.context2d.beginPath();
              this.context2d.moveTo(aoe.x, aoe.y);
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

        //Paint Actor hitboxes
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

        //Paint sprites
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

      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.actors[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _actor3 = _step9.value;

          if (!_actor3.spritesheet || !_actor3.spritesheet.loaded || !_actor3.animationSet || !_actor3.animationSet.actions[_actor3.animationName]) continue;

          //TEST
          var animationSet = _actor3.animationSet;
          var srcW = animationSet.tileWidth;
          var srcH = animationSet.tileHeight;
          var srcX = srcW * _actor3.direction;
          var srcY = animationSet.actions[_actor3.animationName].steps[_actor3.animationStep].row * srcH;
          var tgtX = Math.floor(_actor3.x - srcW / 2 + animationSet.tileOffsetX);
          var tgtY = Math.floor(_actor3.y - srcH / 2 + animationSet.tileOffsetY);
          var tgtW = srcW;
          var tgtH = srcH;

          this.context2d.drawImage(_actor3.spritesheet.img, srcX, srcY, srcW, srcH, tgtX, tgtY, tgtW, tgtH);
        }
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

    this.effects = [];
  }

  _createClass(Actor, [{
    key: "playAnimation",
    value: function playAnimation() {
      var animationName = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
      var restart = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (!this.animationSet || !this.animationSet.actions[animationName]) return;

      //let animationSet = this.animationSet[animationName];
      var animationAction = this.animationSet.actions[animationName];

      if (restart || this.animationName !== animationName) {
        //Set this as the new animation
        this.animationStep = 0;
        this.animationName = animationName;
      } else {
        //Take a step through the current animation
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
    var id = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var x = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var y = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var size = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
    var shape = arguments.length <= 4 || arguments[4] === undefined ? SHAPE_CIRCLE : arguments[4];
    var duration = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
    var effects = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];
    var source = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];

    _classCallCheck(this, AoE);

    this.id = id;
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

/*  Effect Class
 */
//==============================================================================

var Effect = function () {
  function Effect() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var duration = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
    var stackingRule = arguments.length <= 3 || arguments[3] === undefined ? STACKING_RULE_ADD : arguments[3];
    var source = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];

    _classCallCheck(this, Effect);

    this.name = name;
    this.data = data;
    this.duration = duration;
    this.stackingRule = stackingRule;
    this.startDuration = duration;
    this.source = source;
  }

  _createClass(Effect, [{
    key: "hasInfiniteDuration",
    value: function hasInfiniteDuration() {
      return this.startDuration === DURATION_INFINITE;
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
  window.app = new App();
};
//==============================================================================