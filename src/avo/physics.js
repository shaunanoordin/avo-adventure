/*
Experimental Physics Class
===============

(Shaun A. Noordin || shaunanoordin.com || 20160901)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.

/*  Checks collision based on Separating Axis Theorem.
    Non-convex object shapes only, please.
    Return false if objA and objB don't touch.
    Returns corrected coordinates { a.x, a.y, b.x, b.y } otherwise.
 */
export function checkCollision(objA, objB) {
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
