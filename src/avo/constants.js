/*
Constant Values
===============

(Shaun A. Noordin || shaunanoordin.com || 20160901)
********************************************************************************
 */
export const FRAMES_PER_SECOND = 50;
export const INPUT_IDLE = 0;
export const INPUT_ACTIVE = 1;
export const INPUT_ENDED = 2;
export const INPUT_DISTANCE_SENSITIVITY = 16;
export const MAX_KEYS = 128;

export const STATE_START = 0;  //AvO App states
export const STATE_ACTION = 1;
export const STATE_COMIC = 2;
export const STATE_END = 3;

export const ACTOR_IDLE = 0;  //Actor states
export const ACTOR_MOVING = 1;
export const ACTOR_ACTING = 2;
export const ACTOR_REACTING = 3;

export const REF = {  //Standard References
  PLAYER: "player",
};

export const ACTION = {  //Standard Actions
  IDLE: "idle",
  MOVING: "moving",
  PRIMARY: "primary",
};

export const ATTR = {  //Standard Attributes
  SPEED: "speed",
};

export const ANIMATION_RULE_BASIC = "basic";
export const ANIMATION_RULE_DIRECTIONAL = "directional";  

export const SHAPE_NONE = 0;  //No shape = no collision
export const SHAPE_SQUARE = 1;
export const SHAPE_CIRCLE = 2;

export const ROTATION_EAST = 0;
export const ROTATION_SOUTH = Math.PI * 0.5;
export const ROTATION_WEST = Math.PI;
export const ROTATION_NORTH = Math.PI * -0.5;

export const ROTATION_SOUTHEAST = Math.PI * 0.25;
export const ROTATION_SOUTHWEST = Math.PI * 0.75;
export const ROTATION_NORTHWEST = Math.PI * -0.75;
export const ROTATION_NORTHEAST = Math.PI * -0.25;

export const DIRECTION_EAST = 0;
export const DIRECTION_SOUTH = 1;
export const DIRECTION_WEST = 2;
export const DIRECTION_NORTH = 3;

export const DURATION_INFINITE = 0;

export const COMIC_STRIP_STATE_TRANSITIONING = 0;
export const COMIC_STRIP_STATE_WAIT_BEFORE_INPUT = 1;
export const COMIC_STRIP_STATE_IDLE = 2;

export const DEFAULT_FONT = "32px monospace";
export const DEFAULT_COMIC_STRIP_WAIT_TIME_BEFORE_INPUT = 10;
export const DEFAULT_COMIC_STRIP_TRANSITION_TIME = 20;

export const STACKING_RULE_ADD = 0;
export const STACKING_RULE_REPLACE = 1;

export const KEY_CODES = {
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

export const KEY_VALUES = {
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
