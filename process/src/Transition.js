"use strict";

const Complexity = require('./Complexity');

class Transition {
  constructor(dataText, filename) {
    this.complexity = new Complexity({});
    this.parseFilename(filename);
    this.parseData(dataText);
  }

  parseFilename(filename) {
    const parts = filename.split('.')[0].split('_');
    this.lastUseActor = (parts[2] === 'LA');
    this.lastUseTarget = (parts[2] === 'LT' || parts[2] === 'L');
    this.actorID = parts[0];
    this.targetID = parts[1];
  }

  parseData(dataText) {
    const data = dataText.split(' ');

    this.newActorID = data[0] || 0;
    this.newTargetID = data[1] || 0;
    this.autoDecaySeconds = data[2] || 0;
    this.actorMinUseFraction = data[3] || 0;
    this.targetMinUseFraction = data[4] || 0;
    this.reverseUseActor = !!data[5];
    this.reverseUseTarget = !!data[6];
    this.move = data[7] || 0;
    this.desiredMoveDist = data[8] || 1;

    this.epochAutoDecay = this.autoDecaySeconds < 0 ? -this.autoDecaySeconds : 0;
    this.hand = this.actorID == 0;
    this.tool = this.actorID >= 0 && this.actorID == this.newActorID;
    this.targetRemains = this.targetID >= 0 && this.targetID == this.newTargetID;

    if (this.autoDecaySeconds > 0)
      this.decay = this.autoDecaySeconds + "s";
    if (this.epochAutoDecay > 0)
      this.decay = this.epochAutoDecay + "h";
  }

  addToObjects(objects) {
    // Ignore transitions which only effect one object
    if (!this.hasMultipleObjects()) return;

    if (this.target = objects[this.targetID]) {
      this.addToObject(this.target, true, objects);
    }
    if (this.actor = objects[this.actorID]) {
      if (this.actor != this.target) {
        this.addToObject(this.actor, true, objects);
      }
    }

    if (this.newTarget = objects[this.newTargetID]) {
      // Hide new target if target hasn't changed
      if (!this.targetRemains)
        this.addToObject(this.newTarget, false, objects);
    }
    if (this.newActor = objects[this.newActorID]) {
      // Hide new actor if actor hasn't changed
      if (!this.tool && this.newActor != this.newTarget)
        this.addToObject(this.newActor, false, objects);
    }
  }

  addToObject(object, away, objects) {
    if (object.category) {
      this.addToCategory(object.category, away, objects);
    }
    if (away) {
      object.transitionsAway.push(this);
    } else {
      object.transitionsToward.push(this);
    }
  }

  addToCategory(category, away, objects) {
    for (var object of category.objects) {
      const transition = this.clone();
      transition.replaceObjectID(category.parentID, object.id);
      transition.addToObjects(objects);
    }
  }

  replaceObjectID(oldID, newID) {
    if (this.targetID == oldID)    this.targetID = newID;
    if (this.actorID == oldID)     this.actorID = newID;
    if (this.newTargetID == oldID) this.newTargetID = newID;
    if (this.newActorID == oldID)  this.newActorID = newID;
  }

  hasMultipleObjects() {
    if (this.actorID > 0 && this.targetID > 0 && this.actorID != this.targetID)
      return true;
    if (this.actorID > 0 && this.newActorID > 0 && this.actorID != this.newActorID)
      return true;
    if (this.targetID > 0 && this.newTargetID > 0 && this.targetID != this.newTargetID)
      return true;
    if (this.newActorID > 0 && this.newTargetID > 0 && this.newActorID != this.newTargetID)
      return true;
    return false;
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  jsonData() {
    return {
      actorID: this.actor && this.actor.id,
      targetID: this.target && this.target.id,
      newActorID: this.newActor && this.newActor.id,
      newTargetID: this.newTarget && this.newTarget.id,
      targetNumUses: this.target && this.target.data.numUses,
      targetRemains: this.targetRemains,
      hand: this.hand,
      tool: this.tool,
      decay: this.decay
    }
  }
}

module.exports = Transition;
