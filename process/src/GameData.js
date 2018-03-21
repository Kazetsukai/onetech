"use strict";

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const _ = require('lodash');

const GameObject = require('./GameObject');
const Category = require('./Category');
const Transition = require('./Transition');
const ComplexityCalculator = require('./ComplexityCalculator');
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

  importCategories() {
    this.eachFileInDir("categories", (content, _filename) => {
      const category = new Category(content);
      category.addToObjects(this.objects);
    });
  }

  importTransitions() {
    this.eachFileInDir("transitions", (content, filename) => {
      const transition = new Transition(content, filename);
      transition.addToObjects(this.objects);
    });
  }

  calculateObjectComplexity() {
    var calculator = new ComplexityCalculator();
    calculator.calculate(Object.values(this.objects));
  }

  generateTechTree() {
    var generator = new TechTreeGenerator();
    generator.generate(Object.values(this.objects));
  }

  exportObjects() {
    this.prepareStaticDir();
    var list = [];
    const objects = this.sortedObjects();
    for (var object of objects) {
      list.push(object.simpleData());
      this.saveJSON("objects/" + object.data.id + ".json", object.fullData());
    }
    this.saveJSON("objects.json", list);
  }

  prepareStaticDir() {
    if (!fs.existsSync("../static-dev"))
      execSync("rsync -aq ../static/ ../static-dev");
    this.makeDir("../static-dev/sprites");
    this.makeDir("../static-dev/objects");
    this.makeDir("../static-dev/pretty-json");
    this.makeDir("../static-dev/pretty-json/objects");
  }

  makeDir(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
  }

  saveJSON(path, data) {
    const minPath = "../static-dev/" + path;
    const prettyPath = "../static-dev/pretty-json/" + path;
    fs.writeFileSync(minPath, JSON.stringify(data));
    fs.writeFileSync(prettyPath, JSON.stringify(data, null, 2));
  }

  sortedObjects() {
    return _.sortBy(this.objects, o => o.sortWeight());
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

  expireStaticDir() {
    fs.writeFileSync("../static/out-of-date.txt", "Run process.js to bring static up to date");
  }

  syncStaticDir() {
    execSync("rsync -aq ../static-dev/ ../static");
    execSync("rm -f ../static/out-of-date.txt");
  }
}

module.exports = GameData;
