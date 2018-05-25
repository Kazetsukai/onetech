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

    return result.stdout;
  }

  runLines(...args) {
    return this.run(...args).split("\n").filter(l => l);
  }

  tags() {
    return this.runLines("tag", "-l");
  }

  fileChanges(from, to) {
    return this.runLines("diff", "--name-status", `${from}..${to}`).map(line => line.split(/\s+/));
  }

  fileContent(sha, path) {
    return this.run("show", `${sha}:${path}`);
  }

  log(from, to) {
    const lines = this.runLines("log", "--format=%H %ad %s", "--date=iso-strict", `${from}..${to}`);
    return lines.map(line => {
      const parts = line.match(/^(.+?) (.+?) (.+?)$/).slice(1);
      return {
        sha: parts[0],
        date: new Date(parts[1]),
        message: parts[2],
      };
    });
  }
}

module.exports = Git;
