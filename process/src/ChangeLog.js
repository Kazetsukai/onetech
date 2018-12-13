"use strict";

const Git = require('./Git');
const ChangeLogVersion = require('./ChangeLogVersion');

class ChangeLog {
  constructor(gitDir, objects) {
    this.git = new Git(gitDir);
    this.objects = objects;
    this.versions = this.fetchVersions();
  }

  fetchVersions() {
    let previousVersion = null;
    const versions = this.fetchVersionNumbers().map(id => {
      const version = new ChangeLogVersion(
        this.git,
        this.objects,
        id,
        previousVersion
      );
      previousVersion = version;
      return version;
    });
    versions.push(new ChangeLogVersion(
      this.git,
      this.objects,
      "unreleased",
      previousVersion
    ));
    return versions;
  }

  fetchVersionNumbers() {
    return this.git.tags().map(t => this.versionNumberFromTag(t)).filter(t => !isNaN(t)).sort((a,b) => a - b);
  }

  versionNumberFromTag(tag) {
    const version = tag.replace("OneLife_v", "");
    if (version == "Start") return 0;
    return parseInt(version);
  }

  populateObjects() {
    for (let version of this.versions) {
      if (version.isReleased()) {
        version.populateObjects();
      }
    }
    if (!process.env.ONETECH_MOD_NAME)
      this.reportMissing();
  }

  validVersions() {
    return this.versions.slice(1).reverse().filter(v => v.isReleased() || v.fetchCommits().length > 0);
  }

  reportMissing() {
    const objects = Object.values(this.objects).filter(o => !o.version);
    console.log(objects.length + " objects are missing version");
    // for (let object of objects) {
    //   console.log(object.id, object.name, "unable to determine version");
    // }
  }
}

module.exports = ChangeLog;
