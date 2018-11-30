"use strict";

// Depth is the number of steps needed to craft an object
// Natural objects have a depth of 0
// Uncraftable objects have null depth
class Depth {
  constructor({ value, difficulty }) {
    this.value = value;
    this.difficulty = difficulty || value;
  }

  addTransition(transition) {
    this.addObject(transition.actor);
    this.addObject(transition.target);
    this.value++;
    if (transition.decay)
      return; // Don't add difficulty on decay transitions
    if (!transition.actor || !transition.target)
      this.difficulty += transition.playerActor ? 1 : 0;
    else if (transition.tool || transition.targetRemains)
      this.difficulty += transition.isLastUse() ? 3 : 2;
    else
      this.difficulty += 4;
  }

  addObject(object) {
    if (!object) return;
    if (!this.hasValue() || !object.depth.hasValue())
      throw "Unable to add null object depths together";
    this.value = Math.max(this.value, object.depth.value);
    this.difficulty += object.depth.difficulty;
  }

  clone() {
    return new Depth({
      value: this.value,
      difficulty: this.difficulty,
    });
  }

  hasValue() {
    return this.value > 0 || this.value === 0;
  }

  // For use in an array sort function, returns 1, -1 or 0 depending
  // on the value comparison
  compare(depth) {
    if (this.hasValue() && depth.hasValue()) {
      if (this.value == depth.value)
        return this.difficulty - depth.difficulty;
      return this.value - depth.value;
    }
    if (this.hasValue())
      return -1;
    if (depth.hasValue())
      return 1;
    return 0;
  }
}

module.exports = Depth;
