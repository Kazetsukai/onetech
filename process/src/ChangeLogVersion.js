"use strict";

const ChangeLogCommit = require('./ChangeLogCommit');

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
    return this.git.fileChanges(this.previous.tag(), this.tag());
  }

  populateObjectAtPath(path) {
    const parts = path.split("/");
    if (parts[0] == "objects") {
      const object = this.objects[parts[1].split(".")[0]];
      if (object)
        object.version = this.id;
    }
  }

  jsonData() {
    let commits = this.fetchCommits();
    let date = commits[0] && commits[0].date;
    commits = commits.filter(c => c.isRelavent());
    return {
      id: this.id,
      date: date,
      commits: commits.map(c => c.jsonData()),
    };
  }

  fetchCommits() {
    if (!this.previous) return [];
    return this.git.log(this.previous.tag(), this.tag()).map(entry => {
      return new ChangeLogCommit(this, entry);
    });
  }
}

module.exports = ChangeLogVersion;
