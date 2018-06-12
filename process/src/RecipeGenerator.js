"use strict";

const RecipeNode = require('./RecipeNode');

class RecipeGenerator {
  constructor(object) {
    this.object = object;
    this.nodes = [];
    this.availableTools = [];
  }

  generate() {
    this.generateNode(this.object);
    this.collapseBranches(this.nodes.find(n => n.object == this.object));
  }

  generateNode(object) {
    const node = new RecipeNode(object);
    if (this.availableTools.includes(object))
      node.makeTool();
    if (!node.tool && !node.isIngredient())
      this.generateTransitionNodes(object.transitionsToward[0], node);
    this.nodes.push(node);
    return node;
  }

  generateChildNode(object, parent) {
    if (!object) return;
    let node = this.nodes.find(n => n.object == object);
    if (!node)
      node = this.generateNode(object);
    node.addParent(parent);
  }

  generateTransitionNodes(transition, parent) {
    if (!transition) return;

    // Collapse decay transitions
    if (transition.autoDecaySeconds > 0) {
      parent.decaySeconds += parseInt(transition.autoDecaySeconds);
      const nextTransition = transition.target.transitionsToward[0];
      if (nextTransition.autoDecaySeconds > 0) {
        return this.generateTransitionNodes(nextTransition, parent);
      }
    }

    this.addAvailableTool(transition.newActor, parent, 0);
    this.addAvailableTool(transition.newTarget, parent, 0);

    this.generateChildNode(transition.actor, parent);
    this.generateChildNode(transition.target, parent);
  }

  addAvailableTool(object, parent, recursionCount) {
    if (!object || object == parent.object || this.availableTools.includes(object)) return;

    if (object.depth.compare(parent.object.depth) < 0) {
      this.availableTools.push(object);
      const node = this.nodes.find(n => n.object == object);
      if (node) node.makeTool();
    }

    // Don't search too deep for tools
    if (recursionCount > 5 || object.isNatural()) return;

    // Search simple transitions for more tools
    for (let transition of object.transitionsAway) {
      if (transition.decay || !transition.actor || !transition.target) {
        this.addAvailableTool(transition.newActor, parent, recursionCount+1);
        this.addAvailableTool(transition.newTarget, parent, recursionCount+1);
      }
    }
  }

  // Collapse all children except the one with the deepest sub nodes
  // but still has more than 1 sub node
  collapseBranches(node) {
    if (node.children.length > 1) {
      const children = node.uniqueChildren()
        .sort((a,b) => b.subNodeDepth() - a.subNodeDepth());
      for (let i=1; i < children.length; i++) {
        const child = children[i];
        if (child.subNodes().length > 1)
          child.collapse();
      }
    }
    for (let child of node.children) {
      if (!child.expandable)
        this.collapseBranches(child);
    }
  }
}

module.exports = RecipeGenerator;
