"use strict";

const Clothing = {
  key: "clothing",
  name: "Clothing",
  filter(objects) {
    return objects.filter(o => o.isClothing());
  }
}

const Food = {
  key: "food",
  name: "Food",
  filter(objects) {
    return objects.filter(o => o.data.foodValue > 0);
  }
}

const Tools = {
  key: "tools",
  name: "Tools",
  filter(objects) {
    return objects.filter(o => (o.isTool() || o.isCraftableContainer()) && !o.isClothing());
  }
}

const HeatSources = {
  key: "heat",
  name: "Heat Sources",
  filter(objects) {
    return objects.filter(o => o.data.heatValue > 0);
  }
}

const WaterSources = {
  key: "water",
  name: "Water Sources",
  filter(objects) {
    return objects.filter(o => o.isWaterSource());
  }
}

const Natural = {
  key: "natural",
  name: "Natural",
  filter(objects) {
    return objects.filter(o => o.isNatural());
  }
}

const ObjectFilters = {
  filters: [
    Clothing,
    Food,
    Tools,
    HeatSources,
    WaterSources,
    Natural,
  ],
  jsonData(objects) {
    return this.filters.map(f => {
      return {
        key: f.key,
        name: f.name,
        ids: f.filter(objects).map(o => o.id),
      };
    });
  }
}

module.exports = ObjectFilters;
