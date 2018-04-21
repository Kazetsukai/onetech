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
    const transitions = this.transitions.filter(t => t.actorID == transition.actorID && t != transition);
    const toolTransitions = transitions.filter(t => t.tool);

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

    // const missingNewActor = transitions.filter(t => !t.newActorID);

    // // Keep this transition if no other transitions to merge into
    // if (transitions.length == 0) {
    //   newTransitions.push(transition);
    //   return;
    // }

    // // Set this as the new actor on tool transitions
    // const toolTransitions = transitions.filter(t => t.tool);
    // if (toolTransitions.length > 0) {
    //   for (let otherTransition of toolTransitions) {
    //     otherTransition.newActorID = transition.newActorID;
    //     otherTransition.tool = transition.tool;
    //     otherTransition.lastUse = transition.tool;
    //     // No need to push onto newTransitions since it will be pushed outside this
    //   }
    //   return;
    // }

    // // Looks like all transitions have a newActorID already so have to
    // // create a new transition replacing the newActor with this one
    // // We should technically duplicate all transitions but that will
    // // make too many (unless we change how we display them)
    // const newTransition = transitions[0].clone();
    // newTransition.newActorID = transition.newActorID;
    // newTransitions.push(newTransition);
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
