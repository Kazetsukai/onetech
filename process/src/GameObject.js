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
    } else if (attribute == "biomes" || attribute == "useAppearIndex") {
      this.data[attribute] = values;
    } else if (values.length == 1) {
      this.data[attribute] = values[0];
    } else {
      this.data[attribute] = values;
    }
  }

  parseSprite(lines) {
    this.sprites.push(new Sprite(lines));
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

    if (this.version)
      result.version = this.version;

    if (this.data.foodValue > 0)
      result.foodValue = this.data.foodValue;

    if (this.data.heatValue > 0)
      result.heatValue = this.data.heatValue;

    if (this.data.numUses > 1) {
      result.numUses = this.data.numUses;
      if (this.data.useChance != 1)
        result.useChance = this.data.useChance;
    }

    if (this.depth.hasValue())
      result.depth = this.depth.value;

    if (this.data.clothing != "n") {
      result.clothing = this.data.clothing;
      result.insulation = this.insulation();
    }

    if (this.data.floor && this.data.rValue > 0) {
      result.groundHeat = this.data.rValue;
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

    if (this.data.permanent == 0 && this.data.floor == 0) {
      result.minPickupAge = parseInt(this.data.minPickupAge) || 3;
    }

    if (this.data.speedMult != 1) {
      result.speedMult = parseFloat(this.data.speedMult);
    }

    if (this.data.blocksWalking == 1) {
      result.blocksWalking = true;
    }

    let techTree = this.techTreeNodes(3);
    if (techTree)
      result.techTree = techTree;

    let recipe = new Recipe(this);
    recipe.generate();
    if (recipe.hasData())
      result.recipe = recipe.jsonData();

    return result;
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
    return !this.category || this.category.pattern;
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
