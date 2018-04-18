"use strict";

const fs = require('fs');

class Sprite {
  constructor(lines) {
    this.id = lines[0].split('=')[1];
    const position = lines[1].split('=')[1].split(',');
    this.x = position[0];
    this.y = position[1];
    this.rotation = lines[2].split('=')[1];
    this.hFlip = lines[3].split('=')[1];
    this.color = lines[4].split('=')[1].split(',');
    this.ageRange = lines[5].split('=')[1].split(',').map(f => parseFloat(f));
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
}

module.exports = Sprite;
