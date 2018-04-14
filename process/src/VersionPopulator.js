"use strict";

const { spawnSync } = require('child_process');

class VersionPopulator {
  constructor(gitDir, objects) {
    this.gitDir = gitDir;
    this.objects = objects;
  }

  populate() {
    const versions = this.fetchVersions();
    for (let i in versions) {
      if (i > 0)
        this.populateVersion(versions[i], versions[i-1]);
    }
    this.reportMissing();
  }

  fetchVersions() {
    return this.git("tag", "-l").map(t => this.versionFromTag(t)).sort();
  }

  versionFromTag(tag) {
    const version = tag.replace("OneLife_v", "");
    if (version == "Start") return 0;
    return parseInt(version);
  }

  tagFromVersion(version) {
    if (version == 0) return "OneLife_vStart";
    return "OneLife_v" + version;
  }

  populateVersion(current, previous) {
    const differences = this.diff(current, previous);
    for (let difference of differences) {
      if (difference[0] == "A")
        this.populateVersionAddition(current, difference[1]);
      else if (difference[0].startsWith("R"))
        this.populateVersionAddition(current, difference[2]);
    }
  }

  diff(current, previous) {
    const tagRange = this.tagFromVersion(previous) + ".." + this.tagFromVersion(current);
    return this.git("diff", "--name-status", tagRange).map(line => line.split(/\s+/));
  }

  populateVersionAddition(version, path) {
    const parts = path.split("/");
    if (parts[0] == "objects") {
      const object = this.objects[parts[1].split(".")[0]];
      if (object)
        object.version = version;
    }
  }

  git(...args) {
    const result = spawnSync("git", args, {cwd: this.gitDir, encoding: 'utf8'});
    if (result.status > 0) {
      console.log("Git command failed with args", args);
      console.log(result.stderr);
      throw "Git command failed. See log for reason.";
    }

    return result.stdout.split("\n").filter(l => l);
  }

  reportMissing() {
    const objects = Object.values(this.objects).filter(o => !o.version);
    console.log(objects.length + " objects are missing version");
    // for (let object of objects) {
    //   console.log(object.id, object.name, "unable to determine version");
    // }
  }
}

module.exports = VersionPopulator;
