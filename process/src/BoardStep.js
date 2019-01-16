"use strict";

class BoardStep {
  constructor(node, depth) {
    this.node = node;
    this.depth = depth;
  }

  generate(maxDepth) {
    this.nextNode = this.findNextNode();
    this.weight = this.generateWeight(maxDepth);
  }

  findNextNode() {
    const node = this.node.uniqueChildren().sort((a,b) => b.subNodes().length - a.subNodes().length)[0];
    if (!node.isLast()) {
      return node;
    }
  }

  // Weight determines where the recipe should stop
  // A higher weight means it should more likely stop
  generateWeight(maxDepth) {
    let weight = 0;

    // A node with two complex branches should likely stop
    const complexChildren = this.node.children.filter(c => !c.isLast());
    if (complexChildren.length > 1) {
      weight += 10;
    }

    // A node with children which have more uses should likely stop
    for (let child of complexChildren) {
      weight += Math.min(child.object.transitionsAway.length, 10);
    }

    // Try not to stop on decay transitions
    if (this.node.transition && this.node.transition.decay) {
      weight -= 5;
    }

    // Use a sine wave to favor steps in the middle
    // Probably a better way to do this
    let depthFraction = Math.max(this.depth/maxDepth, 1);
    let depthWeight = Math.abs(Math.abs(Math.sin(Math.PI*(depthFraction - 0.5))) - 1);
    depthWeight += (1.0-depthWeight) / 2; // Round sine wave
    depthWeight -= 0.2; // Favor earlier items slightly

    return weight * depthWeight;
  }

  otherNodes() {
    return this.node.children.filter(child => child != this.nextNode);
  }

  jsonData() {
    return this.node.jsonData(true);
  }
}

module.exports = BoardStep;
