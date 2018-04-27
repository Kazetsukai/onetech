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
    for (let category of categories) {
      this.splitCategory(category);
    }
  }

  splitCategory(category) {
    const newTransitions = [];
    for (let transition of this.transitions) {
      if (transition.hasID(category.parentID)) {
        for (let id of category.objectIDs) {
          const newTransition = transition.clone();
          newTransition.replaceID(category.parentID, id);
          newTransitions.push(newTransition);
        }
      } else {
        newTransitions.push(transition);
      }
    }
    this.transitions = newTransitions;
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
    const toolTransitions = this.transitions.filter(t => t != transition && t.actorID == transition.actorID && t.tool && t.targetID > 0);

    if (toolTransitions.length == 0) {
      newTransitions.push(transition);
      return;
    }

    for (let otherTransition of toolTransitions) {
      // Clone last use transition since it doesn't always take effect
      if (transition.lastUseActor) {
        const newTransition = transition.clone();
        newTransition.targetID = otherTransition.targetID;
        newTransition.newTargetID = otherTransition.newTargetID;
        newTransition.targetRemains = otherTransition.targetRemains;
        newTransitions.push(newTransition);
      } else {
        otherTransition.newActorID = transition.newActorID;
        otherTransition.tool = transition.tool;
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
    const lastUseTransition = this.transitions.find(t => t != transition && t.actorID == transition.actorID && t.lastUseTarget);

    // Animal attack
    if (!lastUseTransition) {
      if (transition.newTargetID === '0') {
        transition.newTargetID = '87'; // Fresh grave
        transition.targetRemains = false;
      }
      return;
    }

    // Murder attack
    transition.newActorID = lastUseTransition.newActorID;
    transition.newExtraTargetID = transition.newTargetID;
    transition.newTargetID = lastUseTransition.newTargetID;
    transition.tool = lastUseTransition.tool;
    transition.targetRemains = lastUseTransition.targetRemains;
  }

  addToObjects(objects) {
    for (let transition of this.transitions) {
      transition.addToObjects(objects);
    }
  }
}

module.exports = TransitionImporter;
