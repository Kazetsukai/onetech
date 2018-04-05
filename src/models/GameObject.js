export default class GameObject {
  static load(callback) {
    this.fetchObjects(data => {
      this.objectsMap = {};
      for (let i in data.ids) {
        this.objectsMap[data.ids[i]] = new GameObject(data.ids[i], data.names[i]);
      }
      this.ids = data.ids;
      callback();
    });
  }

  static fetchObjects(callback) {
    fetch(`${STATIC_PATH}/objects.json`).
      then(data => data.json()).
      then(callback);
  }

  static byName() {
    return Object.values(this.objectsMap).sort((a,b) => a.name.length - b.name.length);
  }

  static first(amount) {
    return this.ids.slice(0, amount).map(id => this.objectsMap[id]);
  }

  static find(id) {
    return this.objectsMap[id];
  }

  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.data = null;
  }

  baseName() {
    return this.name.split(' - ')[0];
  }

  subName() {
    return this.name.split(' - ')[1];
  }

  url(subpath) {
    var path = [this.id, this.name.split(' ').join('-')];
    if (subpath) path.push(subpath);
    return '#' + path.map(encodeURIComponent).join('/');
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
    return this.data.insulation.toFixed(4)*100;
  }

  loadData() {
    if (this.data) return;
    this.fetchData(data => this.data = data);
  }

  fetchData(callback) {
    fetch(`${STATIC_PATH}/objects/${this.id}.json`).
      then(data => data.json()).
      then(callback);
  }
}
