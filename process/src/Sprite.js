"use strict";

const fs = require('fs');

class Sprite {
  constructor(lines, index, object) {
    this.index = index;
    this.object = object;
    for (let line of lines) {
      this.parseLine(line);
    }
  }

  // Dupication with GameObject.js
  parseLine(line) {
    const assignments = line.split(/[,#]/);
    let attribute = null;
    let values = [];
    for (let assignment of assignments) {
      const parts = assignment.split(/[_=]/);
      if (parts.length > 1) {
        this.assignData(attribute, values);
        attribute = parts.shift();
        values = [];
      }
      values.push(this.parseValue(parts[0]));
    }
    this.assignData(attribute, values);
  }

  parseValue(value) {
    if (isNaN(value))
      return value;
    if (value.includes("."))
      return parseFloat(value);
    return parseInt(value);
  }

  assignData(attribute, values) {
    if (!attribute) return;
    if (attribute === "spriteID") {
      this.id = values[0].toString();
    } else if (attribute === "pos") {
      this.x = values[0];
      this.y = values[1];
    } else if (attribute === "rot") {
      this.rotation = values[0];
    } else if (values.length == 1) {
      this[attribute] = values[0];
    } else {
      this[attribute] = values;
    }
  }

  parseExtraData(data) {
    this.tag = data[0];
    this.multiplicativeBlending = data[1] === '1';
    this.centerAnchorXOffset = parseFloat(data[2]);
    this.centerAnchorYOffset = parseFloat(data[3]);
  }

  beyondAge(age) {
    return (this.ageRange[0] > -1 || this.ageRange[1] > -1) && (this.ageRange[0] > age || this.ageRange[1] < age);
  }

  additiveBlend() {
    const additiveIndexes = this.object.data.spritesAdditiveBlend;
    return additiveIndexes && additiveIndexes.indexOf(this.index) > -1;
  }
}

module.exports = Sprite;
