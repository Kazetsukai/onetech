"use strict";

// Complexity is the number of steps needed to craft an object
// Natural objects have a complexity of 1
// Uncraftable objects have null complexity
class Complexity {
  constructor({ calculated, value, tools }) {
    this.calculated = calculated || false;
    this.value = value;
    this.tools = tools || [];
  }

  // Returns a new complexity by adding the values of the two
  combine(complexity) {
    const newComplexity = new Complexity({});
    if (this.value && complexity.value)
      newComplexity.value = this.value + complexity.value;
    newComplexity.calculated = this.calculated && complexity.calculated;
    newComplexity.tools = this.tools.concat(complexity.tools);
    return newComplexity;
  }

  addTool(tool) {
    if (!this.tools.includes(tool)) this.tools.push(tool);
  }

  // For use in an array sort function, returns 1, -1 or 0 depending
  // on the value comparison
  compare(complexity) {
    if (this.value == complexity.value) {
      return 0;
    }
    if (!complexity.value || this.value && this.value < complexity.value) {
      return -1;
    }
    return 1;
  }
}

module.exports = Complexity;
