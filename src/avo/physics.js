/*
Physics Classes
===============

(Shaun A. Noordin || shaunanoordin.com || 20170209)
********************************************************************************
 */

import * as AVO from "./constants.js";  //Naming note: all caps.

const USE_CIRCLE_APPROXIMATION = false;

export const Physics = {
  //----------------------------------------------------------------
  
  /*  Checks if objA is touching objB.
      If true, returns the corrected coordinates for objA and objB, in form:
        { ax, ay, bx, by }
      If false, returns null.
   */
  checkCollision: function(objA, objB) {
    if (!objA || !objB || objA === objB) return null;
    
    if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_CIRCLE) {
      return this.checkCollision_circleCircle(objA, objB);
    }
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_SQUARE) {
      return this.checkCollision_polygonPolygon(objA, objB);
    }
    
    else if (objA.shape === AVO.SHAPE_CIRCLE && objB.shape === AVO.SHAPE_SQUARE) {
      if (USE_CIRCLE_APPROXIMATION) return this.checkCollision_polygonPolygon(objA, objB);
      
      return this.checkCollision_circlePolygon(objA, objB);
    }
    
    else if (objA.shape === AVO.SHAPE_SQUARE && objB.shape === AVO.SHAPE_CIRCLE) {
      if (USE_CIRCLE_APPROXIMATION) return this.checkCollision_polygonPolygon(objA, objB);
      
      let correction = this.checkCollision_circlePolygon(objB, objA);
      if (correction) {
        correction = {
          ax: correction.bx,
          ay: correction.by,
          bx: correction.ax,
          by: correction.ay,
        };
      }
      return correction;
    }
    
    return null;
  },
  
  //----------------------------------------------------------------
  
  checkCollision_circleCircle: function (objA, objB) {
    let fractionA = 0;
    let fractionB = 0;
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
    
    const distX = objB.x - objA.x;
    const distY = objB.y - objA.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    const minimumDist = objA.radius + objB.radius;
    if (dist < minimumDist) {    
      const angle = Math.atan2(distY, distX);
      const correctDist = minimumDist;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);

      return {
        ax: objA.x - cosAngle * (correctDist - dist) * fractionA,
        ay: objA.y - sinAngle * (correctDist - dist) * fractionA,
        bx: objB.x + cosAngle * (correctDist - dist) * fractionB,
        by: objB.y + sinAngle * (correctDist - dist) * fractionB,
      };
    }
    
    return null;
  },
  
  //----------------------------------------------------------------
  
  checkCollision_polygonPolygon: function (objA, objB) {
    let fractionA = 0;
    let fractionB = 0;
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
    
    let correction = null;
    const verticesA = objA.vertices;
    const verticesB = objB.vertices;
    const projectionAxes = [...this.getShapeNormals(objA), ...this.getShapeNormals(objB)];
    for (let i = 0; i < projectionAxes.length; i++) {
      const axis = projectionAxes[i];
      const projectionA = { min: Infinity, max: -Infinity };
      const projectionB = { min: Infinity, max: -Infinity };

      for (let j = 0; j < verticesA.length; j++) {
        const val = this.dotProduct(axis, verticesA[j]);
        projectionA.min = Math.min(projectionA.min, val);
        projectionA.max = Math.max(projectionA.max, val);
      }
      for (let j = 0; j < verticesB.length; j++) {
        const val = this.dotProduct(axis, verticesB[j]);
        projectionB.min = Math.min(projectionB.min, val);
        projectionB.max = Math.max(projectionB.max, val);
      }

      const overlap = Math.max(0, Math.min(projectionA.max, projectionB.max) - Math.max(projectionA.min, projectionB.min));
      if (!correction || overlap < correction.magnitude) {
        const sign = Math.sign((projectionB.min + projectionB.max) - (projectionA.min + projectionA.max));
        correction = {
          magnitude: overlap,
          x: axis.x * overlap * sign,
          y: axis.y * overlap * sign,
        };
      }
    }

    if (correction && correction.magnitude > 0) {
      return {
        ax: objA.x - correction.x * fractionA,
        ay: objA.y - correction.y * fractionA,
        bx: objB.x + correction.x * fractionB,
        by: objB.y + correction.y * fractionB,
      };
    }
    
    return null;
  },
  
  //----------------------------------------------------------------
  
  checkCollision_circlePolygon: function(objA, objB) {
    let fractionA = 0;
    let fractionB = 0;
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
    
    const distX = objB.x - objA.x;
    const distY = objB.y - objA.y;
    const dist = Math.sqrt(distX * distX + distY * distY);
    const angle = Math.atan2(distY, distX);
    const centreToCentreAxis = (dist !== 0)
      ? { x: distX / dist, y: distY / dist }
      : { x: 0, y: 0 };

    let correction = null;
    const verticesB = objB.vertices;
    const projectionAxes = [centreToCentreAxis, ...this.getShapeNormals(objB)];
    for (let i = 0; i < projectionAxes.length; i++) {
      const axis = projectionAxes[i];
      const scalarA = this.dotProduct(axis, { x: objA.x, y: objA.y });
      const projectionA = { min: scalarA - objA.radius, max: scalarA + objA.radius };
      const projectionB = { min: Infinity, max: -Infinity };
      
      for (let j = 0; j < verticesB.length; j++) {
        const val = this.dotProduct(axis, verticesB[j]);
        projectionB.min = Math.min(projectionB.min, val);
        projectionB.max = Math.max(projectionB.max, val);
      }

      const overlap = Math.max(0, Math.min(projectionA.max, projectionB.max) - Math.max(projectionA.min, projectionB.min));
      if (!correction || overlap < correction.magnitude) {
        const sign = Math.sign((projectionB.min + projectionB.max) - (projectionA.min + projectionA.max));
        correction = {
          magnitude: overlap,
          x: axis.x * overlap * sign,
          y: axis.y * overlap * sign,
        };
      }
    }

    if (correction && correction.magnitude > 0) {
      return {
        ax: objA.x - correction.x * fractionA,
        ay: objA.y - correction.y * fractionA,
        bx: objB.x + correction.x * fractionB,
        by: objB.y + correction.y * fractionB,
      };
    }
  },
  
  //----------------------------------------------------------------
  
  /*  Gets the NORMALISED normals for each edge of the object's shape. Assumes the object has the 'vertices' property.
   */
  getShapeNormals: function (obj) {
    const vertices = obj.vertices;
    if (!vertices) return null;
    if (vertices.length < 2) return [];  //Look you need to have at least three vertices to be a shape.
    
    //First, calculate the edges connecting each vertice.
    //--------------------------------
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i+1) % vertices.length];
      edges.push({
        x: p2.x - p1.x,
        y: p2.y - p1.y,
      });
    }
    //--------------------------------
    
    //Calculate the NORMALISED normals for each edge.
    //--------------------------------
    return edges.map((edge) => {
      const dist = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
      if (dist === 0) return { x: 0, y: 0 };
      return {
        x: -edge.y / dist,
        y: edge.x / dist,
      };
    });
    //--------------------------------
  },
  
  //----------------------------------------------------------------
  
  dotProduct: function (vectorA, vectorB) {
    if (!vectorA || !vectorB) return null;
    return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
  },
};
