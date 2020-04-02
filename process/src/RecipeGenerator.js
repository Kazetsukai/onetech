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
    if (!node.isLast()) {
      node.transition = this.lookupTransition(node);
      this.generateTransitionNodes(node);
    }
    this.nodes.push(node);
    return node;
  }

  lookupTransition(node) {
    let transition = node.object.transitionsToward[0];
    if (!transition) {
      return;
    }
    if (transition.depth.compare(node.object.depth) > 0 && transition.depth.value > node.object.depth.value) {
      console.log(`Unable to complete recipe for ${this.object.debugName()}: transition has greater depth for node ${node.object.debugName()}.`)
      // debugger;
      node.uncraftable = true;
      return;
    }

    transition = this.collapseDecayTransition(node, transition, 0);

    // Look for an alternative to last use transitions
    // This way we don't use the last item of the stack if we can just grab an item
    // For example, pick up a wooden disk instead of drilling last one in pile
    if (transition.lastUseActor && !transition.reverseUseActor ||
        transition.lastUseTarget && !transition.reverseUseTarget) {
      const altTransition = node.object.transitionsToward[1];
      if (altTransition && altTransition.depth.value <= transition.depth.value+1 &&
          altTransition.totalDepth() <= transition.totalDepth()+1) {
        transition = altTransition;
      }
    }

    return transition;
  }

  collapseDecayTransition(node, transition, depth) {
    if (depth > 10) {
      console.log(`Detected infinite loop collapsing decay transitions for ${this.object.name}`);
      // debugger;
      return transition;
    }

    if (transition.totalDecaySeconds() > 0 && transition.target.depth.value) {
      node.decaySeconds += parseInt(transition.totalDecaySeconds());
      const nextTransition = transition.target.transitionsToward[0];
      if (nextTransition.totalDecaySeconds() > 0) {
        return this.collapseDecayTransition(node, nextTransition, depth+1);
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
