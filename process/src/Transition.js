"use strict";

class Transition {
  constructor(dataText, filename) {
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
    if (this.move != 0) return; // Ignore move transitions

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
      transition.replaceObjectID(category.parentID, object.data.id);
      transition.addToObjects(objects);
    }
  }

  replaceObjectID(oldID, newID) {
    if (this.targetID == oldID)    this.targetID = newID;
    if (this.actorID == oldID)     this.actorID = newID;
    if (this.newTargetID == oldID) this.newTargetID = newID;
    if (this.newActorID == oldID)  this.newActorID = newID;
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  data() {
    return {
      actor: this.objectData(this.actor),
      target: this.objectData(this.target),
      newActor: this.objectData(this.newActor),
      newTarget: this.objectData(this.newTarget),
      targetRemains: this.targetRemains,
      hand: this.hand,
      tool: this.tool,
      decay: this.decay
    }
  }

  objectData(object) {
    if (object) return object.simpleData();
  }

  calculateComplexity(parentObjects) {
    if (this.complexity) return this.complexity;
    const actorComplexity = this.actor ? this.actor.calculateComplexity(parentObjects) : 0;
    const targetComplexity = this.target ? this.target.calculateComplexity(parentObjects) : 0;
    if (actorComplexity == -1 || targetComplexity == -1) {
      return -1;
    } else if (actorComplexity !== null && targetComplexity !== null) {
      this.complexity = actorComplexity + targetComplexity;
      return this.complexity;
    } else {
      return null; // Uncraftable
    }
  }
}

module.exports = Transition;
