"use strict";

class Biome {
  static fromFilename(filename) {
    const id = filename.replace("ground_", "").replace(".tga", "");
    if (!id || id === "U") return;
    return new Biome(id);
  }

  static applyGroundHeat(biomes, filename, content) {
    const id = filename.replace("groundHeat_", "").replace(".txt", "");
    if (!id || id === "U") return;
    const biome = biomes.find(b => b.id === id);
    if (!biome) return;
    biome.groundHeat = parseFloat(content);
  }

  constructor(id) {
    this.id = id;
    this.groundHeat = 0;
    this.objects = [];
  }

  name() {
    const names = ["Grasslands", "Swamps", "Yellow Prairies", "Badlands", "Tundra", "Desert", "Jungle"];
    return names[this.id];
  }

  addObjects(objects) {
    for (let object of objects) {
      if (object.data.biomes && object.data.biomes.includes(parseInt(this.id))) {
        this.objects.push(object);
      }
    }
  }

  jsonData() {
    const result = {
      id: this.id,
      groundHeat: this.groundHeat,
      name: this.name(),
    };
    result.objects = this.objects.map(object => {
      return {id: object.id, mapChance: object.data.mapChance};
    });
    return result;
  }
}

module.exports = Biome;
