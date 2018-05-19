"use strict";

const { spawnSync } = require('child_process');

class Git {
  constructor(dir) {
    this.dir = dir;
  }

  run(...args) {
    const result = spawnSync("git", args, {cwd: this.dir, encoding: 'utf8'});
    if (result.status > 0) {
      console.log("Git command failed with args", args);
      console.log(result.stderr);
      throw "Git command failed. See log for reason.";
    }

    return result.stdout.split("\n").filter(l => l);
  }

  tags() {
    return this.run("tag", "-l");
  }

  diff(from, to) {
    return this.run("diff", "--name-status", `${from}..${to}`);
  }
}

module.exports = Git;
