export default class Version {
  static fetch(id) {
    if (!id) return;
    if (!this.versionsMap)
      this.versionsMap = {};
    if (this.versionsMap[id])
      return this.versionsMap[id];
    const version = new Version(id);
    this.versionsMap[id] = version;
    return version;
  }

  static isLoading() {
    if (!this.versionsMap)
      return false;
    for (let version of Object.values(this.versionsMap)) {
      if (!version.data)
        return true;
    }
    return false;
  }

  constructor(id, name) {
    this.id = id;
    this.data = null;
    this.loading = false;
    this.loadData();
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
    fetch(`${STATIC_PATH}/versions/${this.id}.json`).
      then(data => data.json()).
      then(callback);
  }
}
