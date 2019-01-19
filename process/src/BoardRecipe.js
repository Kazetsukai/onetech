"use strict";

class BoardRecipe {
  constructor(recipe) {
    this.recipe = recipe;
    this.nodes = recipe.nodes.filter(n => n.minDepth() < 14);
    // this.addedNodes = [];
    // this.naturalObjects = [];
    // this.uncraftableObjects = [];
    // this.usedObjects = [];
    // this.relevantObjects = [];
  }

  // generate() {
  //   if (this.recipe.hasData()) {
  //     this.rootStep = new BoardStep(this.recipe.rootNode, 0);
  //     // this.gatherSteps();
  //     this.addObjects();
  //   }
  // }

  // gatherSteps() {

  // }

  // // Break the list of steps where the weight is highest
  // limitSteps(node, depth) {
  //   if (this.steps.length <= this.maxDepth/2) {
  //     return; // Don't limit smaller recipes
  //   }
  //   const weights = this.steps.map(s => s.weight).slice(0, this.maxDepth);
  //   let maxDepth = weights.indexOf(Math.max(...weights));
  //   if (maxDepth < 0 || maxDepth > this.maxDepth) {
  //     maxDepth = this.maxDepth;
  //   }
  //   // Don't limit if it is close to the max steps
  //   if (maxDepth < this.steps.length - 2) {
  //     this.steps = this.steps.slice(0, maxDepth+1);
  //     this.steps[this.steps.length-1].nextNode = null;
  //   }
  // }

  // addObjects() {
  //   for (let step of this.steps) {
  //     for (let node of step.otherNodes()) {
  //       this.addNodeObjects(node);
  //     }
  //   }
  // }

  // addNodeObjects(node, depth) {
  //   if (this.addedNodes.includes(node)) {
  //     return;
  //   }
  //   this.addedNodes.push(node);

  //   if (node.object.isNatural()) {
  //     return this.addNodeObject(node, this.naturalObjects);
  //   }
  //   if (!node.object.depth.value) {
  //     return this.addNodeObject(node, this.uncraftableObjects);
  //   }
  //   if (node.tool) {
  //     return this.addNodeObject(node, this.usedObjects);
  //   }

  //   this.relevantObjects.push(node.object);
  //   this.addNodeObject(node, this.usedObjects);
  // }

  // addNodeObject(node, objects) {
  //   const count = node.count();
  //   for (let i=0; i < count; i++) {
  //     objects.push(node.object);
  //   }
  // }

  hasData() {
    return this.recipe.hasData();
  }

  jsonData() {
    const data = {};

    data.nodes = this.nodes.map(n => n.jsonDataForBoard());

    // if (this.steps.length > 0) {
    //   data.steps = this.steps.map(step => step.jsonData()).reverse();
    // }

    // if (this.naturalObjects.length > 0) {
    //   data.naturalObjects = this.naturalObjects.map(o => o.id);
    // }

    // if (this.uncraftableObjects.length > 0) {
    //   data.uncraftableObjects = this.uncraftableObjects.map(o => o.id);
    // }

    // if (this.usedObjects.length > 0) {
    //   data.usedObjects = this.usedObjects.map(o => o.id);
    // }

    // if (this.relevantObjects.length > 0) {
    //   data.relevantObjects = this.relevantObjects.map(o => o.id);
    // }

    return data;
  }
}

module.exports = BoardRecipe;
