"use strict";

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');

const GameObject = require('./GameObject');
const Transition = require('./Transition');

class GameData {
  constructor() {
    this.baseDir = "OneLifeData7-master";
    this.objects = {};
  }

  download() {
    execSync("curl https://codeload.github.com/jasonrohrer/OneLifeData7/tar.gz/master | tar -xzf -");
  }

  convertSpriteImages() {
    const dir = this.baseDir + "/sprites";
    for (var filename of fs.readdirSync(dir)) {
      const id = filename.split('.')[0];
      const inPath = dir + "/" + filename;
      const outPath = "../static/sprites/sprite_" + id + ".png";
      spawnSync("convert", [inPath, outPath]);
    }
  }

  importObjects() {
    this.eachFileInDir("objects", (content, _filename) => {
      const object = new GameObject(content);
      if (object.data.id) {
        this.objects[object.data.id] = object;
      }
    });
  }

  importTransitions() {
    this.eachFileInDir("transitions", (content, filename) => {
      const transition = new Transition(content, filename);
      transition.addToObjects(this.objects);
    });
  }

  exportObjects() {
    var list = [];
    for (var id in this.objects) {
      const path = "../static/objects/" + id + ".json";
      list.push(this.objects[id].simpleData());
      fs.writeFileSync(path, JSON.stringify(this.objects[id].fullData()));
    }
    fs.writeFileSync("../static/objects.json", JSON.stringify(list));
  }

  processSprites() {
    const spritesDir = this.baseDir + "/sprites";
    const pngDir = "../static/sprites";
    for (var id in this.objects) {
      this.objects[id].processSprites(spritesDir, pngDir);
    }
  }

  eachFileInDir(dirName, callback) {
    const dir = this.baseDir + "/" + dirName;
    for (var filename of fs.readdirSync(dir)) {
      const content = fs.readFileSync(dir + "/" + filename, "utf8");
      callback(content, filename);
    }
  }
}

module.exports = GameData;
