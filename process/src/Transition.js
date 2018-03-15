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
      this.target.transitionsAway.push(this);
    }
    if (this.actor = objects[this.actorID]) {
      this.actor.transitionsAway.push(this);
    }

    if (this.newTarget = objects[this.newTargetID]) {
      // Hide new target if target hasn't changed
      if (!this.targetRemains)
        this.newTarget.transitionsToward.push(this);
    }
    if (this.newActor = objects[this.newActorID]) {
      // Hide new actor if actor hasn't changed
      if (!this.tool)
        this.newActor.transitionsToward.push(this);
    }
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
}

module.exports = Transition;
