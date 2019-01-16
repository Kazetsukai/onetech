"use strict";

class BoardRecipe {
  constructor(recipe) {
    this.recipe = recipe;
    this.steps = [];
    this.addedNodes = [];
    this.naturalObjects = [];
    this.uncraftableObjects = [];
    this.usedObjects = [];
    this.relevantObjects = [];
  }

  generate() {
    if (this.recipe.hasData()) {
      this.addNode(this.recipe.rootNode, 0);
    }
  }

  addNode(node, depth) {
    if (this.recipe.object.id == 82 && node.object.id == 75) {
      debugger;
    }
    if (this.addedNodes.includes(node)) {
      return;
    }
    this.addedNodes.push(node);

    if (node.object.isNatural()) {
      return this.addObject(node, this.naturalObjects);
    }
    if (!node.object.depth.value) {
      return this.addObject(node, this.uncraftableObjects);
    }
    if (node.tool) {
      return this.addObject(node, this.usedObjects);
    }

    // Find a good breaking spot for common objects
    if (depth > 1) {
      let commonality = node.object.transitionsAway.length;
      if (commonality + depth >= 12) {
        return this.addObject(node, this.usedObjects);
      }
    }

    if (!node.mainBranch) {
      this.relevantObjects.push(node.object);
      this.addObject(node, this.usedObjects);
      return;
    }

    this.steps.push(node);
    for (let child of node.children) {
      this.addNode(child, depth+1);
    }
  }

  addObject(node, objects) {
    const count = node.count();
    for (let i=0; i < count; i++) {
      objects.push(node.object);
    }
  }

  hasData() {
    return this.steps.length > 0;
  }

  jsonData() {
    const data = {};

    if (this.steps.length > 0) {
      data.steps = this.steps.map(node => node.jsonData(true)).reverse();
    }

    if (this.naturalObjects.length > 0) {
      data.naturalObjects = this.naturalObjects.map(o => o.id);
    }

    if (this.uncraftableObjects.length > 0) {
      data.uncraftableObjects = this.uncraftableObjects.map(o => o.id);
    }

    if (this.usedObjects.length > 0) {
      data.usedObjects = this.usedObjects.map(o => o.id);
    }

    if (this.relevantObjects.length > 0) {
      data.relevantObjects = this.relevantObjects.map(o => o.id);
    }

    return data;
  }
}

module.exports = BoardRecipe;
