export default class BoardPanel {
  constructor(object, board) {
    this.object = object;
    this.board = board;
    this.steps = [];
  }

  loading() {
    return !this.object.data;
  }

  generateSteps() {
    if (!this.object.data || !this.object.data.boardRecipe) {
      return [];
    }
    const steps = [];
    const otherIds = this.otherObjectIds();
    const sharedIds = [];

    let checkChain = false;

    let step = this.object.data.boardRecipe.rootStep;
    while (step) {
      steps.push(step);
      for (var id of this.stepObjectIds(step)) {
        if (otherIds.includes(id)) {
          sharedIds.push(id);
        }
      }
      step = this.nextStep(step, sharedIds);
      if (step) {
        if (step.last) {
          step = null;
        } else if (this.stepChainLength(step) === 0) {
          checkChain = true; // Check the chain length next time
        } else if (checkChain && steps.length + this.stepChainLength(step) > 6) {
          step = null;
        }
      }
    }
    this.steps = steps.reverse();
    this.broadcastSharedIds(sharedIds);
    return this.steps;
  }

  nextStep(step, sharedIds) {
    if (step.actor && step.actor.id === step.nextId && !sharedIds.includes(step.actor.id)) {
      return step.actor;
    }
    if (!sharedIds.includes(step.target.id)) {
      return step.target;
    }
  }

  // This returns how many steps only have one child in a chain
  stepChainLength(step, length = 0) {
    // Find the step's children which are either relevant or not last
    let children = [step.actor, step.target].filter(s => s && (s.relevant || !s.last));
    if (children.length === 1) {
      return this.stepChainLength(children[0], length + 1);
    }
    return length;
  }

  ingredientIds() {
    const ingredientIds = [];
    const stepIds = this.steps.map(s => s.id);
    const otherIds = this.otherPanels().map(p => p.object.id);
    for (let step of this.steps) {
      if (step.actor && !stepIds.includes(step.actor.id) && !otherIds.includes(step.actor.id)) {
        ingredientIds.push(step.actor.id);
      }
      if (step.target && !stepIds.includes(step.target.id) && !otherIds.includes(step.target.id)) {
        ingredientIds.push(step.target.id);
      }
    }
    return ingredientIds;
  }

  otherPanels() {
    return this.board.panels.filter(p => p != this);
  }

  otherObjectIds() {
    return this.otherPanels().map(p => p.objectIds()).flat();
  }

  objectIds() {
    return this.steps.map(s => this.stepObjectIds(s)).flat();
  }

  stepObjectIds(step) {
    const ids = [];
    if (step.actor) {
      ids.push(step.actor.id);
    }
    if (step.target) {
      ids.push(step.target.id);
    }
    return ids;
  }

  broadcastSharedIds(sharedIds) {
    if (sharedIds.length === 0) {
      return;
    }
    for (let panel of this.otherPanels()) {
      panel.updateSharedIds(sharedIds);
    }
  }

  updateSharedIds(sharedIds) {
    const stepIds = this.steps.map(s => s.id);
    for (let sharedId of sharedIds) {
      if (stepIds.includes(sharedId)) {
        this.generateSteps();
        return;
      }
    }
  }
}
