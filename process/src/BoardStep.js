"use strict";

class BoardStep {
  constructor(node, depth, maxDepth) {
    this.node = node;
    this.depth = depth;
    if (depth > maxDepth) {
      this.children = [];
    } else {
      this.children = this.generateChildren(maxDepth);
    }
  }

  generateChildren(maxDepth) {
    return this.node.uniqueChildren().
      sort((a,b) => b.subNodes().length - a.subNodes().length).
      map(node => new BoardStep(node, this.depth + 1, maxDepth));
  }

  // simpleChainLength(length) {
  //   if (this.children.length !== 1) {
  //     return length;
  //   }
  //   return this.children[0].simpleChainLength(length + 1);
  // }

  // nextStep(maxDepth) {
  //   if (this.children.length === 0) {
  //     return;
  //   }

  //   if (this.children.length === 1) {
  //     return this.nextSimpleStep(rootStep, maxDepth);
  //   }

  //   return this.nextComplexStep(rootStep, maxDepth);
  // }

  // nextSimpleStep(rootStep, maxDepth) {
  //   const step = this.children[0];

  //   // Always show more than one step
  //   if (this.depth === 0) {
  //     return step;
  //   }

  //   if (step.weight(rootStep, maxDepth) < 1.5) {
  //     return step;
  //   }
  // }

  // // Higher weight means more likely to be last step
  // weight(rootStep, maxDepth) {
  //   let weight = 0;
  //   weight += this.depth/maxDepth;

  //   // Break at objects with a lot of transitions
  //   weight += 10/Math.min(this.node.object.transitionsAway.length, 10);

  //   // Break based on depth from root step
  //   weight += 1.0 - this.node.object.depth.value/rootStep.node.object.depth.value;

  //   return weight;
  // }

  // nextComplexStep(rootStep, maxDepth) {
  //   const steps = this.sortedChildren(maxDepth);
  //   const step = steps[0];

  //   // Always show more than one step
  //   if (this.depth === 0) {
  //     return step;
  //   }

  //   // See if we can go through the simple chain
  //   if (this.depth + step.simpleChainLength(0) > maxDepth) {
  //     return;
  //   }



  //   let weight = 0;
  //   weight += this.depth/maxDepth;

  //   // Break at commonly used objects
  //   weight += Math.min(...children.map(c => c.weight(rootStep, maxDepth)));

  //   // Break at commonly used objects
  //   weight += Math.max(...children.map(c => c.commonality()));

  //   // Break at commonly used objects
  //   let commonality = step.node.object.transitionsAway.length;
  //   if (this.depth + commonality*2 > maxDepth) {
  //     return;
  //   }

  //   return step;
  // }

  // preferredChild(maxDepth) {
  //   if (this.depth > maxDepth/2) {
  //     return this.children.sort((a,b) => a.object.transitionsAway.length - b.object.transitionsAway.length);
  //   }
  //   return this.node.immediateUniqueChildren().filter(n => !n.isLast()).
  //     sort((a,b) => a.object.transitionsAway.length - b.object.transitionsAway.length).
  //     sort((a,b) => b.subNodes().length - a.subNodes().length)[0];
  // }

  // sortedChildren(maxDepth) {
  //   // Prefer children with fewer transitions when we are closer to max depth
  //   if (this.depth > maxDepth/2) {
  //     return this.children.sort((a,b) => b.commonality() - a.commonality());
  //   }
  //   // Otherwise prefer more complex children
  //   return this.children.sort((a,b) => b.subNodes().length - a.subNodes().length);
  // }

  // // Weight determines where the recipe should stop
  // // A higher weight means it should more likely stop
  // generateWeight(maxDepth) {
  //   let weight = 0;

  //   // A node with two complex branches should likely stop
  //   const complexChildren = this.node.children.filter(c => !c.isLast());
  //   if (complexChildren.length > 1) {
  //     weight += 10;
  //   }

  //   // A node with children which have more uses should likely stop
  //   for (let child of complexChildren) {
  //     weight += Math.min(child.object.transitionsAway.length, 10);
  //   }

  //   // Try not to stop on decay transitions
  //   if (this.node.transition && this.node.transition.decay) {
  //     weight -= 5;
  //   }

  //   // Use a sine wave to favor steps in the middle
  //   // Probably a better way to do this
  //   let depthFraction = Math.max(this.depth/maxDepth, 1);
  //   let depthWeight = Math.abs(Math.abs(Math.sin(Math.PI*(depthFraction - 0.5))) - 1);
  //   depthWeight += (1.0-depthWeight) / 2; // Round sine wave
  //   depthWeight -= 0.2; // Favor earlier items slightly

  //   return weight * depthWeight;
  // }

  // otherNodes() {
  //   return this.node.children.filter(child => child != this.nextNode);
  // }

  jsonData() {
    const node = this.node;
    const data = {id: this.node.object.id};

    if (node.isLast() || !node.transition) {
      data.last = true;
      return data;
    }

    if (this.children.length === 0 || node.uniqueParents().length > 1) {
      data.last = true;
      data.relevant = true;
      return data;
    }

    data.nextId = this.children[0].node.object.id;

    const transition = node.transition;
    if (transition.actor) {
      const actorStep = this.children.find(c => c.node.object == transition.actor);
      if (actorStep) {
        data.actor = actorStep.jsonData();
      }
    }
    if (transition.target) {
      const targetStep = this.children.find(c => c.node.object == transition.target);
      if (targetStep) {
        data.target = targetStep.jsonData();
      }
    }
    if (node.decaySeconds) {
      data.decay = transition.calculateDecay(node.decaySeconds);
    } else if (transition.decay) {
      data.decay = transition.decay;
    }
    if (transition.hand()) {
      data.hand = true;
    }
    if (transition.targetsPlayer()) {
      data.targetPlayer = true;
    }

    return data;
  }
}

module.exports = BoardStep;
