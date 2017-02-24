/*  
Artificial Intelligence
=======================

(Shaun A. Noordin || shaunanoordin.com || 20170224)
********************************************************************************
 */


export const ArtInt = {
  /*  A* path-finding: Given a grid, finds a path from start to goal.
      Returns an array. Array will be empty if no path could be found.
      Input example:
        start: { x:1,y:0 }
        goal: { x:1,y:2 }
        grid: [[0,0,0],  //0 indicates floor, 1 indicates wall.
               [0,1,0],
               [0,0,0],]
      Output example:
        [{x:1,y:0},{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2},]
      Optional 'spiceUpPathing' flag gives slightly different routes every time.
   */
  findPath: function (start, goal, grid, spiceUpPathing = false) {
    //First, let's set up our playing field.
    //----------------------------------------------------------------
    const MIN_X = 0;
    const MIN_Y = 0;
    const MAX_X = Math.max((grid.length > 0) ? grid[0].length - 1 : 0, 0);
    const MAX_Y = Math.max(grid.length - 1, 0);
    let startCell = null;  //start and goal are just x-y coordinates.
    let goalCell = null;   //startCell and goalCell are pointers to the actual locations on the calculated grid; this helpful for calculations.
    
    //The calculated grid is the grid, but with more variables to keep track of
    //the A* pathfinding calculations.
    const calcGrid = grid.map((row, y) => {
      return row.map((col, x) => {
        const cell = {
          x: x, y: y, val: col,
          from: null,  //Which cell (starting from startCell) did we come from, to reach this cell?
          cost: Infinity,  //What is the cost for reaching this cell, starting from startCell?
        };
        if (x === start.x && y === start.y) startCell = cell;
        return cell;
      });
    });
    //----------------------------------------------------------------
    
    //Pathfinding!
    //----------------------------------------------------------------
    let frontier = new ScoredQueue();  //The frontier determines where on the grid still needs to be explored.
    startCell.cost = 0;
    frontier.put(startCell, 0);
    
    //The ScoredQueue ensures that when we call frontier.get(), we'll always
    //pull the cell with the lowest score/cost. The lowest scored/costed cell
    //is the one that's most likely to be the "best" way to reach the goal.
    
    while (!frontier.isEmpty()) {  //If the frontier is ever empty, we've run out of places to look.
      let current = frontier.get();  //Get the lowest scored/costed cell and remove it from the queue.
      if (!current) break;  //Safety check
      
      if (current.x === goal.x && current.y === goal.y) {  //Target found!
        goalCell = current;
        break;  //OK we can stop now.
      }
      
      //Get neighbours.
      let neighbours = [];
      if (current.x - 1 >= MIN_X) neighbours.push(calcGrid[current.y][current.x - 1]);
      if (current.x + 1 <= MAX_X) neighbours.push(calcGrid[current.y][current.x + 1]);
      if (current.y - 1 >= MIN_Y) neighbours.push(calcGrid[current.y - 1][current.x]);
      if (current.y + 1 <= MAX_Y) neighbours.push(calcGrid[current.y + 1][current.x]);
      
      //Select only valid neighbours (floors, not walls)
      neighbours = neighbours.filter((n) => { return n.val === 0; });
      
      //The order of neighbours affects which directions the pathfinding
      //prefers. For example, if the goal is directly SouthEast of the start,
      //the path might favour going aaalll the way East then aaalll the way
      //South.
      
      //The spiceUpPathing option makes the pathfinding preference a little less predictable.
      if (spiceUpPathing) neighbours = this.shuffleArray(neighbours, neighbours.length);
      
      for (let next of neighbours) {
        const DEFAULT_COST = 1;
        const newCost = current.cost + DEFAULT_COST;
        
        if (newCost < next.cost) {
          next.cost = newCost;
          const priority = newCost + this.heuristics(next, goal);
          next.from = current;
          frontier.put(next, priority);
        }
      }
    }
    //----------------------------------------------------------------
    
    //If we have found the goalCell (i.e. the goal coordinates within the
    //calculated grid), we can trace a path back from the goalCell all the way
    //back to the startCell.
    //----------------------------------------------------------------
    let path = [];
    let curPath = goalCell;
    while (curPath) {
      path.push({ x: curPath.x, y: curPath.y });
      curPath = curPath.from;
    };
    path = path.reverse();
    
    return path;
    //----------------------------------------------------------------
  },
  
  /*  Heuristics: used in A* path-finding to "guess" how close a cell is to the
      goal. The lower the returned number, the closer it is.
   */
  heuristics: function (cell, goal) {
    return Math.abs(cell.x - goal.x) + Math.abs(cell.y - goal.y);
  },
  
  /* Shuffles an array, n times.
   */
  shuffleArray: function (array, n) {
    if (!array || array.length <= 1) return array;
    let out = array.map(itm => {return itm});
    let cur = n;
    while (cur > 0) {
      const i = Math.floor(Math.random() * out.length);
      const j = Math.floor(Math.random() * out.length);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
      cur--;
    }
    return out;
  },
};

/*  ScoredQueue: a queue that's automatically ordered by each item's score.
    put() adds an item to the queue.
    get() removes the item with the lowest score from the queue, then returns it.
 */
class ScoredQueue {
  constructor() {
    this.elements = [];
  }
  
  isEmpty() {
    return this.elements.length === 0;
  }
  
  put(item, score) {
    let index = 0;
    for (; index < this.elements.length; index++) {
      if (score <= this.elements[index].score) break;
    }
    this.elements.splice(index, 0, { item, score });
    
    //Alternative version:
    //this.elements.push({ item, score });
    //this.elements.sort((a, b) => { return a.score - b.score; });
  }
  
  get() {
    return this.elements.shift().item;
  }
}
