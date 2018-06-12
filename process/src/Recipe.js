"use strict";

const RecipeGenerator = require('./RecipeGenerator');
const RecipeNode = require('./RecipeNode');

class Recipe {
  constructor(object) {
    this.object = object;
  }

  generate() {
    const generator = new RecipeGenerator(this.object);
    generator.generate();
    this.nodes = generator.nodes;
  }

  hasData() {
    return this.nodes.length > 1;
  }

  jsonData() {
    // For now let's just merge tools and ingredients together when displaying
    // We may eventually split them up for the user
    const ingredients = this.tools().concat(this.ingredients());
    return {
      steps: RecipeNode.steps(this.nodes),
      ingredients: ingredients.sort((a,b) => a.depth.compare(b.depth)).reverse().map(o => o.id),
    }
  }

  tools() {
    return this.nodes.filter(n => n.tool).map(n => n.object);
  }

  ingredients() {
    const ingredients = [];
    const nodes = this.nodes.filter(n => n.isIngredient());
    for (let node of nodes) {
      const count = node.count();
      for (let i=0; i < count; i++) {
        ingredients.push(node.object);
      }
    }
    return ingredients;
  }
}

module.exports = Recipe;
