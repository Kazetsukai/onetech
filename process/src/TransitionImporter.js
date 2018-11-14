"use strict";

const Transition = require('./Transition');

class TransitionImporter {
  constructor() {
    this.transitions = [];
  }

  importFromFile(content, filename) {
    const transition = new Transition(content, filename);
    // Ignore move transitions which don't change the target
    if (transition.move > 0 && transition.targetID == transition.newTargetID)
      return;
    this.transitions.push(transition);
  }

  splitCategories(categories) {
    const nonPatternCategories = categories.filter(c => !c.pattern);
    for (let category of nonPatternCategories) {
      this.splitCategory(category, "actorID", "newActorID", "newActorWeight");
      this.splitCategory(category, "targetID", "newTargetID", "newTargetWeight");
    }
    const patternCategories = categories.filter(c => c.pattern);
    for (let transition of this.transitions) {
      this.splitPatternCategories(transition, patternCategories);
    }
  }

  splitCategory(category, attr, newAttr, weightAttr) {
    const newTransitions = [];
    for (let transition of this.transitions) {
      if (transition[attr] == category.parentID || transition[newAttr] == category.parentID) {
        for (let id of category.objectIDs) {
          const newTransition = transition.clone();
          if (transition[attr] == category.parentID)
            newTransition[attr] = id;
          if (transition[newAttr] == category.parentID)
            newTransition[newAttr] = id;
          if (transition[newAttr] == category.parentID)
            newTransition[newAttr] = id;
          if (category.probSet) {
            newTransition[weightAttr] = category.objectWeight(id);
          }
          if (!this.findDuplicate(newTransition)) {
            newTransitions.push(newTransition);
          }
        }
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  // Pattern categories work differently than regular categories:
  // 1. The parentID is an actual object and should stick around
  // 2. A transition is only considered if all matching pattern
  //    categories have the same number of objectIDs
  // 3. For each objectID, a new transition is created which maps
  //    each other pattern category objectID to the new object
  splitPatternCategories(transition, patternCategories) {
    // if (transition.actorID == 2092 && transition.targetID == 1055)
    //   debugger;
    const attrs = ["actorID", "targetID", "newActorID", "newTargetID"];
    let categories = attrs.map(attr => {
      return patternCategories.find(c => c.parentID == transition[attr]);
    });
    if (categories.filter(c => c).length === 0) {
      return;
    }
    const count = categories.find(c => c).objectIDs.length;
    categories = categories.map(c => c && c.objectIDs.length == count && c);
    for (let i=0; i < count; i++) {
      const newTransition = transition.clone();
      for (let j=0; j < attrs.length; j++) {
        if (categories[j]) {
          newTransition[attrs[j]] = categories[j].objectIDs[i];
        }
      }
      if (!this.findDuplicate(newTransition)) {
        this.transitions.push(newTransition);
      }
    }
  }

  findDuplicate(newTransition) {
    return this.transitions.find(transition => {
      return transition.actorID == newTransition.actorID &&
        transition.targetID == newTransition.targetID &&
        transition.newActorID == newTransition.newActorID &&
        transition.newTargetID == newTransition.newTargetID &&
        transition.newActorID == newTransition.newActorID;
    });
  }

  // Generic transitions are played along with another successful transition of the same actor
  mergeGenericTransitions() {
    const newTransitions = [];
    for (let transition of this.transitions) {
      if (transition.isGeneric()) {
        this.mergeGenericTransition(transition, newTransitions);
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  mergeGenericTransition(transition, newTransitions) {
    const otherTransitions = this.transitions.filter(t => t.matchesGenericTransition(transition));

    if (otherTransitions.length == 0) {
      newTransitions.push(transition);
      return;
    }

    for (let otherTransition of otherTransitions) {
      // Clone last use transition since it doesn't always take effect
      if (transition.lastUseActor) {
        const newTransition = transition.clone();
        if (otherTransition.matchesGenericActor(transition)) {
          newTransition.targetID = otherTransition.targetID;
          newTransition.newTargetID = otherTransition.newTargetID;
          newTransition.targetRemains = otherTransition.targetRemains;
        } else {
          newTransition.targetID = newTransition.actorID;
          newTransition.newTargetID = newTransition.newActorID;
          newTransition.targetRemains = newTransition.tool;
          newTransition.actorID = otherTransition.actorID;
          newTransition.newActorID = otherTransition.newActorID;
          newTransition.tool = otherTransition.tool;
        }
        newTransitions.push(newTransition);
      } else if (otherTransition.matchesGenericActor(transition)) {
        otherTransition.newActorID = transition.newActorID;
        otherTransition.tool = transition.tool;
      } else {
        otherTransition.newTargetID = transition.newActorID;
        otherTransition.targetRemains = transition.tool;
      }
    }
  }

  mergeAttackTransitions() {
    const newTransitions = [];
    for (let transition of this.transitions) {
      if (transition.targetID === "0") {
        if (!transition.lastUseActor && !transition.lastUseTarget) {
          this.mergeAttackTransition(transition);
          newTransitions.push(transition);
        }
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
  }

  mergeAttackTransition(transition) {
    const lastUseActorTransition = this.transitions.find(t => t != transition && t.actorID == transition.actorID && t.lastUseActor);
    const lastUseTargetTransition = this.transitions.find(t => t != transition && t.actorID == transition.actorID && t.lastUseTarget);

    // Animal attack
    if (!lastUseTargetTransition) {
      if (transition.newTargetID === '0') {
        transition.newTargetID = '87'; // Fresh grave
      } else {
        transition.newExtraTargetID = '87'; // Fresh grave
      }
      transition.targetRemains = false;
      return;
    }

    // Murder attack
    transition.newActorID = (lastUseActorTransition || lastUseTargetTransition).newActorID;
    transition.newExtraTargetID = lastUseTargetTransition.newTargetID;
    transition.newTargetID = (lastUseActorTransition || transition).newTargetID;
    transition.tool = lastUseTargetTransition.tool;
    transition.targetRemains = lastUseTargetTransition.targetRemains;
  }

  addToObjects(objects) {
    for (let transition of this.transitions) {
      transition.addToObjects(objects);
    }
  }
}

module.exports = TransitionImporter;
