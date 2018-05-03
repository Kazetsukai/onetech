"use strict";

class RecipeNode {
  constructor({object, availableTools, parent}) {
    this.object = object;
    this.availableTools = availableTools || [];
    this.parents = [];
    this.decaySeconds = 0;
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

    return this.generateNodesForTransition(this.object.transitionsToward[0]);
  }

  generateNodesForTransition(transition) {
    if (!transition) return [];

    // Collapse decay transitions
    if (transition.autoDecaySeconds > 0) {
      this.decaySeconds += parseInt(transition.autoDecaySeconds);
      const nextTransition = transition.target.transitionsToward[0];
      if (nextTransition.autoDecaySeconds > 0) {
        return this.generateNodesForTransition(nextTransition);
      }
    }

    const nodes = [];
    if (transition.actor)
      nodes.push(this.generateNode(transition.actor));
    if (transition.target)
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
    return !this.isTool() && !this.isIngredient();
  }

  isTool() {
    return this.parentIsTool() || this.availableTools.includes(this.object);
  }

  parentIsTool() {
    return this.parents.find(n => n.isTool());
  }

  isIngredient() {
    return !this.isTool() && (!this.object.depth.hasValue() || this.object.depth.difficulty == 0);
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
    const transition = this.object.transitionsToward[0];
    this.addAvailableTool(transition.newActor, 0);
    this.addAvailableTool(transition.newTarget, 0);
  }

  addAvailableTool(object, depth) {
    if (!object || object == this.object || this.availableTools.includes(object)) return;

    if (object.depth.compare(this.object.depth) < 0)
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
    if (this.decaySeconds)
      data.decay = transition.calculateDecay(this.decaySeconds);
    else if (transition.decay)
      data.decay = transition.decay;
    if (transition.hand)
      data.hand = true;
    if (transition.targetsPlayer())
      data.targetPlayer = true;

    return data;
  }
}

module.exports = RecipeNode;
