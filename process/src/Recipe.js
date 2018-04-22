"use strict";

const RecipeNode = require('./RecipeNode');

class Recipe {
  constructor(object) {
    this.object = object;
    const node = new RecipeNode({object: object});
    this.nodes = [node];
    this.remainingNodes = [];
  }

  generate() {
    for (let depth=0; depth < 40; depth++) {
      const nodes = this.nodes.filter(n => n.depth() == depth);
      if (nodes.length == 0)
        return;
      if (this.nodes.length > 80) {
        // console.log("Reached recipe node limit for ", this.object.id, this.object.name);
        this.remainingNodes = nodes;
        this.nodes = this.nodes.filter(n => !this.remainingNodes.includes(n));
        return;
      }
      for (let node of nodes) {
        this.addNodes(node.generateNodes());
      }
    }
  }

  addNodes(newNodes) {
    for (let node of newNodes) {
      let existingNode = this.nodes.find(n => n.object == node.object);
      if (existingNode)
        existingNode.merge(node)
      else
        this.nodes.push(node)
    }
  }

  hasData() {
    return this.nodes.length > 1;
  }

  jsonData() {
    // For now let's just merge tools and ingredients together when displaying
    // We may eventually split them up for the user
    const ingredients = this.tools().concat(this.ingredients());
    return {
      steps: this.steps().reverse(),
      ingredients: ingredients.sort((a,b) => a.complexity.compare(b.complexity)).reverse().map(o => o.id),
    }
  }

  tools() {
    return this.nodes.filter(n => n.isTool() && !n.parentIsTool()).map(n => n.object);
  }

  ingredients() {
    const ingredients = [];
    const nodes = this.remainingNodes.concat(this.nodes.filter(n => n.isIngredient()));
    for (let node of nodes) {
      const count = node.count();
      for (let i=0; i < count; i++) {
        ingredients.push(node.object);
      }
    }
    return ingredients;
  }

  steps() {
    const steps = [];
    for (let node of this.nodes) {
      if (node.showInStep()) {
        const depth = node.depth();
        if (steps[depth])
          steps[depth].push(node.jsonData());
        else
          steps[depth] = [node.jsonData()];
      }
    }
    return steps.filter(s => s);
  }
}

module.exports = Recipe;
