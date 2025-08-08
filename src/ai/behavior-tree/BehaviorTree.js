export class BehaviorTree {
  constructor(root, blackboard) {
    this.root = root;
    this.blackboard = blackboard;
  }
  tick() {
    return this.root.tick(this.blackboard);
  }
}
