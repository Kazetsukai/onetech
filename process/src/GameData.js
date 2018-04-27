"use strict";

const { spawnSync } = require('child_process');
const fs = require('fs');
const _ = require('lodash');

const GameObject = require('./GameObject');
const Category = require('./Category');
const TransitionImporter = require('./TransitionImporter');
const VersionPopulator = require('./VersionPopulator');
const DepthCalculator = require('./DepthCalculator');
const SpriteProcessor = require('./SpriteProcessor');
const ObjectFilters = require('./ObjectFilters');
const ObjectBadges = require('./ObjectBadges');

class GameData {
  constructor(processDir, dataDir) {
    this.processDir = processDir;
    this.dataDir = dataDir;
    this.staticDir = processDir + "/../static";
    this.staticDevDir = processDir + "/../static-dev";
    this.objects = {};
    this.categories = [];
  }

  download(gitURL) {
    if (fs.existsSync(this.dataDir))
      spawnSync("git", ["pull"], {cwd: this.dataDir});
    else
      spawnSync("git", ["clone", gitURL, this.dataDir]);
  }

  verifyDownloaded() {
    if (!fs.existsSync(this.dataDir))
      throw "OneLifeData7 not found, first run `node process dev download`"
  }

  importObjects() {
    this.eachFileInDir("objects", ".txt", (content, _filename) => {
      const object = new GameObject(content);
      if (object.id) {
        this.objects[object.id] = object;
      }
    });
  }

  importCategories() {
    this.eachFileInDir("categories", ".txt", (content, _filename) => {
      const category = new Category(content);
      category.addToObjects(this.objects);
      this.categories.push(category);
    });
  }

  importTransitions() {
    const importer = new TransitionImporter();
    this.eachFileInDir("transitions", ".txt", (content, filename) => {
      importer.importFromFile(content, filename);
    });
    importer.splitCategories(this.categories);
    importer.mergeGenericTransitions();
    importer.mergeAttackTransitions();
    importer.addToObjects(this.objects);
  }

  populateVersions() {
    const populator = new VersionPopulator(this.dataDir, this.objects);
    populator.populate();
  }

  calculateObjectDepth() {
    var calculator = new DepthCalculator();
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
    if (!fs.existsSync(this.staticDevDir))
      spawnSync("cp", ["-R", this.staticDir, this.staticDevDir]);
    this.makeDir(this.staticDevDir + "/sprites");
    this.makeDir(this.staticDevDir + "/ground");
    this.makeDir(this.staticDevDir + "/objects");
    this.makeDir(this.staticDevDir + "/pretty-json");
    this.makeDir(this.staticDevDir + "/pretty-json/objects");
  }

  makeDir(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
  }

  updateTimestamp() {
    const path = this.processDir + "/timestamp.txt";
    // Only update timestamp if we have changed the process script
    if (spawnSync("git", ["status", "-s", this.processDir]).stdout != "")
      fs.writeFileSync(path, new Date().getTime());
    spawnSync("cp", [path, this.staticDevDir + "/timestamp.txt"]);
  }

  saveJSON(path, data) {
    const minPath = this.staticDevDir + "/" + path;
    const prettyPath = this.staticDevDir + "/pretty-json/" + path;
    fs.writeFileSync(minPath, JSON.stringify(data));
    fs.writeFileSync(prettyPath, JSON.stringify(data, null, 2));
  }

  objectsData() {
    var objects = _.sortBy(this.objects, o => o.sortWeight()).filter(o => !o.category);
    return {
      ids: objects.map(o => o.id),
      names: objects.map(o => o.name),
      filters: ObjectFilters.jsonData(objects),
      badges: ObjectBadges.jsonData(objects),
      date: new Date(),
      version: (new VersionPopulator(this.dataDir, this.objects)).lastVersion(),
    };
  }

  convertSpriteImages() {
    const dir = this.dataDir + "/sprites";
    for (var filename of fs.readdirSync(dir)) {
      if (filename.endsWith(".tga")) {
        const id = filename.split('.')[0];
        const inPath = dir + "/" + filename;
        const outPath = this.staticDevDir + "/sprites/sprite_" + id + ".png";
        spawnSync("convert", [inPath, outPath]);
      }
    }
  }

  convertGroundImages() {
    const dir = this.dataDir + "/ground";
    for (var filename of fs.readdirSync(dir)) {
      if (filename.endsWith(".tga")) {
        const name = filename.split('.')[0];
        const inPath = dir + "/" + filename;
        const outPath = this.staticDevDir + "/ground/" + name + ".png";
        spawnSync("convert", [inPath, "-sigmoidal-contrast", "3,44%", "-level", "0%,108%,1.1", "-scale", "128x128", outPath]);
      }
    }
  }

  processSprites() {
    const processor = new SpriteProcessor(this.dataDir + "/sprites", this.staticDevDir + "/sprites")
    processor.process(this.objects)
  }

  eachFileInDir(dirName, extension, callback) {
    const dir = this.dataDir + "/" + dirName;
    for (let filename of fs.readdirSync(dir)) {
      if (filename.endsWith(extension)) {
        const content = fs.readFileSync(dir + "/" + filename, "utf8");
        callback(content, filename);
      }
    }
  }

  syncStaticDir() {
    spawnSync("rsync", ["-aq", this.staticDevDir + "/", this.staticDir]);
  }
}

module.exports = GameData;
