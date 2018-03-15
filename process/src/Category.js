"use strict";

class Category {
  constructor(dataText) {
    const lines = dataText.split('\n');
    this.parentID = lines[0].split('=')[1];
    this.objectIDs = lines.slice(2, lines.length);
  }

  addToObjects(objects) {
    this.parent = objects[this.parentID];
    if (!this.parent) throw "Unable to find object with id " + this.parentID;
    this.parent.category = this;
    this.objects = this.objectIDs.map(id => objects[id]);
    for (var object of this.objects) {
      if (object == this.parent) throw "A category should not reference itself"
      object.categories.push(this);
    }
  }
}

module.exports = Category;
