"use strict";

const Depth = require('./Depth');

class DepthCalculator {
  // Calculates the depth starting with natural objects.
  calculate(objects) {
    for (var object of objects) {
      if (object.isNatural())
        this.setObjectDepth(object, new Depth({value: 0}));
    }
    this.sortObjectTransitions(objects);
    this.calculateDifficulty(objects);
    this.reportMissing(objects);
  }

  // Sets the object depth if it is lower than previously set
  // It then calculates the depth for each "away" transition
  setObjectDepth(object, depth) {
    if (!object.depth.hasValue() || depth.compare(object.depth) < 0) {
      // console.log("Depth set for", object.id, object.name, "to", depth.value);
      object.depth = depth;

      // Favor transitions where the actor or target remains
      // Otherwise we get broken tools as the easiest transition
      // const transitions = object.transitionsAway.sort((a, b) => (a.tool || a.targetRemains) ? -1 : 1);
      for (var transition of object.transitionsAway) {
        this.calculateTransition(transition);
      }
    }
  }

  // Calculates the transition depth by finding max of actor and target depths
  // If the depth was calculated, it sets it to the resulting object
  calculateTransition(transition) {
    if (transition.actor && !transition.actor.depth.hasValue())
      return;
    if (transition.target && !transition.target.depth.hasValue())
      return;

    const depth = new Depth({value: 0})
    depth.addTransition(transition);
    transition.depth = depth;

    if (transition.newActor)
      this.setObjectDepth(transition.newActor, depth);
    if (transition.newTarget)
      this.setObjectDepth(transition.newTarget, depth);
  }

  sortObjectTransitions(objects) {
    for (let object of objects) {
      object.transitionsToward.sort((a,b) => a.depth.compare(b.depth));
      object.transitionsAway.sort((a,b) => a.depth.compare(b.depth));
    }
  }

  calculateDifficulty(objects) {
    const depths = objects.map(o => o.depth).filter(c => c.difficulty > 0).sort((a,b) => a.difficulty - b.difficulty);
    for (let i in depths) {
      depths[i].difficulty = parseFloat(i) / depths.length;
    }
  }

  reportMissing(allObjects) {
    const objects = allObjects.filter(o => !o.depth.hasValue() && o.isVisible());
    console.log(objects.length + " objects are missing depth");
    // for (var object of objects) {
    //   console.log(object.id, object.name, "unable to calculate depth");
    // }
  }
}

module.exports = DepthCalculator;
