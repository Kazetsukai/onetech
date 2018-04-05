"use strict";

const Complexity = require('./Complexity');

class ComplexityCalculator {
  // Calculates the complexity starting with natural and uncraftable objects.
  calculate(objects) {
    for (var object of objects) {
      if (object.isNatural()) {
        this.setObjectComplexity(object, new Complexity({value: 1, calculated: true}));
      } else if (object.transitionsToward.length == 0) {
        this.setObjectComplexity(object, new Complexity({calculated: true})); // Uncraftable
      }
    }
    this.sortObjectTransitions(objects);
    this.reportUncalculated(objects.filter(o => !o.complexity.calculated));
  }

  // Sets the object complexity if it is lower than previously set
  // It then calculates the complexity for each "away" transition
  setObjectComplexity(object, complexity) {
    if (!object.complexity.calculated || complexity.compare(object.complexity) < 0) {
      object.complexity = complexity;
      for (var transition of object.transitionsAway) {
        this.calculateTransition(transition);
      }
    }
  }

  // Calculates the transition complexity by combining the actor and target complexities
  // Tools are no counted toward complexity if used in previous complexity
  // If the complexity was calculated, it sets it to the resulting object
  calculateTransition(transition) {
    const actorComplexity = transition.actor && transition.actor.complexity;
    const targetComplexity = transition.target && transition.target.complexity;

    if (!actorComplexity || !targetComplexity) {
      transition.complexity = (actorComplexity || targetComplexity).increment();

    } else if (actorComplexity.tools.includes(transition.target)) {
      transition.complexity = actorComplexity.increment();

    } else if (targetComplexity.tools.includes(transition.actor)) {
      transition.complexity = targetComplexity.increment();

    } else if (actorComplexity.calculated && targetComplexity.calculated) {
      transition.complexity = actorComplexity.combine(targetComplexity)

      if (transition.newActor && transition.newActor.complexity.calculated)
        transition.complexity.addTool(transition.newActor);
      if (transition.newTarget && transition.newTarget.complexity.calculated)
        transition.complexity.addTool(transition.newTarget);
    }

    if (transition.complexity.calculated) {
      if (transition.newActor && !transition.tool)
        this.setObjectComplexity(transition.newActor, transition.complexity);
      if (transition.newTarget && !transition.targetRemains)
        this.setObjectComplexity(transition.newTarget, transition.complexity);
    }
  }

  reportUncalculated(objects) {
    for (var object of objects) {
      console.log(object.id, object.name, "- Unable to calculate complexity");
    }
  }

  sortObjectTransitions(objects) {
    for (var object of objects) {
      object.transitionsToward.sort((a,b) => a.complexity.compare(b.complexity));
      object.transitionsAway.sort((a,b) => a.complexity.compare(b.complexity));
    }
  }
}

module.exports = ComplexityCalculator;
