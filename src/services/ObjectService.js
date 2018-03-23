const ObjectService = {
  ids: [],
  nameMap: {},
  objectMap: {},

  load(callback) {
    this.loadObjects(data => {
      this.ids = data.ids;
      for (var i in this.ids) {
        this.nameMap[this.ids[i]] = data.names[i];
      }
      callback(data.ids);
    });
  },

  loadObjects(callback) {
    fetch(`${STATIC_PATH}/objects.json`).
      then(data => data.json()).
      then(callback);
  },

  name(id) {
    return this.nameMap[id];
  },

  baseName(id) {
    return this.name(id).split(' - ')[0];
  },

  subName(id) {
    return this.name(id).split(' - ')[1];
  },

  url(id, subpath) {
    if (!id) return '#';
    var path = [id, (this.name(id).split(' ').join('-'))];
    if (subpath) path.push(subpath);
    return '#' + path.map(encodeURIComponent).join('/');
  },

  fetchObject(id, callback) {
    if (this.objectMap[id])
      callback(this.objectMap[id])
    this.loadObject(id, (object) => {
      this.objectMap[id] = object;
      callback(object);
    });
  },

  loadObject(id, callback) {
    fetch(`${STATIC_PATH}/objects/${id}.json`).
      then(data => data.json()).
      then(callback);
  },
}

export default ObjectService;
