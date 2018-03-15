"use strict";

const fs = require('fs');
const _ = require('lodash');

const Sprite = require('./Sprite');

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
      complexity: this.complexity,
      transitionsToward,
      transitionsAway,
    };
  }

  transitionsData(transitions) {
    return _.sortBy(transitions, (t) => t.complexity ? t.complexity : 100000).map(t => t.data());
  }

  hasSprite() {
    return this.sprites.length > 0;
  }

  sortWeight() { // TODO: Improve object sorting
    return this.sortTypeWeight() * 100000 +
           this.sortComplexityWeight() * 100 +
           this.sortUsefullnessWeight();
  }

  sortTypeWeight() {
    if (this.category) {
      return 9;
    } else if (this.isNatural() || this.complexity == 1) {
      return 8;
    } else if (this.clothing == "y") {
      return 4;
    } else if (this.isTool()) {
      return 3;
    } else {
      return 5;
    }
  }

  sortComplexityWeight() {
    return this.complexity > 0 ? this.complexity : 100000;
  }

  sortUsefullnessWeight() {
    return -this.transitionsAway.length;
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

  calculateComplexity(parentObjects) {
    if (!this.calculatedComplexity) {
      this.complexity = this.calculateComplexityWithTransitions(parentObjects);
      // Circular references should be recalculated later
      this.calculatedComplexity = (this.complexity != -1);
    }
    return this.complexity;
  }

  calculateComplexityWithTransitions(parentObjects) {
    if (parentObjects.length > 20 || parentObjects.includes(this)) {
      return -1; // We are in too deep or have a circular reference
    }
    if (this.isNatural()) {
      return 1; // Natural objects have 1 complexity for itself
    }
    const parents = [...parentObjects, this];
    const complexities = this.transitionsToward.map(t => t.calculateComplexity(parents));
    const validComplexities = complexities.filter(c => c > 0);
    if (validComplexities.length) {
      return Math.min(...validComplexities);
    } else if (complexities.find(c => c == -1)) {
      return -1; // Pass circular reference up the chain
    } else {
      return null; // Not craftable
    }
  }
}

module.exports = GameObject;
