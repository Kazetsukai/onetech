"use strict";

// Depth is the deepest number of steps needed to craft an object
// Natural and uncraftable objects have a depth of 0
class Depth {
  constructor({ value, difficulty, craftable }) {
    this.calculated = !isNaN(value);
    this.value = value || 0;
    this.difficulty = difficulty || 0;
    this.craftable = craftable;
  }

  addTransition(transition) {
    this.addObject(transition.actor);
    this.addObject(transition.target);
    this.value++;
    if (transition.decay) {
      return; // Don't add difficulty on decay transitions
    }
    if (!transition.actor || !transition.target) {
      this.difficulty += transition.playerActor ? 1 : 0;
    } else if (transition.tool || transition.targetRemains) {
      this.difficulty += transition.isLastUse() ? 3 : 2;
    } else {
      this.difficulty += 4;
    }
  }

  addObject(object) {
    if (!object) return;
    this.calculated = this.calculated && object.depth.calculated;
    this.craftable = this.craftable && object.depth.craftable;
    this.value = Math.max(this.value, object.depth.value);
    this.difficulty += object.depth.difficulty;
  }

  clone() {
    return new Depth({
      value: this.value,
      difficulty: this.difficulty,
      craftable: this.craftable,
    });
  }

  // Sorts based on priority: calculated, craftable, value, difficulty
  compare(depth) {
    if (this.calculated == depth.calculated) {
      if (this.craftable == depth.craftable) {
        if (this.value == depth.value) {
          return this.difficulty - depth.difficulty;
        }
        return this.value - depth.value;
      }
      if (this.craftable)
        return -1;
      if (depth.craftable)
        return 1;
      return 0;
    }
    if (this.calculated)
      return -1;
    if (depth.calculated)
      return 1;
    return 0;
  }
}

module.exports = Depth;
