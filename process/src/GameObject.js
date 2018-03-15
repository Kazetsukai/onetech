"use strict";

const fs = require('fs');

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

  fullData() {
    const transitionsToward = this.transitionsToward.map(t => t.data());
    const transitionsAway = this.transitionsAway.map(t => t.data());
    return {...this.data,
      hasSprite: this.hasSprite(),
      transitionsToward,
      transitionsAway,
    };
  }

  simpleData() {
    return {id: this.data.id, name: this.data.name, hasSprite: this.hasSprite()};
  }

  hasSprite() {
    return this.sprites.length > 0;
  }

  sortWeight() {
    if (this.data.name.includes('@')) {
      return 0;
    } else {
      return this.transitionsToward.length + this.transitionsAway.length;
    }
  }
}

module.exports = GameObject;
