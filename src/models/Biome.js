import GameObject from './GameObject';

export default class Biome {
  static setup(ids, names) {
    this.biomesMap = {};
    for (let i in ids) {
      this.biomesMap[ids[i]] = new Biome(ids[i], names[i]);
    }
  }

  static biomes(amount) {
    return Object.values(this.biomesMap).slice(0, amount);
  }

  static find(id) {
    if (!id) return;
    return this.biomesMap[id.split("-")[0]];
  }

  static findAndLoad(id) {
    const biome = this.find(id);
    if (!biome) return;
    biome.loadData();
    return biome;
  }

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.data = null;
  }

  url() {
    let path = `biomes/${this.id}`;
    if (this.name) {
      path += encodeURIComponent(`-${this.name.replace(/\W+/g, '-')}`);
    }
    return '/' + path;
  }

  loadData() {
    if (this.data || this.loading) return;
    this.loading = true;
    this.fetchData(data => {
      this.loading = false;
      this.data = data;
    });
  }

  fetchData(callback) {
    fetch(`${STATIC_PATH}/biomes/${this.id}.json`).
      then(data => data.json()).
      then(callback);
  }

  objects() {
    if (!this.data) return [];
    return this.data.objects.map(o => {
      const object = GameObject.find(o.id);
      object.mapChance = o.mapChance
      return object;
    });
  }
}
