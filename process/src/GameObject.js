"use strict";

const fs = require('fs');

const Sprite = require('./Sprite');
const Complexity = require('./Complexity');

const BIOMES = {
  0: 'grassland',
  1: 'swamp',
  2: 'prairie',
  3: 'rocky',
  4: 'snow'
}

class GameObject {
  constructor(dataText) {
    this.data = {};
    this.sprites = [];
    this.transitionsToward = [];
    this.transitionsAway = [];
    this.categories = [];
    this.parseData(dataText);
    this.complexity = new Complexity({});
  }

  parseData(dataText) {
    const lines = dataText.split('\n');
    for (var i = 0; i < lines.length; i++) {
      if (i == 1) {
        this.parseName(lines[i]);
      } else if (lines[i].includes('spriteID')) {
        this.parseSprite(lines.slice(i, i+7));
        i += 7;
      } else {
        this.parseLine(lines[i]);
      }
    }
  }

  parseName(name) {
    if (name) this.data.name = name.replace('#', ' - ');
  }

  parseLine(line) {
    for (var value of line.split(',')) {
      const parts = line.split('=');
      if (parts.length < 2) {
        // console.log("Skipping line: " + line);
      } else if (parts[0] == "mapChance") {
        this.parseMapChance(parts[1]);
      } else {
        this.data[parts[0]] = parts[1];
      }
    }
  }

  parseMapChance(value) {
    const parts = value.split('#');
    this.data.mapChance = parts[0];
    if (parts[1].includes("_")) {
      const ids = parts[1].split('_')[1].split(',');
      this.data.biomes = ids.map(id => BIOMES[id]);
    }
  }

  parseSprite(lines) {
    this.sprites.push(new Sprite(lines));
  }

  simpleData() {
    return {id: this.data.id, name: this.data.name, hasSprite: this.hasSprite()};
  }

  fullData() {
    const transitionsToward = this.transitionsData(this.transitionsToward);
    const transitionsAway = this.transitionsData(this.transitionsAway);
    return {...this.data,
      hasSprite: this.hasSprite(),
      complexity: this.complexity.value,
      transitionsToward,
      transitionsAway,
    };
  }

  transitionsData(transitions) {
    transitions.sort((a,b) => a.complexity.compare(b.complexity));
    return transitions.map(t => t.data());
  }

  hasSprite() {
    return this.sprites.length > 0;
  }

  sortWeight() { // TODO: Improve object sorting
    return -this.complexity.value;
  }

  isTool() {
    for (var transition of this.transitionsAway) {
      if (transition.actor == this && transition.tool) return true;
    }
    return false;
  }

  isNatural() {
    return this.data.mapChance > 0;
  }
}

module.exports = GameObject;
