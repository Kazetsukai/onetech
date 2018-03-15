"use strict";

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const _ = require('lodash');

const GameObject = require('./GameObject');
const Transition = require('./Transition');
const SpriteProcessor = require('./SpriteProcessor');

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
    var objects = this.sortedObjects();
    for (var object of objects) {
      const path = "../static/objects/" + object.data.id + ".json";
      list.push(object.simpleData());
      fs.writeFileSync(path, JSON.stringify(object.fullData()));
    }
    fs.writeFileSync("../static/objects.json", JSON.stringify(list));
  }

  sortedObjects() {
    return _.sortBy(this.objects, o => o.sortWeight()).reverse();
  }

  processSprites() {
    const processor = new SpriteProcessor(this.baseDir + "/sprites", "../static/sprites")
    processor.process(this.objects)
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
