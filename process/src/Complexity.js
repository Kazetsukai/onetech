"use strict";

// Complexity is the number of steps needed to craft an object
// Natural objects have a complexity of 0
// Uncraftable objects have null complexity
class Complexity {
  constructor({ value, consumed, usedTools, unusedTools }) {
    this.rawValue = value;
    this.consumed = consumed || [];
    this.usedTools = usedTools || [];
    this.unusedTools = unusedTools || [];

    // this.tools = tools || [];
    // this.unusedObjects = unusedObjects || []; // non-tools that are leftover from transitions
  }

  addTransitionObjects(transition) {
    this.consumeObject(transition.actor);
    this.consumeObject(transition.target);
    this.useTool(transition.actor);
    this.useTool(transition.target);
    this.addUnusedTool(transition.newExtraTarget);
  }

  consumeObject(object) {
    if (!object) return;
    if (!this.hasValue() || !object.complexity.hasValue())
      throw "Unable to add null object complexities together";
    if ()
    this.consumed.push(object);
    this.rawValue += object.complexity.rawValue;
    this.addTools(object.complexity);
  }

  cloneWithUnusedTool(object) {
    const complexity = this.clone();
    complexity.addUnusedTool(object);
    return complexity;
  }

  clone() {
    return new Complexity({
      value: this.rawValue,
      consumed: this.consumed.slice(0),
      usedTools: this.usedTools.slice(0),
      unusedTools: this.unusedTools.slice(0)
    });
  }

  addTools(complexity) {
    this.usedTools = this.usedTools.concat(complexity.usedTools);
    this.unusedTools = this.usedTools.concat(complexity.unusedTools);
  }

  addUnusedTool(object) {
    if (!object) return;
    this.unusedTools.push(object);
  }

  useTool(object) {
    if (!object) return;
    if (this.unusedTools.includes(object)) {
      this.unusedTools = this.unusedTools.filter((o,i) => o != object || this.unusedTools.indexOf(o) < i);
      this.usedTools.push(object);
    }
  }

  value() {
    if (!this.hasValue()) return;
    let value = this.rawValue;
    for (let object of this.usedTools) {
      if (object.complexity.hasValue())
        value -= object.complexity.rawValue;
    }
    return value;
  }

  hasValue() {
    return this.rawValue > 0 || this.rawValue === 0;
  }

  // combineObjectComplexities(actor, target) {
  //   this.addObjectComplexity(actor);
  //   this.addObjectComplexity(target);
  //   // if (actor && target)
  //   //   this.reduceValueByTools(actor, target);
  //   this.consumeTool(actor);
  //   this.consumeTool(target);
  // }

  // combineObjectComplexities(actor, target) {
  //   this.addObjectComplexity(actor);
  //   this.addObjectComplexity(target);
  //   // if (actor && target)
  //   //   this.reduceValueByTools(actor, target);
  //   this.consumeTool(actor);
  //   this.consumeTool(target);
  // }

  // addObjectComplexity(object) {
  //   if (object && this.hasValue()) {
  //     if (object.complexity.hasValue()) {
  //       this.value = Math.max(this.value, object.complexity.value);
  //       this.addTools(object.complexity.tools);
  //     } else {
  //       this.value = null;
  //     }
  //   }
  // }

  // addTools(tools) {
  //   for (var tool of tools)
  //     this.addTool(tool);
  // }

  // addTool(tool) {
  //   if (tool) {
  //     if (tool.complexity.hasValue() && tool.complexity.value < this.value && !this.tools.includes(tool))
  //       this.tools.push(tool);
  //     else if (!this.unusedObjects.includes(tool))
  //       this.unusedObjects.push(tool);
  //   }
  // }

  // reduceValueByTools(actor, target) {
  //   // console.log("Reduce value for", actor.id, actor.name, target.id, target.name)
  //   if (actor.id == '441' && target.id == '330') debugger;
  //   if (actor.complexity.tools.includes(target))
  //     this.reduceValue(target.complexity.value);
  //   else if (target.complexity.tools.includes(actor))
  //     this.reduceValue(actor.complexity.value);
  //   else
  //     this.reduceValue(actor.complexity.overlappingOuterToolValue(target.complexity.tools));
  // }

  // Find the value of the tools which overlap
  // overlappingOuterToolValue(otherTools) {
  //   const overlappingTools = [];
  //   for (let tool of this.tools) {
  //     if (otherTools.includes(tool))
  //       overlappingTools.push(tool);
  //   }
  //   const outerTools = [];
  //   for (let tool of overlappingTools) {
  //     if (!overlappingTools.find(t => t != tool && t.complexity.tools.includes(tool)))
  //       outerTools.push(tool);
  //   }
  //   return outerTools.reduce((total, tool) => total + tool.complexity.value, 0);
  // }

  // outerTools(tools) {
  //   for (let tool of overlappingTools) {
  //     if (!overlappingTools.find(t => t != tool && t.complexity.tools.includes(tool)))
  //       outerTools.push(tool);
  //   }
  // }

  // reduceValue(amount) {
  //   if (this.hasValue()) {
  //     if (this.value < amount*2)
  //       throw "Unable to reduce complexity by more than half, something went wrong";
  //     this.value -= amount;
  //   }
  // }

  // consumeTool(tool) {
  //   if (tool) {
  //     if (this.tools.includes(tool))
  //       this.tools = this.tools.filter(t => t != tool);
  //     if (this.unusedObjects.includes(tool))
  //       this.unusedObjects = this.unusedObjects.filter(t => t != tool);
  //   }
  // }

  // For use in an array sort function, returns 1, -1 or 0 depending
  // on the value comparison
  compare(complexity) {
    if (this.hasValue() && complexity.hasValue())
      return this.rawValue - complexity.rawValue;
    if (this.hasValue())
      return -1;
    if (complexity.hasValue())
      return 1;
    return 0;
  }
}

module.exports = Complexity;
