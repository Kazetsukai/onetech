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

  importObjects() {
    this.eachFileInDir("objects", (content, _filename) => {
      const object = new GameObject(content);
      if (object.id) {
        this.objects[object.id] = object;
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
    this.updateTimestamp();
    this.saveJSON("objects.json", this.objectsData());
    for (var id in this.objects) {
      this.saveJSON(`objects/${id}.json`, this.objects[id].jsonData());
    }
  }

  prepareStaticDir() {
    if (!fs.existsSync("../static-dev"))
      execSync("cp -R ../static ../static-dev");
    this.makeDir("../static-dev/sprites");
    this.makeDir("../static-dev/objects");
    this.makeDir("../static-dev/pretty-json");
    this.makeDir("../static-dev/pretty-json/objects");
  }

  makeDir(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
  }

  updateTimestamp() {
    // Only update timestamp if we have changed the process script
    if (execSync("git status -s .") != "")
      fs.writeFileSync("./timestamp.txt", new Date().getTime());
    execSync("cp timestamp.txt ../static-dev/timestamp.txt");
  }

  saveJSON(path, data) {
    const minPath = "../static-dev/" + path;
    const prettyPath = "../static-dev/pretty-json/" + path;
    fs.writeFileSync(minPath, JSON.stringify(data));
    fs.writeFileSync(prettyPath, JSON.stringify(data, null, 2));
  }

  objectsData() {
    var objects = _.sortBy(this.objects, o => o.sortWeight());
    return {
      ids: objects.map(o => o.id),
      names: objects.map(o => o.name),
    }
  }

  convertSpriteImages() {
    const dir = this.baseDir + "/sprites";
    for (var filename of fs.readdirSync(dir)) {
      const id = filename.split('.')[0];
      const inPath = dir + "/" + filename;
      const outPath = "../static-dev/sprites/sprite_" + id + ".png";
      spawnSync("convert", [inPath, outPath]);
    }
  }

  processSprites() {
    const processor = new SpriteProcessor(this.baseDir + "/sprites", "../static-dev/sprites")
    processor.process(this.objects)
  }

  eachFileInDir(dirName, callback) {
    const dir = this.baseDir + "/" + dirName;
    for (var filename of fs.readdirSync(dir)) {
      const content = fs.readFileSync(dir + "/" + filename, "utf8");
      callback(content, filename);
    }
  }

  syncStaticDir() {
    execSync("rsync -aq ../static-dev/ ../static");
  }
}

module.exports = GameData;
