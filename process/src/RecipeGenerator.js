"use strict";

const RecipeNode = require('./RecipeNode');

class RecipeGenerator {
  constructor(object) {
    this.object = object;
    this.nodes = [];
    this.availableTools = [];
  }

  generate() {
    const root = this.generateNode(this.object);
    root.trackMainBranch();
    root.collapseBranches();
  }

  generateNode(object) {
    const node = new RecipeNode(object);
    if (this.availableTools.includes(object)) {
      node.makeTool(this);
    }
    if (!node.tool && !node.isIngredient()) {
      node.transition = this.lookupTransition(node);
      this.generateTransitionNodes(node);
    }
    this.nodes.push(node);
    return node;
  }

  lookupTransition(node) {
    let transition = node.object.transitionsToward[0];
    if (!transition) return;

    transition = this.collapseDecayTransition(node, transition);

    // Look for an alternative to last use transitions
    // This way we don't use the last item of the stack if we can just grab an item
    if (transition.lastUseActor && !transition.reverseUseActor ||
        transition.lastUseTarget && !transition.reverseUseTarget) {
      const altTransition = node.object.transitionsToward[1];
      if (altTransition && altTransition.totalDepth() <= transition.totalDepth()+1) {
        transition = altTransition;
      }
    }

    return transition;
  }

  collapseDecayTransition(node, transition) {
    if (transition.totalDecaySeconds() > 0) {
      node.decaySeconds += parseInt(transition.totalDecaySeconds());
      const nextTransition = transition.target.transitionsToward[0];
      if (nextTransition.totalDecaySeconds() > 0) {
        return this.collapseDecayTransition(node, nextTransition);
      }
    }
    return transition;
  }

  generateTransitionNodes(node) {
    if (!node.transition) return;

    this.addAvailableTool(node.transition.newActor, node, 0);
    this.addAvailableTool(node.transition.newTarget, node, 0);

    this.generateChildNode(node.transition.actor, node);
    this.generateChildNode(node.transition.target, node);
  }

  generateChildNode(object, parent) {
    if (!object) return;
    let node = this.nodes.find(n => n.object == object);
    if (!node)
      node = this.generateNode(object);
    node.addParent(parent);
  }

  deleteNode(node) {
    this.nodes = this.nodes.filter(n => n != node);
  }

  addAvailableTool(object, parent, recursionCount) {
    if (!object || object == parent.object || this.availableTools.includes(object)) return;

    if (object.depth.compare(parent.object.depth) < 0) {
      this.availableTools.push(object);
      const node = this.nodes.find(n => n.object == object);
      if (node) node.makeTool(this);
    }

    // Don't search too deep for tools
    if (recursionCount > 10 || object.isNatural()) return;

    // Search simple transitions for more tools
    for (let transition of object.transitionsAway) {
      if (transition.decay || !transition.actor || !transition.target) {
        this.addAvailableTool(transition.newActor, parent, recursionCount+1);
        this.addAvailableTool(transition.newTarget, parent, recursionCount+1);
      }
    }
  }
}

module.exports = RecipeGenerator;
