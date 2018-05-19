"use strict";

const Git = require('./Git');

class ChangeLogVersion {
  constructor(git, objects, id, previous) {
    this.git = git;
    this.objects = objects;
    this.id = id;
    this.previous = previous;
  }

  tag() {
    if (this.id == 0) return "OneLife_vStart";
    return "OneLife_v" + this.id;
  }

  populateObjects() {
    const differences = this.diff();
    for (let difference of differences) {
      if (difference[0] == "A")
        this.populateObjectAtPath(difference[1]);
      else if (difference[0].startsWith("R"))
        this.populateObjectAtPath(difference[2]);
    }
  }

  diff() {
    if (!this.previous) return [];
    return this.git.diff(this.previous.tag(), this.tag()).map(line => line.split(/\s+/));
  }

  populateObjectAtPath(path) {
    const parts = path.split("/");
    if (parts[0] == "objects") {
      const object = this.objects[parts[1].split(".")[0]];
      if (object)
        object.version = this.id;
    }
  }
}

module.exports = ChangeLogVersion;
