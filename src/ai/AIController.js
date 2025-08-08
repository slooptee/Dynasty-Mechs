// Composed BehaviorTreeAI for enemy
import { Selector, Sequence, Tasks } from './bt.js';

export class BehaviorTreeAI {
  constructor() {
    this.tree = new Selector([
      new Sequence([
        Tasks.chooseLowestHealthTarget,
        Tasks.attackIfAdjacent
      ]),
      new Sequence([
        Tasks.chooseLowestHealthTarget,
        Tasks.moveToward
      ])
    ]);
  }
  act(blackboard) {
    return this.tree.tick(blackboard);
  }
}
