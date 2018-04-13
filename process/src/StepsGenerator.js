"use strict";

class StepsGenerator {
  constructor(object) {
    this.object = object;
    this.remaining = [];
    this.nextRemaining = [];
    this.steps = [];
    this.enqueue(object);
  }

  generate() {
    // console.log(this.object.id, this.object.name, this.object.complexity.value);
    while (this.totalStepItems() < 30 && this.nextRemaining.length > 0) {
      const step = [];
      this.steps.push(step);
      this.remaining = this.nextRemaining.sort((a,b) => a.complexity.compare(b.complexity));
      this.nextRemaining = [];
      while (this.remaining.length > 0) {
        step.push(this.generateStepItem(this.remaining.shift()));
      }
    }
    this.cleanupSteps();
  }

  hasData() {
    return this.totalStepItems() > 1;
  }

  jsonData() {
    return this.steps.reverse();
  }

  generateStepItem(object) {
    // if (this.object.id == '186' && object.id == '107') debugger;
    const item = {id: object.id};

    const existingItem = this.pluckStepItem(object);
    if (existingItem && !this.isTool(object))
      item.count = existingItem.count + 1;

    const transition = object.transitionsToward[0];

    if (transition.actor) {
      item.actorID = transition.actor.id;
      this.enqueue(transition.actor, transition.decay);
    }
    if (transition.target) {
      item.targetID = transition.target.id;
      this.enqueue(transition.target, transition.decay);
    }

    if (transition.decay)
      item.decay = transition.decay;

    if (transition.hand)
      item.hand = true;

    return item;
  }

  isTool(otherObject) {
    return this.object.complexity.tools.includes(otherObject);
  }

  // Add the current object to the queue if it has a transition
  enqueue(object, skipDecay) {
    if (object.isNatural() || object.transitionsToward.length == 0 || this.nextRemaining.includes(object))
      return;

    if (skipDecay && object.transitionsToward[0].decay) {
      if (object.transitionsToward[0].target)
        this.enqueue(object.transitionsToward[0].target, skipDecay);
    } else {
      this.nextRemaining.push(object);
    }
  }

  // Pluck an item and its descendents out of the earlier steps
  // because it is being used in a later step
  pluckStepItem(object, startIndex) {
    for (let i=(startIndex || 0); i < this.steps.length;  i++) {
      const step = this.steps[i];
      const plucked = step.find(item => item && item.id == object.id);
      if (plucked) {
        step[step.indexOf(plucked)] = null;
        this.pluckStepItemChildren(object, i);
        return plucked;
      }
    }
    if (this.remaining.includes(object))
      this.remaining = this.remaining.filter(o => o != object);
    if (this.nextRemaining.includes(object))
      this.nextRemaining = this.nextRemaining.filter(o => o != object);
    return null;
  }

  pluckStepItemChildren(object, startIndex) {
    if (object.isNatural() || object.transitionsToward.length == 0)
      return;
    const transition = object.transitionsToward[0];
    if (transition.actor)
      this.pluckStepItem(transition.actor, startIndex);
    if (transition.target)
      this.pluckStepItem(transition.target, startIndex);
  }

  totalStepItems() {
    let count = 0;
    for (const items of this.steps) {
      for (const item of items) {
        if (item) count++;
      }
    }
    return count;
  }

  cleanupSteps() {
    const newSteps = [];
    for (let i in this.steps) {
      let items = this.steps[i].filter(i => i);
      if (newSteps.length > 0 && items.length == 1)
        items = items.concat(newSteps.pop());
      newSteps.push(items);
    }
    this.steps = newSteps;
  }
}

module.exports = StepsGenerator;
