"use strict";

const Transition = require('./Transition');

class TransitionImporter {
  constructor() {
    this.transitions = [];
  }

  importFromFile(content, filename) {
    const transition = new Transition(content, filename);
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
    this.cleanUpPatternCategories(patternCategories);
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
    // if (transition.actorID == 2900 && transition.targetID == 733)
    //   debugger;
    const attrs = ["actorID", "targetID", "newActorID", "newTargetID"];
    let categories = attrs.map(attr => {
      return patternCategories.find(c => c.parentID == transition[attr]);
    });
    if (categories.slice(0, 2).filter(c => c).length === 0) {
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

  // Remove transitions where pattern category parent is an actual category object
  cleanUpPatternCategories(patternCategories) {
    const categories = patternCategories.filter(c => c.parent && c.parent.isCategory());
    for (let category of categories) {
      this.transitions = this.transitions.filter(transition => {
        return transition.actorID != category.parentID
          && transition.targetID != category.parentID
          && transition.newActorID != category.parentID
          && transition.newTargetID != category.parentID;
      });
    }
  }

  findDuplicate(newTransition) {
    return this.transitions.find(transition => {
      if (newTransition.newActorWeight || newTransition.newTargetWeight) {
        return transition.actorID == newTransition.actorID &&
          transition.targetID == newTransition.targetID &&
          transition.newActorID == newTransition.newActorID &&
          transition.newTargetID == newTransition.newTargetID;
      }
      return transition.actorID == newTransition.actorID &&
        transition.targetID == newTransition.targetID &&
        transition.lastUseActor == newTransition.lastUseActor &&
        transition.lastUseTarget == newTransition.lastUseTarget;
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
    if (!lastUseActorTransition && !lastUseTargetTransition) {
      if (transition.newTargetID === '0') {
        transition.newTargetID = '87'; // Fresh grave
        transition.targetRemains = false;
      } else {
        transition.newExtraTargetID = '87'; // Fresh grave
      }
      return;
    }

    transition.newExtraTargetID = (lastUseTargetTransition || transition).newTargetID;
    transition.newActorID = (lastUseActorTransition || lastUseTargetTransition).newActorID;
    transition.newTargetID = (lastUseActorTransition || lastUseTargetTransition).newTargetID;
    transition.tool = transition.actorID >= 0 && transition.actorID == transition.newActorID;
    transition.targetRemains = transition.targetID >= 0 && transition.targetID == transition.newTargetID;
  }

  newDecayTransition(targetID, newTargetID, decaySeconds) {
    return new Transition(`0 ${newTargetID} ${decaySeconds}`, `-1_${targetID}.txt`);
  }

  // The proposed property fence needs transitions added for all directions.
  // Only "+horizontalA" transition is included so we should duplicate this
  // for the other directions.
  addDirectionalTransitions(objects) {
    const directions = ["+cornerA", "+verticalA"];
    const horizontalObjects = Object.values(objects).filter(o => o.name.match(/\+horizontalA\b/));
    for (let horizontalObject of horizontalObjects) {
      for (let direction of directions) {
        const otherName = horizontalObject.name.replace("+horizontalA", direction);
        const otherObject = Object.values(objects).find(o => o.name === otherName);
        if (otherObject) {
          // console.log(`Copying transitions from ${horizontalObject.name} to ${otherObject.name}`);
          this.copyTransitionsToward(horizontalObject.id, otherObject.id);
        } else {
          console.log(`Unable to find object with name ${otherName} in addDirectionalTransitions`);
        }
      }
    }
  }

  // Since this only sets the ID it should be done before addToObjects
  copyTransitionsToward(oldObjectID, newObjectID) {
    const transitions = this.transitions.filter(t => t.newActorID == oldObjectID || t.newTargetID == oldObjectID || t.newExtraTargetID == oldObjectID);
    for (let transition of transitions) {
      const newTransition = transition.clone();
      if (newTransition.newActorID == oldObjectID) {
        newTransition.newActorID = newObjectID;
      }
      if (newTransition.newTargetID == oldObjectID) {
        newTransition.newTargetID = newObjectID;
      }
      if (newTransition.newExtraTargetID == oldObjectID) {
        newTransition.newExtraTargetID = newObjectID;
      }
      this.transitions.push(newTransition);
    }
  }

  addToObjects(objects) {
    for (let transition of this.transitions) {
      transition.addToObjects(objects);
    }
  }

  // Global triggers have a name like ">global1" and will
  // cause a transition somewhere else on the map.
  // They have an "away" transition for the receiver, but no
  // "towards" transition. This looks for a transmitter which
  // has "*global1" in the name and adds this as an extra object
  addGlobalTriggers(objects) {
    const triggers = Object.values(objects).filter(o => o.isGlobalTrigger());
    for (let trigger of triggers) {
      const transmitterName = trigger.transmitterName();
      const transmitters = Object.values(objects).filter(o => o.name.includes(transmitterName));
      for (let transmitter of transmitters) {
        for (let transition of transmitter.transitionsToward) {
          transition.newExtraTargetID = trigger.id;
          transition.addToObjects(objects);
        }
      }
    }
  }
}

module.exports = TransitionImporter;
