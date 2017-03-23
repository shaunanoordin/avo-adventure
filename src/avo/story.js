/*  
AvO Adventure Story
===================

(Shaun A. Noordin || shaunanoordin.com || 20170322)
********************************************************************************
 */

export class Story {
  constructor() {
    this.avo = null;  //Reference to the AvO game engine, automatically set when
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
  
  init() {}
  
  run_start() {}
  run_end() {}
  run_action() {}
  run_comic() {}
  
  preRun() {}
  postRun() {}
  
  prePaint() {}
  postPaint() {}
}
