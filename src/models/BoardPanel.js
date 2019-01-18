export default class BoardPanel {
  constructor(object) {
    this.object = object;
  }

  loading() {
    return !this.object.data;
  }

  steps() {
    if (!this.object.data || !this.object.data.boardRecipe) {
      return [];
    }
    const steps = [];
    let checkChain = false;

    let step = this.object.data.boardRecipe.rootStep;
    while (step) {
      steps.push(step);
      step = this.nextStep(step);
      if (step) {
        if (step.last) {
          step = null;
        } else if (this.stepChainLength(step) === 0) {
          checkChain = true; // Check the chain length next time
        } else if (checkChain && steps.length + this.stepChainLength(step) > 8) {
          step = null;
        }
      }
    }
    return steps.reverse();
  }

  nextStep(step) {
    let next;
    if (step.actor && step.actor.id === step.nextId) {
      return step.actor;
    }
    return step.target;
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
    const steps = this.steps();
    const stepIds = steps.map(s => s.id);
    for (let step of steps) {
      if (step.actor && !stepIds.includes(step.actor.id)) {
        ingredientIds.push(step.actor.id);
      }
      if (step.target && !stepIds.includes(step.target.id)) {
        ingredientIds.push(step.target.id);
      }
    }
    return ingredientIds;
  }
}
