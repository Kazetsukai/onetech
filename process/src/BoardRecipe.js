"use strict";

const BoardStep = require('./BoardStep');

class BoardRecipe {
  constructor(object) {
    this.object = object;
    this.steps = [];
    this.naturalObjects = [];
    this.usedObjects = [];
  }

  generate() {
    let object = this.object;
    for (let i = 0; i < 10; i++) {
      const step = new BoardStep(object);
      if (!step.transition) {
        return;
      }
      this.naturalObjects = this.naturalObjects.concat(step.naturalObjects);
      if (step.usedObject) {
        this.usedObjects.push(step.usedObject);
      }
      this.steps.push(step);
      object = step.nextObject;
      if (!object) {
        return;
      }
    }
  }

  hasData() {
    return this.steps.length > 0;
  }

  jsonData() {
    const data = {};

    if (this.steps.length > 0) {
      data.steps = this.steps.map(s => s.jsonData()).reverse();
    }

    if (this.naturalObjects.length > 0) {
      data.naturalObjects = this.naturalObjects.map(o => o.id);
    }

    if (this.usedObjects.length > 0) {
      data.usedObjects = this.usedObjects.map(o => o.id);
    }

    return data;
  }
}

module.exports = BoardRecipe;
