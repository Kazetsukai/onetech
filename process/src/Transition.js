"use strict";

const Depth = require('./Depth');

class Transition {
  constructor(dataText, filename) {
    this.depth = new Depth({});
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
    this.move = parseInt(data[7] || 0);
    this.desiredMoveDist = data[8] || 1;
    this.noUseActor = data[9] == '1';
    this.noUseTarget = data[10] == '1';

    this.hand = this.actorID == 0;
    this.tool = this.actorID >= 0 && this.actorID == this.newActorID;
    this.targetRemains = this.targetID >= 0 && this.targetID == this.newTargetID;

    this.decay = this.calculateDecay(this.autoDecaySeconds);
  }

  calculateDecay(seconds) {
    if (seconds < 0)
      return -seconds + "h";
    if (seconds > 0 && seconds % 60 == 0)
      return seconds/60 + "m";
    if (seconds > 0)
      return seconds + "s";
  }

  addToObjects(objects) {
    this.actor = objects[this.actorID];
    this.target = objects[this.targetID];
    this.newActor = objects[this.newActorID];
    this.newTarget = objects[this.newTargetID];
    this.newExtraTarget = objects[this.newExtraTargetID];

    if (this.actor && !this.actor.transitionsAway.includes(this))
      this.actor.transitionsAway.push(this);

    if (this.target && !this.target.transitionsAway.includes(this))
      this.target.transitionsAway.push(this);

    if (this.newActor && !this.newActor.transitionsAway.includes(this) && !this.newActor.transitionsToward.includes(this))
      this.newActor.transitionsToward.push(this);

    if (this.newTarget && !this.newTarget.transitionsAway.includes(this) && !this.newTarget.transitionsToward.includes(this))
      this.newTarget.transitionsToward.push(this);

    if (this.newExtraTarget && !this.newExtraTarget.transitionsAway.includes(this) && !this.newExtraTarget.transitionsToward.includes(this))
      this.newExtraTarget.transitionsToward.push(this);
  }

  isGeneric() {
    return this.targetID === '-1' && this.newTargetID === '0' && this.actorID != this.newActorID;
  }

  matchesGenericTransition(transition) {
    if (this == transition)
      return false;
    return this.matchesGenericActor(transition) || this.matchesGenericTarget(transition);
  }

  matchesGenericActor(transition) {
    return this.actorID == transition.actorID && this.tool && this.targetID > 0;
  }

  matchesGenericTarget(transition) {
    if (transition.lastUseActor && !this.lastUseTarget)
      return false;
    return this.targetID == transition.actorID && this.targetRemains && this.actorID > 0;
  }

  isLastUse() {
    return this.lastUseActor || this.lastUseTarget;
  }

  targetsPlayer() {
    return this.targetID === '0' || this.targetID === '-1' && this.actor.data.foodValue > 0;
  }

  totalDecaySeconds() {
    if (this.autoDecaySeconds > 0 && this.target.data.numUses > 1 && this.lastUseTarget)
      return parseInt(this.autoDecaySeconds) * this.target.data.numUses;
    return this.autoDecaySeconds;
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  applyActorUse() {
    return !this.noUseActor && (
            this.tool ||
            this.newActor &&
            this.newActor.data.numUses === this.actor.data.numUses);
  }

  applyTargetUse() {
    return !this.noUseTarget && (
            this.targetRemains ||
            this.newTarget &&
            this.newTarget.data.numUses === this.target.data.numUses);
  }

  jsonData() {
    const result = {}

    if (this.actor) {
      result.actorID = this.actor.id;
      if (this.actor.data.numUses > 1) {
        if (this.lastUseActor) {
          result.actorUses = this.reverseUseActor ? "max" : "last";
        } else if (this.applyActorUse()) {
          result.newActorUses = this.reverseUseActor ? "+1" : "-1";
          if (this.actor.data.useChance < 1.0) {
            result.newActorWeight = this.actor.data.useChance;
          }
        }
      } else if (this.reverseUseActor) {
        result.newActorUses = "last";
      }
    }

    if (this.target) {
      result.targetID = this.target.id;
      if (this.target.data.numUses > 1) {
        if (this.lastUseTarget) {
          result.targetUses = this.reverseUseTarget ? "max" : "last";
        } else if (this.applyTargetUse()) {
          result.newTargetUses = this.reverseUseTarget ? "+1" : "-1";
          if (this.target.data.useChance < 1.0) {
            result.newTargetWeight = this.target.data.useChance;
          }
        }
      } else if (this.reverseUseTarget) {
        result.newTargetUses = "last";
      }
    }

    if (this.newActor)
      result.newActorID = this.newActor.id;

    if (this.newTarget)
      result.newTargetID = this.newTarget.id;

    if (this.newExtraTarget)
      result.newExtraTargetID = this.newExtraTarget.id;

    if (this.newActorWeight)
      result.newActorWeight = this.newActorWeight;

    if (this.newTargetWeight)
      result.newTargetWeight = this.newTargetWeight;

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

    if (this.move > 0) {
      result.move = this.move;
    }

    return result;
  }
}

module.exports = Transition;
