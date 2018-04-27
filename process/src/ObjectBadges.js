"use strict";

const Clothing = {
  key: "clothing",
  filter(objects) {
    return objects.filter(o => o.isClothing());
  },
  value(object) {
    const percent = (object.insulation()*10000).toFixed()/100
    return `${percent}%`;
  }
}

const Food = {
  key: "food",
  filter(objects) {
    return objects.filter(o => o.data.foodValue > 0);
  },
  value(object) {
    if (object.numUses() > 1)
      return `${object.data.foodValue} x ${object.numUses()}`;
    return object.data.foodValue;
  }
}

const Tool = {
  key: "tool",
  filter(objects) {
    return objects.filter(o => o.isTool());
  },
  value(object) {
    if (object.numUses() > 1) {
      if (object.useChance())
        return `~${object.numUses() * (1 / object.useChance())}`;
      return object.numUses();
    }
  }
}

const Container = {
  key: "container",
  filter(objects) {
    return objects.filter(o => o.isCraftableContainer());
  },
  value(object) {
    return object.numSlots();
  }
}

const HeatSource = {
  key: "heat",
  filter(objects) {
    return objects.filter(o => o.data.heatValue > 0);
  },
  value(object) {
    return object.data.heatValue;
  }
}

const WaterSource = {
  key: "water",
  filter(objects) {
    return objects.filter(o => o.isWaterSource());
  },
  value(object) {
    return object.numUses() > 1 ? object.numUses() : "";
  }
}

const Natural = {
  key: "natural",
  filter(objects) {
    return objects.filter(o => o.isNatural());
  }
}

const ObjectBadges = {
  badges: [
    Clothing,
    Food,
    Tool,
    Container,
    WaterSource,
    HeatSource,
    Natural,
  ],
  jsonData(allObjects) {
    const badgesData = {};
    for (let badge of this.badges) {
      const objects = badge.filter(allObjects);
      const data = {ids: objects.map(o => o.id)};
      if (badge.value)
        data.values = objects.map(o => badge.value(o));
      badgesData[badge.key] = data;
    }
    return badgesData;
  }
}

module.exports = ObjectBadges;
