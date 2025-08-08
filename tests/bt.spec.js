import { describe, it, expect } from 'vitest';
import { Selector, Sequence, Leaf } from '../src/ai/behavior-tree/Nodes.js';

describe('Behavior Tree', () => {
  it('selector returns success if any child succeeds', () => {
    const t = new Selector([ new Leaf(()=> 'failure'), new Leaf(()=> 'success') ]);
    expect(t.tick({})).toBe('success');
  });
  it('sequence fails fast', () => {
    const t = new Sequence([ new Leaf(()=> 'success'), new Leaf(()=> 'failure') ]);
    expect(t.tick({})).toBe('failure');
  });
});
