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
    this.actor = objects[this.actorID];
    this.target = objects[this.targetID];
    this.newActor = objects[this.newActorID];
    this.newTarget = objects[this.newTargetID];
    this.newExtraTarget = objects[this.newExtraTargetID];

    if (this.actor)
      this.actor.transitionsAway.push(this);

    if (this.target && this.target != this.actor)
      this.target.transitionsAway.push(this);

    if (this.newActor && !this.tool)
      this.newActor.transitionsToward.push(this);

    if (this.newTarget && !this.targetRemains && (this.newTarget != this.newActor || !this.tool))
      this.newTarget.transitionsToward.push(this);

    if (this.newExtraTarget)
      this.newExtraTarget.transitionsToward.push(this);
  }


  hasID(id) {
    return this.targetID == id || this.actorID == id || this.newTargetID == id || this.newActorID == id;
  }

  replaceID(oldID, newID) {
    if (this.targetID == oldID)    this.targetID = newID;
    if (this.actorID == oldID)     this.actorID = newID;
    if (this.newTargetID == oldID) this.newTargetID = newID;
    if (this.newActorID == oldID)  this.newActorID = newID;
  }

  isGeneric() {
    return this.targetID === '-1' && this.newTargetID === '0' && this.actorID != this.newActorID;
  }

  targetsPlayer() {
    return this.targetID === '0' || this.targetID === '-1' && this.actor.data.foodValue > 0;
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

    if (this.newExtraTarget)
      result.newExtraTargetID = this.newExtraTarget.id;

    if (this.targetsPlayer())
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
