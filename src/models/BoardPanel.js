import BoardStep from './BoardStep';

export default class BoardPanel {
  constructor(object, board, count) {
    this.object = object;
    this.board = board;
    this.count = count;
    this.nodes = null;
    this.steps = [];
    this.ingredientSteps = [];
  }

  loading() {
    return !this.object.data;
  }

  generateSteps() {
    if (this.loading()) {
      return [];
    }

    this.generateNodes();

    const steps = [];
    const otherIds = this.otherObjectIds();
    const sharedIds = [];

    if (otherIds.includes(this.object.id)) {
      sharedIds.push(this.object.id);
    }

    console.log(otherIds);

    let step = BoardStep.generate(this.object.id, this.count, this.nodes, 0);
    while (step) {
      steps.push(step);
      for (let id of step.objectIds()) {
        if (otherIds.includes(id)) {
          sharedIds.push(id);
        }
      }
      step = step.nextStep(sharedIds);
    }
    this.steps = steps.reverse();
    this.generateIngredientSteps();
    this.broadcastSharedIds(sharedIds);
  }

  generateNodes() {
    if (this.nodes) {
      return;
    }
    this.nodes = {};
    for (let node of this.object.data.boardRecipe.nodes) {
      this.nodes[node.id] = node;
    }
  }

  generateIngredientSteps() {
    const ingredientSteps = [];
    for (let i in this.steps) {
      const otherSteps = this.steps[i].otherSteps(this.steps[i+1]);
      for (let ingredientStep of otherSteps) {
        if (ingredientStep && !this.steps.includes(ingredientStep)) {
          ingredientSteps.push(ingredientStep);
        }
      }
    }
    this.ingredientSteps = ingredientSteps;
  }

  otherPanels() {
    return this.board.panels.filter(p => p != this);
  }

  otherObjectIds() {
    return this.otherPanels().map(p => p.objectIds()).flat();
  }

  objectIds() {
    return this.steps.map(s => s.objectIds()).flat().concat([this.object.id]);
  }

  broadcastSharedIds(sharedIds) {
    console.log(sharedIds);
    if (sharedIds.length === 0) {
      return;
    }
    for (let panel of this.otherPanels()) {
      panel.updateSharedIds(sharedIds);
    }
  }

  updateSharedIds(sharedIds) {
    const stepIds = this.steps.map(s => s.id);
    console.log(sharedIds, stepIds);
    for (let sharedId of sharedIds) {
      if (stepIds.includes(sharedId)) {
        this.generateSteps();
        return;
      }
    }
  }
}
