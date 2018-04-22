"use strict";

class RecipeNode {
  constructor({object, availableTools, parent}) {
    this.object = object;
    this.availableTools = availableTools || [];
    this.parents = [];
    if (parent)
      this.parents.push(parent);
  }

  merge(node) {
    this.parents = this.parents.concat(node.parents);
  }

  generateNodes() {
    if (this.generated) return [];
    this.generated = true;

    if (this.isTool() || this.isIngredient())
      return [];

    this.addAvailableTools();

    const nodes = [];

    const transition = this.object.transitionsToward[0];
    if (transition && transition.actor)
      nodes.push(this.generateNode(transition.actor));
    if (transition && transition.target)
      nodes.push(this.generateNode(transition.target));

    return nodes;
  }

  generateNode(object) {
    return new RecipeNode({
      object: object,
      parent: this,
      availableTools: this.availableTools}
    );
  }

  showInStep() {
    return !this.isTool() && !this.isIngredient() && !this.isAnotherDecay();
  }

  isDecay() {
    const transition = this.object.transitionsToward[0];
    return transition && transition.decay;
  }

  isAnotherDecay() {
    if (this.parents.length == 0 || !this.isDecay()) return false;
    const parentsDecay = this.parents.filter(n => n.isDecay()).length == this.parents.length;
    return parentsDecay;
  }

  isTool() {
    return this.parentIsTool() || this.availableTools.includes(this.object);
  }

  parentIsTool() {
    return this.parents.find(n => n.isTool());
  }

  isIngredient() {
    return !this.isTool() && (!this.object.complexity.hasValue() || this.object.complexity.value == 0);
  }

  depth() {
    if (this.parents.length == 0) return 0;
    return this.parents.map(n => n.depth()).sort((a,b) => b-a)[0]+1;
  }

  count() {
    if (this.isTool()) return 1;
    if (this.parents.length == 0) return 1;
    return this.parents.map(n => n.count()).reduce((t, c) => t + c, 0);
  }

  addAvailableTools() {
    for (let tool of this.object.complexity.tools)
      this.addAvailableTool(tool, 0);

    for (let object of this.object.complexity.unusedObjects)
      this.addAvailableTool(object, 0);
  }

  addAvailableTool(object, depth) {
    if (!object || object == this.object || this.availableTools.includes(object)) return;

    this.availableTools.push(object);

    if (depth > 5 || object.isNatural()) return;

    // Search simple transitions for more tools
    for (let transition of object.transitionsAway) {
      if (transition.decay || !transition.actor || !transition.target) {
        this.addAvailableTool(transition.newActor, depth+1);
        this.addAvailableTool(transition.newTarget, depth+1);
      }
    }
  }

  jsonData() {
    const data = {id: this.object.id};
    if (this.count() > 1)
      data.count = this.count();

    const transition = this.object.transitionsToward[0];
    if (transition.actor)
      data.actorID = transition.actor.id;
    if (transition.target)
      data.targetID = transition.target.id;
    if (transition.decay)
      data.decay = transition.decay;
    if (transition.hand)
      data.hand = true;

    return data;
  }
}

module.exports = RecipeNode;
