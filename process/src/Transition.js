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
    this.reverseUseActor = data[5] == '1';
    this.reverseUseTarget = data[6] == '1';
    this.move = data[7] || 0;
    this.desiredMoveDist = data[8] || 1;

    this.fixAttack();

    this.hand = this.actorID == 0;
    this.tool = this.actorID >= 0 && this.actorID == this.newActorID;
    this.targetRemains = this.targetID >= 0 && this.targetID == this.newTargetID;

    this.decay = this.calculateDecay();
  }

  calculateDecay() {
    if (this.autoDecaySeconds < 0)
      return -this.autoDecaySeconds + "h";
    if (this.autoDecaySeconds > 0 && this.autoDecaySeconds % 60 == 0)
      return this.autoDecaySeconds/60 + "m";
    if (this.autoDecaySeconds > 0)
      return this.autoDecaySeconds + "s";
  }

  addToObjects(objects) {
    this.target = objects[this.targetID];
    this.actor = objects[this.actorID];
    this.newTarget = objects[this.newTargetID];
    this.newActor = objects[this.newActorID];

    if (this.isUnimportant()) return;

    // Only add to the first category since the other
    // categories will be added to recursively
    if (this.firstCategory()) {
      this.addToCategory(this.firstCategory(), objects);
      return;
    }

    if (this.target)
      this.target.transitionsAway.push(this)

    if (this.actor && this.actor != this.target)
      this.actor.transitionsAway.push(this)

    if (this.newTarget && !this.targetRemains)
      this.newTarget.transitionsToward.push(this)

    if (this.newActor && !this.tool && this.newActor != this.newTarget)
      this.newActor.transitionsToward.push(this)
  }

  firstCategory() {
    const objects = [this.target, this.actor, this.newTarget, this.newActor];
    for (let object of objects) {
      if (object && object.category)
        return object.category;
    }
  }

  addToCategory(category, objects) {
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

  fixAttack() {
    // Check for attack transition and replace target with fresh grave
    if (this.targetID == 0 && this.newTargetID == 0 && this.actorID != this.newActorID)
      this.newTargetID = '87'; // Fresh Grave
  }

  isUnimportant() {
    // Ignore transitions which don't have a target and the actors have categories
    // This is a bit of a hack to remove the empty/full water bowl transitions
    if (this.targetID <= 0 && this.newTargetID <= 0 && this.actor && this.actor.data.numUses <= 1 && this.actor.categories.length > 0 && this.newActor && this.newActor.categories.length > 0)
      return true;

    // Ignore move transitions which don't change the target
    if (this.move > 0 && this.targetID == this.newTargetID)
      return true;

    // Ignore weapon transitions that don't result in a grave
    if (this.targetID == 0 && this.actor && this.actor.data.deadlyDistance > 0 && this.newTarget && !this.newTarget.isGrave())
      return true;

    return false;
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  jsonData() {
    const result = {}

    if (this.actor) {
      result.actorID = this.actor.id;
      if (this.actor.data.numUses > 1) {
        if (this.lastUseActor)
          result.actorUses = this.reverseUseActor ? "max" : "last";
        else if (this.tool)
          result.newActorUses = this.reverseUseActor ? "+1" : "-1";
      }
    }

    if (this.target) {
      result.targetID = this.target.id;
      if (this.target.data.numUses > 1) {
        if (this.lastUseTarget)
          result.targetUses = this.reverseUseTarget ? "max" : "last";
        else if (this.targetRemains)
          result.newTargetUses = this.reverseUseTarget ? "+1" : "-1";
      }
    }

    if (this.newActor)
      result.newActorID = this.newActor.id;

    if (this.newTarget)
      result.newTargetID = this.newTarget.id;

    if (this.targetID == 0 || this.targetID == -1 && this.actor.data.foodValue > 0)
      result.targetPlayer = true;

    if (this.targetRemains)
      result.targetRemains = true;

    if (this.hand)
      result.hand = true;

    if (this.tool)
      result.tool = true;

    if (this.decay)
      result.decay = this.decay;

    return result;
  }
}

module.exports = Transition;
