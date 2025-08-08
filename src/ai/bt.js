// Minimal Behavior Tree scaffold
export const SUCCESS = 'success';
export const FAILURE = 'failure';
export const RUNNING = 'running';

export class Blackboard {
  constructor(data = {}) { Object.assign(this, data); }
}

export class Node {
  tick(bb) { throw new Error('implement in subclass'); }
}

export class Selector extends Node {
  constructor(children=[]) { super(); this.children = children; }
  tick(bb) {
    for (const c of this.children) {
      const r = c.tick(bb);
      if (r === SUCCESS || r === RUNNING) return r;
    }
    return FAILURE;
  }
}

export class Sequence extends Node {
  constructor(children=[]) { super(); this.children = children; }
  tick(bb) {
    for (const c of this.children) {
      const r = c.tick(bb);
      if (r === FAILURE || r === RUNNING) return r;
    }
    return SUCCESS;
  }
}

export class Condition extends Node {
  constructor(fn) { super(); this.fn = fn; }
  tick(bb) { return this.fn(bb) ? SUCCESS : FAILURE; }
}

export class Action extends Node {
  constructor(fn) { super(); this.fn = fn; }
  tick(bb) { return this.fn(bb); }
}

export const Tasks = {
  moveToward: new Action(bb => {
    // Move toward target if not adjacent
    const { self, target } = bb;
    if (!self || !target) return FAILURE;
    const dx = target.x - self.x;
    const dy = target.y - self.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) return FAILURE; // already adjacent
    if (Math.abs(dx) > Math.abs(dy)) self.x += Math.sign(dx);
    else if (dy !== 0) self.y += Math.sign(dy);
    return SUCCESS;
  }),
  attackIfAdjacent: new Action(bb => {
    const { self, target } = bb;
    if (!self || !target) return FAILURE;
    const dx = Math.abs(self.x - target.x);
    const dy = Math.abs(self.y - target.y);
    if (dx + dy === 1) {
      target.takeDamage(self.attack);
      return SUCCESS;
    }
    return FAILURE;
  }),
  chooseLowestHealthTarget: new Action(bb => {
    const { self, enemies } = bb;
    if (!enemies || !enemies.length) return FAILURE;
    bb.target = enemies.filter(e => e.alive).sort((a, b) => a.health - b.health)[0];
    return bb.target ? SUCCESS : FAILURE;
  })
};
