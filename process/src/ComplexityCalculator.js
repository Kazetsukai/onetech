"use strict";

const Complexity = require('./Complexity');

class ComplexityCalculator {
  // Calculates the complexity starting with natural objects.
  calculate(objects) {
    for (var object of objects) {
      if (object.isNatural())
        this.setObjectComplexity(object, new Complexity({value: 0}));
    }
    this.sortObjectTransitions(objects);
    this.calculateDifficulty(objects);
    this.reportMissing(objects);
  }

  // Sets the object complexity if it is lower than previously set
  // It then calculates the complexity for each "away" transition
  setObjectComplexity(object, complexity) {
    if (!object.complexity.hasValue() || complexity.compare(object.complexity) < 0) {
      console.log("Complexity set for", object.id, object.name, "to", complexity.value());
      object.complexity = complexity;

      // Favor transitions where the actor or target remains
      // Otherwise we get broken tools as the easiest transition
      // const transitions = object.transitionsAway.sort((a, b) => (a.tool || a.targetRemains) ? -1 : 1);
      for (var transition of object.transitionsAway) {
        this.calculateTransition(transition);
      }
    }
  }

  // Calculates the transition complexity by combining the actor and target complexities
  // Tools are not counted toward complexity if used in previous complexity
  // If the complexity was calculated, it sets it to the resulting object
  calculateTransition(transition) {
    if (transition.actor && !transition.actor.complexity.hasValue())
      return;
    if (transition.target && !transition.target.complexity.hasValue())
      return;

    if (transition.actorID == '127' && transition.targetID == '231')
      debugger;
    const complexity = new Complexity({value: transition.isLastUse() ? 2 : 1})
    complexity.addTransitionObjects(transition);

    transition.complexity = complexity;

    if (transition.newActor) {
      const actorComplexity = complexity.cloneWithUnusedTool(transition.newTarget);
      this.setObjectComplexity(transition.newActor, actorComplexity);
    }

    if (transition.newTarget) {
      const targetComplexity = complexity.cloneWithUnusedTool(transition.newActor);
      this.setObjectComplexity(transition.newTarget, targetComplexity);
    }
  }

  sortObjectTransitions(objects) {
    for (var object of objects) {
      object.transitionsToward.sort((a,b) => a.complexity.compare(b.complexity));
      object.transitionsAway.sort((a,b) => a.complexity.compare(b.complexity));
    }
  }

  calculateDifficulty(objects) {
    const complexities = objects.map(o => o.complexity).filter(c => c.rawValue > 0).sort((a,b) => a.compare(b));
    for (let i in complexities) {
      complexities[i].difficulty = parseFloat(i) / complexities.length;
    }
  }

  reportMissing(allObjects) {
    const objects = allObjects.filter(o => !o.complexity.hasValue() && !o.category);
    console.log(objects.length + " objects are missing complexity");
    // for (var object of objects) {
    //   console.log(object.id, object.name, "unable to calculate complexity");
    // }
  }
}

module.exports = ComplexityCalculator;
