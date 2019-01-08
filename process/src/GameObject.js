"use strict";

const Sprite = require('./Sprite');
const Depth = require('./Depth');
const Recipe = require('./Recipe');

class GameObject {
  constructor(dataText) {
    this.data = {};
    this.sprites = [];
    this.transitionsToward = [];
    this.transitionsAway = [];
    this.categories = [];
    this.depth = new Depth({});
    this.parseData(dataText);
    if (!this.data.id)
      return;
    this.id = this.data.id.toString();
    this.name = this.data.name;
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
    if (name)
      this.data.name = name.replace('#', ' - ');
  }

  parseLine(line) {
    const assignments = line.split(/[,#]/);
    let attribute = null;
    let values = [];
    for (let assignment of assignments) {
      const parts = assignment.split(/[_=]/);
      if (parts.length > 1) {
        this.assignData(attribute, values);
        attribute = parts.shift();
        values = [];
      }
      values.push(this.parseValue(parts[0]));
    }
    this.assignData(attribute, values);
  }

  parseValue(value) {
    if (isNaN(value))
      return value;
    if (value.includes("."))
      return parseFloat(value);
    return parseInt(value);
  }

  assignData(attribute, values) {
    if (!attribute) return;
    if (attribute == "numUses") {
      this.data.numUses = values[0];
      this.data.useChance = parseFloat(values[1] || 1.0);
    } else if (attribute == "biomes" || attribute == "useAppearIndex" || attribute == "spritesAdditiveBlend") {
      this.data[attribute] = values;
    } else if (values.length == 1) {
      this.data[attribute] = values[0];
    } else {
      this.data[attribute] = values;
    }
  }

  parseSprite(lines) {
    this.sprites.push(new Sprite(lines, this.sprites.length, this));
  }

  jsonData() {
    const transitionsToward = this.transitionsToward;
    const transitionsAway = this.transitionsAway.filter(t => !t.decay);
    const transitionsTimed = this.transitionsAway.filter(t => t.decay);
    const result = {
      id: this.id,
      name: this.name,
      transitionsToward: transitionsToward.map(t => t.jsonData()),
      transitionsAway: transitionsAway.map(t => t.jsonData()),
      transitionsTimed: transitionsTimed.map(t => t.jsonData()),
    };

    if (this.version) {
      result.version = this.version;
    }

    if (this.data.foodValue > 0) {
      result.foodValue = this.data.foodValue;
    }

    if (this.data.heatValue > 0) {
      result.heatValue = this.data.heatValue;
    }

    if (this.data.numUses > 1) {
      result.numUses = this.data.numUses;
      if (this.data.useChance != 1)
        result.useChance = this.data.useChance;
    }

    if (this.depth.hasValue()) {
      result.depth = this.depth.value;
    }

    if (this.data.clothing != "n") {
      result.clothing = this.data.clothing;
      result.insulation = this.insulation();
    } else if (this.data.rValue > 0 && (this.data.floor == 1 || this.data.blocksWalking == 1)) {
      result.insulation = this.data.rValue;
    }

    if (this.isDeadly()) {
      result.deadlyDistance = this.data.deadlyDistance;
    }

    if (this.data.useDistance > 1 && this.data.deadlyDistance > 1) {
      result.useDistance = this.data.useDistance;
    }

    if (this.data.mapChance > 0) {
      result.mapChance = this.data.mapChance;
      result.biomes = this.data.biomes;
    }

    if (this.data.numSlots > 0) {
      result.numSlots = this.data.numSlots;
      result.slotSize = this.data.slotSize;
    }

    if (this.data.containable == 1) {
      result.size = this.data.containSize;
    }

    if (this.canPickup()) {
      result.minPickupAge = parseInt(this.data.minPickupAge) || 3;
    }

    if (this.data.speedMult != 1) {
      result.speedMult = parseFloat(this.data.speedMult);
    }

    if (this.data.blocksWalking == 1) {
      result.blocksWalking = true;
    }

    const sounds = this.sounds();
    if (sounds.length > 0) {
      result.sounds = sounds;
    }

    const moveTransition = this.transitionsAway.find(t => t.move > 0);
    if (moveTransition) {
      result.moveType = moveTransition.move;
      result.moveDistance = moveTransition.desiredMoveDist;
    }

    const techTree = this.techTreeNodes(3);
    if (techTree) {
      result.techTree = techTree;
    }

    const recipe = new Recipe(this);
    recipe.generate();
    if (recipe.hasData()) {
      result.recipe = recipe.jsonData();
    }

    return result;
  }

  canPickup() {
    return this.data.permanent == 0 && this.data.floor == 0;
  }

  canMove() {
    return this.transitionsAway.find(t => t.move > 0);
  }

  hasSprite() {
    return this.sprites.length > 0;
  }

  sortWeight() {
    return -this.id;
  }

  // See ObjectInspector.vue for difficulty levels
  difficulty() {
    if (!this.depth.difficulty) return;
    return Number.parseFloat(this.depth.difficulty).toPrecision(3);
  }

  isTool() {
    for (var transition of this.transitionsAway) {
      if (transition.actor == this && transition.target && transition.tool) return true;
    }
    return false;
  }

  isCraftableContainer() {
    return this.data.numSlots > 0 && this.data.slotSize >= 1 && !this.isGrave();
  }

  isGrave() {
    return this.name.includes("Grave");
  }

  isNatural() {
    return this.data.mapChance > 0;
  }

  isClothing() {
    return this.data.clothing != "n" && (this.data.rValue > 0 || this.data.foodValue == '0' && this.data.containable == '1');
  }

  isWaterSource() {
    for (var transition of this.transitionsAway) {
      if (transition.actorID == '209' // Empty water pouch
        && transition.newActorID == '210' // Full water pouch
        && transition.target == this
        && (transition.tool || transition.targetRemains)) return true;
    }
    return false;
  }

  isVisible() {
    return !this.isCategory();
  }

  isCategory() {
    return this.category && !this.category.pattern || this.name && this.name.startsWith("@");
  }

  isDeadly() {
    return this.data.deadlyDistance && !this.hasSickTransition();
  }

  sounds() {
    if (!this.data.sounds) return [];
    const sounds = this.data.sounds.map(sound => sound.split(":")[0]);
    return sounds.filter((sound,index) => sound > 0 && sounds.indexOf(sound) === index);
  }

  hasSickTransition() {
    for (let transition of this.transitionsAway) {
      if (transition.targetID == "0" && transition.newTarget && transition.newTarget.name.includes(" sick")) {
        return true;
      }
    }
    return false;
  }

  techTreeNodes(depth) {
    const transition = this.transitionsToward[0];
    if (this.isNatural() || !transition)
      return null;
    if (depth == 0)
      return []; // Empty array means tree goes deeper
    var nodes = [];
    if (transition.decay)
      nodes.push({decay: transition.decay});
    if (transition.actor)
      nodes.push(transition.actor.techTreeNode(depth));
    if (transition.target)
      nodes.push(transition.target.techTreeNode(depth));
    return nodes;
  }

  techTreeNode(depth) {
    return {
      id: this.id,
      nodes: this.techTreeNodes(depth - 1)
    };
  }

  insulation() {
    const parts = {'h': 0.25, 't': 0.35, 'b': 0.2, 's': 0.1, 'p': 0.1};
    if (parts[this.data.clothing])
      return parts[this.data.clothing]*this.data.rValue;
  }
}

module.exports = GameObject;
