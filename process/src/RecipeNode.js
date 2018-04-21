"use strict";

class RecipeNode {
  constructor({object, availableTools, count, parent}) {
    this.object = object;
    this.availableTools = availableTools || [];
    this.extraCount = count || 0;
    this.parents = [];
    if (parent)
      this.parents.push(parent);
  }

  merge(node) {
    this.extraCount += node.extraCount;
    this.parents = this.parents.concat(node.parents);
    this.parents = this.parents.filter((o,i) => this.parents.indexOf(o) == i);
  }

  generateNodes() {
    if (this.generated) return [];
    this.generated = true;
    this.addAvailableTools();

    if (this.isTool() || this.isIngredient())
      return [];

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
    const parentsDecay = this.parents.filter(n => n.isDecay()).length == this.parents.length;
    return this.isDecay() && parentsDecay;
  }

  isTool() {
    return this.availableTools.includes(this.object);
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
    let count = this.parents.map(n => n.count()).reduce((t, c) => t + c, 0);
    count += this.extraCount;
    return Math.ceil(count/(parseInt(this.object.data.numUses) || 1));
  }

  addAvailableTools() {
    for (let tool of this.object.complexity.tools)
      this.addAvailableTool(tool, 0);
  }

  addAvailableTool(object, depth) {
    if (!object || this.availableTools.includes(object)) return;

    this.availableTools.push(object);

    if (depth > 5) return;

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
