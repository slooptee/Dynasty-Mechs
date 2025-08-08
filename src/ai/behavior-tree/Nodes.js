export class Node {
  tick(bb) { throw new Error('implement in subclass'); }
}

export class Success extends Node { tick() { return 'success'; } }
export class Failure extends Node { tick() { return 'failure'; } }
export class Running extends Node { tick() { return 'running'; } }

export class Leaf extends Node {
  constructor(fn) { super(); this.fn = fn; }
  tick(bb) { return this.fn(bb); }
}

// Selector: first child that returns success stops the chain
export class Selector extends Node {
  constructor(children = []) { super(); this.children = children; }
  tick(bb) {
    for (const c of this.children) {
      const r = c.tick(bb);
      if (r === 'success' || r === 'running') return r;
    }
    return 'failure';
  }
}

// Sequence: fails fast; success only if all succeed
export class Sequence extends Node {
  constructor(children = []) { super(); this.children = children; }
  tick(bb) {
    for (const c of this.children) {
      const r = c.tick(bb);
      if (r === 'failure' || r === 'running') return r;
    }
    return 'success';
  }
}
