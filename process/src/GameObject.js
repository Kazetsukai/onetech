"use strict";

const Canvas = require('canvas');
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

  processSprites(spritesDir, pngDir) {
    const canvas = new Canvas(512, 1024);
    const context = canvas.getContext('2d');

    for (var sprite of this.sprites) {
      sprite.parseSpriteFile(spritesDir);
      sprite.draw(pngDir, canvas, context);
    }

    const bounds = this.bounds();
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    const newCanvas = new Canvas(Math.max(width, 128), Math.max(height, 128));
    const newContext = newCanvas.getContext('2d');

    newContext.setTransform(1, 0, 0, 1, 0, 0);

    newContext.drawImage(
      canvas,
      bounds.minX + canvas.width / 2,
      -bounds.maxY + canvas.height / 2,
      width,
      height,
      (newCanvas.width - width) / 2,
      (newCanvas.height - height) / 2,
      width,
      height
    );

    // Debug
    context.beginPath(); //
    context.rect(bounds.minX + canvas.width / 2, -bounds.maxY + canvas.height / 2, width, height);
    context.stroke();
    context.closePath(); //

    fs.writeFileSync(pngDir + "/obj_" + this.data.id + ".png", newCanvas.toBuffer());
  }

  bounds() {
    var maxX = 0;
    var maxY = 0;
    var minX = 0;
    var minY = 0;

    for (var sprite of this.sprites) {
      for (var point of sprite.boundaryPoints()) {
        if (point.x > maxX) maxX = point.x + 2;
        if (point.x < minX) minX = point.x - 2;
        if (point.y > maxY) maxY = point.y + 2;
        if (point.y < minY) minY = point.y - 2;
      }
    }

    return {minX, minY, maxX, maxY};
  }

  exportData() {
    const transitionsToward = this.transitionsToward.map(t => t.exportData());
    const transitionsAway = this.transitionsAway.map(t => t.exportData());
    return {...this.data,
      hasSprite: (this.sprites.length > 0),
      transitionsToward,
      transitionsAway,
    };
  }
}

module.exports = GameObject;
