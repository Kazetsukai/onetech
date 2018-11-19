"use strict";

class Biome {
  static fromFilename(filename) {
    var id = filename.replace("ground_", "").replace(".tga", "");
    if (!id || id === "U") return;
    return new Biome(id);
  }

  constructor(id) {
    this.id = id;
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
      name: this.name(),
    };
    result.objects = this.objects.map(object => {
      return {id: object.id, mapChance: object.data.mapChance};
    });
    return result;
  }
}

module.exports = Biome;
