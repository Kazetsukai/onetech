"use strict";

const Complexity = require('./Complexity');

class ComplexityCalculator {
  // Calculates the complexity for the given objects.
  calculate(objects) {
    for (var object of objects) {
      if (object.isNatural()) {
        this.setObjectComplexity(object, new Complexity({value: 1, calculated: true}));
      } else if (object.transitionsToward.length == 0) {
        this.setObjectComplexity(object, new Complexity({calculated: true})); // Uncraftable
      }
    }
    this.reportUncalculated(objects.filter(o => !o.complexity.calculated));
  }

  // Sets the complexity value, marks it as calculated, and attempts
  // to calculate the transition, queuing the result if calculated
  setObjectComplexity(object, complexity) {
    if (!object.complexity.calculated || complexity.compare(object.complexity) < 0) {
      // if (object.data.id == '445') debugger;
      object.complexity = complexity;
      for (var transition of object.transitionsAway) {
        this.calculateTransition(transition);
      }
    }
  }

  // Calculates the transition complexity by combining the actor and target complexities
  calculateTransition(transition) {
    const actorComplexity = transition.actor && transition.actor.complexity;
    const targetComplexity = transition.target && transition.target.complexity;

    if (!actorComplexity || !targetComplexity) {
      transition.complexity = actorComplexity || targetComplexity;
    } else if (actorComplexity.tools.includes(transition.target)) {
      transition.complexity = actorComplexity;
    } else if (targetComplexity.tools.includes(transition.actor)) {
      transition.complexity = targetComplexity;
    } else if (actorComplexity.calculated && targetComplexity.calculated) {
      transition.complexity = actorComplexity.combine(targetComplexity)
      if (transition.tool)
        transition.complexity.addTool(transition.actor);
      if (transition.targetRemains)
        transition.complexity.addTool(transition.target);
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
      console.log(object.data.id, object.data.name, "- Unable to calculate complexity");
    }
  }
}

module.exports = ComplexityCalculator;
