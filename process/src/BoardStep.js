"use strict";

class BoardStep {
  constructor(object) {
    this.object = object;
    this.nextObject = null;
    this.usedObject = null;
    this.naturalObjects = [];
    this.transition = this.object.transitionsToward[0];
    if (this.transition) {
      this.applyTransition();
    }
  }

  applyTransition() {
    if (this.transition.actor) {
      this.applyObject(this.transition.actor, this.transition.tool);
    }
    if (this.transition.target) {
      this.applyObject(this.transition.target, this.transition.targetRemains);
    }
  }

  applyObject(object, remains) {
    if (object.isNatural()) {
      this.naturalObjects.push(object);
      return;
    }

    if (remains) {
      this.usedObject = object;
      return;
    }

    if (!this.nextObject && (this.usedObject || object.depth.value >= this.object.depth.value-1)) {
      this.nextObject = object;
      return;
    }

    this.usedObject = object;
  }

  jsonData() {
    const data = {id: this.object.id};

    const transition = this.transition;
    if (transition.actor) {
      data.actorID = transition.actor.id;
      if (transition.actor.data.numUses > 1 && (transition.lastUseActor || transition.actorMinUseFraction == 1)) {
        data.actorUses = transition.reverseUseActor || transition.actorMinUseFraction == 1 ? "max" : "last";
      }
    }
    if (transition.target) {
      data.targetID = transition.target.id;
      if (transition.target.data.numUses > 1 && (transition.lastUseTarget || transition.targetMinUseFraction == 1)) {
        data.targetUses = transition.reverseUseTarget || transition.targetMinUseFraction == 1 ? "max" : "last";
      }
    }
    if (transition.newActor == this.object && transition.newActorWeight)
      data.weight = transition.newActorWeight;
    if (transition.newTarget == this.object && transition.newTargetWeight)
      data.weight = transition.newTargetWeight;
    if (transition.decay)
      data.decay = transition.decay;
    if (transition.hand())
      data.hand = true;
    if (transition.targetsPlayer())
      data.targetPlayer = true;

    return data;
  }
}

module.exports = BoardStep;
