"use strict";

class Category {
  constructor(dataText) {
    const lines = dataText.split('\n');
    this.parentID = lines[0].split('=')[1];
    this.pattern = lines[1] == "pattern";
    this.objectIDs = lines.slice(this.pattern ? 3 : 2, lines.length);
  }

  addToObjects(objects) {
    this.parent = objects[this.parentID];
    if (!this.parent) throw "Unable to find object with id " + this.parentID;
    this.parent.category = this;
    this.objects = [];
    for (let id of this.objectIDs) {
      const object = objects[id];
      if (!object) {
        console.log(`Invalid object id ${id} in categories/${this.parentID}.txt`)
      } else if (object == this.parent) {
        console.log(`A category should not reference itself in categories/${this.parentID}.txt`)
      } else {
        this.objects.push(object);
        object.categories.push(this);
      }
    }
  }
}

module.exports = Category;
