"use strict";

// Complexity is the number of steps needed to craft an object
// Natural objects have a complexity of 1
// Uncraftable objects have null complexity
class Complexity {
  constructor({ value, tools }) {
    this.value = value;
    this.tools = tools || [];
    this.unusedObjects = []; // non-tools that are leftover from transitions
  }

  clone() {
    return new Complexity({value: this.value, tools: this.tools.slice(0)});
  }

  hasValue() {
    return this.value > 0 || this.value === 0;
  }

  combineObjectComplexities(actor, target) {
    this.addObjectComplexity(actor);
    this.addObjectComplexity(target);
    if (actor && target)
      this.reduceValueByTools(actor, target);
    this.consumeTool(actor);
    this.consumeTool(target);
  }

  addObjectComplexity(object) {
    if (object && this.hasValue()) {
      if (object.complexity.hasValue()) {
        this.value += object.complexity.value;
        this.addTools(object.complexity.tools);
      } else {
        this.value = null;
      }
    }
  }

  addTools(tools) {
    for (var tool of tools)
      this.addTool(tool);
  }

  addTool(tool) {
    if (tool) {
      if (tool.complexity.hasValue() && tool.complexity.value < this.value && !this.tools.includes(tool))
        this.tools.push(tool);
      else if (!this.unusedObjects.includes(tool))
        this.unusedObjects.push(tool);
    }
  }

  reduceValueByTools(actor, target) {
    if (actor.complexity.tools.includes(target))
      this.reduceValue(target.complexity.value);
    else if (target.complexity.tools.includes(actor))
      this.reduceValue(actor.complexity.value);
    else
      this.reduceValue(actor.complexity.overlappingToolValue(target.complexity.tools));
  }

  overlappingToolValue(otherTools) {
    var value = 0;
    for (var tool of this.tools) {
      if (otherTools.includes(tool))
        value += tool.complexity.value - tool.complexity.overlappingToolValue(this.tools);
    }
    return value;
  }

  reduceValue(amount) {
    if (this.hasValue()) {
      this.value -= amount;
      if (this.value < 0)
        throw "Complexity value reached negative, something must be wrong";
    }
  }

  consumeTool(tool) {
    if (tool) {
      if (this.tools.includes(tool))
        this.tools = this.tools.filter(t => t != tool);
      if (this.unusedObjects.includes(tool))
        this.unusedObjects = this.unusedObjects.filter(t => t != tool);
    }
  }

  // For use in an array sort function, returns 1, -1 or 0 depending
  // on the value comparison
  compare(complexity) {
    if (this.hasValue() && complexity.hasValue())
      return this.value - complexity.value;
    if (this.hasValue())
      return -1;
    if (complexity.hasValue())
      return 1;
    return 0;
  }
}

module.exports = Complexity;
