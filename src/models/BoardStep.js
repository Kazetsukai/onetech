export default class BoardStep {
  constructor(node, count, depth) {
    this.id = node.id;
    this.node = node;
    this.count = count;
    this.depth = depth;
  }

  static generate(id, count, nodes, depth) {
    if (!nodes[id]) {
      return null;
    }
    const step = new BoardStep(nodes[id], count, depth);
    step.generateChildren(nodes, depth);
    return step;
  }

  generateChildren(nodes, depth) {
    if (this.node.actorID) {
      this.actorStep = BoardStep.generate(this.node.actorID, this.count, nodes, depth+1)
    }
    if (this.node.targetID) {
      if (this.node.targetID == this.node.actorID) {
        this.targetStep = this.actorStep;
        this.targetStep.count += this.count;
      } else {
        this.targetStep = BoardStep.generate(this.node.targetID, this.count, nodes, depth+1)
      }
    }
  }

  nextStep(sharedIds) {
    let nextStep = this.potentialNextStep(sharedIds);
    if (nextStep && nextStep.hasNextStep()) {
      if (this.isComplex() && !nextStep.isComplex() && this.depth > 2) {
        return null;
      }
      if (this.depth > 2 && nextStep.node.transitionsAwayCount > 6) {
        return null;
      }
      if (this.depth > 5 && nextStep.node.transitionsAwayCount > 4) {
        return null;
      }
      if (this.depth > 10 && nextStep.node.transitionsAwayCount > 2) {
        return null;
      }
      return nextStep;
    }
  }

  potentialNextStep(sharedIds) {
    if (this.actorStep && this.targetStep) {
      if (this.actorStep.branchSize() > this.targetStep.branchSize() &&
          !sharedIds.includes(this.node.actorID)) {
        return this.actorStep;
      }
      if (!sharedIds.includes(this.node.targetID)) {
        return this.targetStep;
      }
    }
    if (this.actorStep && !sharedIds.includes(this.node.actorID)) {
      return this.actorStep;
    }
    if (this.targetStep && !sharedIds.includes(this.node.targetID)) {
      return this.targetStep;
    }
  }

  hasNextStep() {
    return this.actorStep || this.targetStep;
  }

  otherSteps(step) {
    const steps = [];
    if (this.actorStep && this.actorStep != step) {
      steps.push(this.actorStep);
    }
    if (this.targetStep && this.targetStep != step) {
      steps.push(this.targetStep);
    }
    return steps;
  }

  objectIds() {
    const ids = [];
    if (this.node.actorID) {
      ids.push(this.node.actorID);
    }
    if (this.node.targetID) {
      ids.push(this.node.targetID);
    }
    return ids;
  }

  branchSize() {
    return this.node.branchSize || 0;
  }

  isComplex() {
    return this.actorStep && this.targetStep &&
      this.actorStep.branchSize() >  2 && this.targetStep.branchSize() > 2;
  }

  merge(other) {
    const node = this.branchSize() > other.branchSize() ? this.node : other.node;
    const count = this.count + other.count;
    const depth = Math.max(this.depth, other.depth);
    return new BoardStep(node, count, depth);
  }

  compareIngredient(other) {
    return other.branchSize() - this.branchSize();
  }
}
