export default class GameObject {
  static load(callback) {
    this.fetchObjects(data => {
      this.objectsMap = {};
      for (let i in data.ids) {
        this.objectsMap[data.ids[i]] = new GameObject(data.ids[i], data.names[i], data.difficulties[i]);
      }
      this.ids = data.ids;
      this.filters = data.filters;
      this.badges = data.badges;
      this.date = new Date(data.date);
      this.versions = data.versions;
      this.foodBonus = data.foodBonus;
      callback(data);
    });
  }

  static fetchObjects(callback) {
    fetch(`${STATIC_PATH}/objects.json`).
      then(data => data.json()).
      then(callback);
  }

  static sort(objects, sortBy) {
    switch (sortBy) {
      case "difficulty":
        return objects.sort((a,b) => (a.difficulty || 0) - (b.difficulty || 0));
      case "name":
        return objects.sort((a,b) => a.name.localeCompare(b.name));
      default: // recent
        return objects.sort((a,b) => b.id - a.id);
    }
  }

  static byNameLength() {
    return Object.values(this.objectsMap).sort((a,b) => a.name.length - b.name.length);
  }

  static objects(amount, filter, sortBy, descending) {
    let objects;
    if (filter) {
      objects = filter.ids.map(id => this.objectsMap[id]);
    } else if (sortBy == "difficulty") {
      objects = Object.values(this.objectsMap).filter(o => o.difficulty);
    } else {
      objects = Object.values(this.objectsMap);
    }
    let sorted = this.sort(objects, sortBy);
    if (descending) {
      sorted.reverse();
    }
    return sorted.slice(0, amount);
  }

  static find(id) {
    if (!id) return;
    return this.objectsMap[id.split("-")[0]];
  }

  static findByName(name) {
    if (!name) return;
    return Object.values(this.objectsMap).find(o => o.name == name);
  }

  static findAndLoad(id) {
    const object = this.find(id);
    if (!object) return;
    object.loadData();
    return object;
  }

  static findAndLoadByName(name) {
    const object = this.findByName(name);
    if (!object) return;
    object.loadData();
    return object;
  }

  static findFilter(key) {
    return this.filters.find(f => f.key == key);
  }

  static addLegacyObject(attributes) {
    if (this.objectsMap[attributes.id])
      return;
    const object = new GameObject(attributes.id, attributes.name, null);
    if (attributes.category) {
      object.category = true;
    } else {
      object.legacy = true;
    }
    this.objectsMap[object.id] = object;
  }

  constructor(id, name, difficulty) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.data = null;
  }

  baseName() {
    return this.name.split(' - ')[0];
  }

  subName() {
    return this.name.split(' - ')[1];
  }

  badges() {
    const badges = [];
    for (let key in GameObject.badges) {
      const index = GameObject.badges[key].ids.indexOf(this.id);
      if (index != -1) {
        const values = GameObject.badges[key].values || [];
        badges.push({key: key, value: values[index]});
      }
    }
    return badges;
  }

  url(subpath) {
    if (this.legacy)
      return "/not-found";
    const path = [`${this.id}-${this.name.replace(/\W+/g, '-')}`];
    if (subpath) path.push(subpath);
    return '/' + path.map(encodeURIComponent).join("/");
  }

  clothingPart() {
    if (!this.data)
      return null;
    const parts = {'h': "Head", 't': "Chest", 'b': "Bottom", 's': "Foot", 'p': "Back"};
    return parts[this.data.clothing];
  }

  hasInsulation() {
    return this.data && !isNaN(this.data.insulation);
  }

  insulationPercent() {
    return (this.data.insulation*10000).toFixed()/100;
  }

  loadData() {
    if (this.data || this.loading) return;
    this.loading = true;
    this.fetchData(data => {
      this.loading = false;
      this.data = data;
    });
  }

  sizeText(size) {
    if (size > 1) return "Large";
    if (size == 1) return "Small";
    return "Tiny";
  }

  slotSize() {
    return this.sizeText(this.data.slotSize).toLowerCase();
  }

  size() {
    return this.sizeText(this.data.size);
  }

  spawnText() {
    if (!this.mapChanceData()) return;
    const level = Math.ceil(parseFloat(this.mapChanceData())*15)-1;
    if (level == 0) return "Very Rare";
    if (level < 3) return "Rare";
    if (level < 7) return "Uncommon";
    return "Common";
  }

  mapChanceData() {
    return this.mapChance || this.data && this.data.mapChance;
  }

  fetchData(callback) {
    fetch(`${STATIC_PATH}/objects/${this.id}.json`).
      then(data => data.json()).
      then(callback);
  }
}
