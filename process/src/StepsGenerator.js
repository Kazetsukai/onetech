"use strict";

class StepsGenerator {
  constructor(object) {
    this.object = object;
    this.remaining = [];
    this.nextRemaining = [];
    this.steps = [];
    this.requirements = [];
    this.enqueue(object);
  }

  generate() {
    // console.log(this.object.id, this.object.name, this.object.complexity.value);
    while (this.totalStepItems() < 40 && this.nextRemaining.length > 0) {
      const step = [];
      this.steps.push(step);
      this.remaining = this.nextRemaining;
      this.nextRemaining = [];
      while (this.remaining.length > 0) {
        step.push(this.generateStepItem(this.remaining.shift()));
      }
    }
    this.nextRemaining.forEach(r => this.addUsed(r.object, r.count));
    this.cleanupSteps();
  }

  hasData() {
    return this.totalStepItems() > 0;
  }

  jsonData() {
    return {
      steps: this.steps.reverse(),
      requirements: this.requirements.sort((a,b) => a.complexity.compare(b.complexity)).reverse().map(o => o.id),
    }
  }

  generateStepItem({object, count}) {
    // if (this.object.id == '186' && object.id == '107') debugger;
    const item = {id: object.id};

    const existingItem = this.pluckStepItem(object);
    if (existingItem)
      item.count = (existingItem.count || 1) + count;
    else if (count > 1)
      item.count = count;

    const transition = object.transitionsToward[0];

    if (transition.actor) {
      item.actorID = transition.actor.id;
      this.enqueue(transition.actor, transition.decay, item.count);
    }
    if (transition.target) {
      item.targetID = transition.target.id;
      this.enqueue(transition.target, transition.decay, item.count);
    }

    if (transition.decay)
      item.decay = transition.decay;

    if (transition.hand)
      item.hand = true;

    return item;
  }

  // Add the current object to the queue if it has a transition and isn't a tool
  enqueue(object, skipDecay, count) {
    if (!object.complexity.hasValue() || object.complexity.value == 0 || this.isTool(object)) {
      this.addUsed(object, this.isTool(object) ? 1 : count || 1);
      return;
    }

    const existingRemaining = this.nextRemaining.find(r => r.object == object);
    if (existingRemaining) {
      existingRemaining.count += count || 1;
      return;
    }

    if (skipDecay && object.transitionsToward[0].decay) {
      // Collapse chains of decay transitions
      if (object.transitionsToward[0].target)
        this.enqueue(object.transitionsToward[0].target, skipDecay, count);
    } else {
      this.nextRemaining.push({object, count: count || 1});
    }
  }

  addUsed(object, count) {
    if (this.isTool(object) && this.requirements.includes(object))
      return;
    for (let i=0; i < count; i++)
      this.requirements.push(object)
  }

  isTool(otherObject) {
    return (otherObject.data.numUses || 0) <= 1 && this.object.complexity.tools.includes(otherObject);
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
    if (this.remaining.find(r => r.object == object))
      this.remaining = this.remaining.filter(r => r.object != object);
    if (this.nextRemaining.find(r => r.object == object))
      this.nextRemaining = this.nextRemaining.filter(r => r.object != object);
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
      // if (newSteps.length > 0 && items.length == 1)
      //   items = items.concat(newSteps.pop());
      newSteps.push(items);
    }
    this.steps = newSteps;
  }
}

module.exports = StepsGenerator;
