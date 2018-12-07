"use strict";

const GameObject = require('./GameObject');
const Transition = require('./Transition');

class ChangeLogCommit {
  constructor(version, log) {
    this.version = version;
    this.git = version.git;
    this.objects = version.objects;
    this.legacyObjects = {};
    this.sha = log.sha;
    this.date = log.date;
    this.message = log.message;
    this.addedObjects = [];
    this.removedObjects = [];
    this.addedTransitions = [];
    this.removedTransitions = [];
    this.objectChanges = [];
    this.parseChanges();
  }

  isRelavent() {
    if (this.message.includes("dataVersionNumber"))
      return false;
    if (this.message.startsWith("Merge branch"))
      return false;
    return true
  }

  parseChanges() {
    const changes = this.git.fileChanges(this.sha + "^", this.sha);
    for (let change of changes) {
      if (change[1].startsWith("objects"))
        this.parseObjectChange(change[1], change[0]);
      else if (change[1].startsWith("transitions"))
        this.parseTransitionChange(change[1], change[0]);
    }
  }

  parseObjectChange(path, mode) {
    const id = path.split("/")[1].split(".")[0];
    if (mode == "A") {
      const object = this.lookupObject(path, mode);
      if (object)
        this.addedObjects.push(object);
    } else if (mode == "D") {
      const object = this.lookupObject(path, mode);
      if (object)
        this.removedObjects.push(object);
    } else if (mode == "M") {
      this.addObjectChange(path);
    }
  }

  parseTransitionChange(path, mode) {
    if (mode == "A") {
      const transition = this.createTransition(path, mode);
      this.addedTransitions.push(transition);
    } else if (mode == "D") {
      const transition = this.createTransition(path, mode);
      this.removedTransitions.push(transition);
    } else if (mode == "M") {
      const newTransition = this.createTransition(path, "A");
      const oldTransition = this.createTransition(path, "D");
      if (this.isSignificantChange(oldTransition, newTransition)) {
        this.parseTransitionChange(path, "D");
        this.parseTransitionChange(path, "A");
      }
    }
  }

  isSignificantChange(oldTransition, newTransition) {
    if (oldTransition.actorID != newTransition.actorID)
      return true;
    if (oldTransition.targetID != newTransition.targetID)
      return true;
    if (oldTransition.newActorID != newTransition.newActorID)
      return true;
    if (oldTransition.newTargetID != newTransition.newTargetID)
      return true;
    if (oldTransition.decay != newTransition.decay)
      return true;
    return false;
  }

  lookupObject(path, mode) {
    const id = path.split("/")[1].split(".")[0];

    if (this.objects[id]) {
      if (!this.objects[id].isVisible())
        this.legacyObjects[id] = this.objects[id];
      return this.objects[id];
    }

    if (this.legacyObjects[id])
      return this.legacyObjects[id];

    const data = this.fileContent(path, mode);

    const object = new GameObject(data);
    object.legacy = true;
    this.legacyObjects[id] = object;

    return object;
  }

  createTransition(path, mode) {
    const content = this.fileContent(path, mode);
    const filename = path.split("/")[1];
    const transition = new Transition(content, filename);
    this.setTransitionObject(transition, "actor", mode)
    this.setTransitionObject(transition, "target", mode)
    this.setTransitionObject(transition, "newActor", mode)
    this.setTransitionObject(transition, "newTarget", mode)
    return transition;
  }

  setTransitionObject(transition, key, mode) {
    const id = transition[key + "ID"];
    if (id > 1) {
      transition[key] = this.lookupObject(`objects/${id}.txt`, mode)
    }
  }

  addObjectChange(path) {
    const before = new GameObject(this.git.fileContent(`${this.sha}^`, path));
    const after = new GameObject(this.git.fileContent(this.sha, path));
    const change = this.objectChange(before, after);
    if (change)
      this.objectChanges.push(this.objectChange(before, after));
  }

  ignoredAttributes() {
    return [
      "slotPos",
      "pixHeight",
      "parent",
      "sounds",
      "useVanishIndex",
      "useAppearIndex",
      "heldOffset",
      "creationSoundInitialOnly",
      "floorHugging",
      "vertSlotRot",
      "permanent",
      "drawBehindPlayer"
    ];
  }

  objectChange(before, after) {
    const ignore = this.ignoredAttributes();
    const attributes = {};
    for (let attribute in after.data) {
      if (ignore.includes(attribute))
        continue;
      if (typeof before.data[attribute] == 'undefined')
        continue;
      if (String(before.data[attribute]) != String(after.data[attribute])) {
        attributes[attribute] = {from: before.data[attribute], to: after.data[attribute]};
      }
    }
    if (Object.keys(attributes).length == 0)
      return;
    return {id: after.id, attributes: attributes};
  }

  fileContent(path, mode) {
    const sha = (mode == "D" ? `${this.sha}^` : this.sha);
    return this.git.fileContent(sha, path);
  }

  jsonData() {
    const data = {sha: this.sha, message: this.message, date: this.date};

    if (this.addedObjects.length)
      data.addedObjectIDs = this.addedObjects.map(o => o.id);

    if (this.removedObjects.length)
      data.removedObjectIDs = this.removedObjects.map(o => o.id);

    const addedTransitions = this.filterTransitions(this.addedTransitions);
    if (addedTransitions.length)
      data.addedTransitions = addedTransitions.map(t => t.jsonData());

    const removedTransitions = this.filterTransitions(this.removedTransitions);
    if (removedTransitions.length)
      data.removedTransitions = removedTransitions.map(t => t.jsonData());

    if (this.objectChanges.length)
      data.objectChanges = this.objectChanges;

    if (Object.values(this.legacyObjects).length)
      data.legacyObjects = Object.values(this.legacyObjects).map(o => this.legacyObjectData(o));

    return data;
  }

  filterTransitions(transitions) {
    let ids = this.addedObjects.map(o => o.id);
    ids = ids.concat(Object.keys(this.legacyObjects));
    ids = ids.concat(this.removedObjects.map(o => o.id));
    return transitions.filter(t => !ids.includes(t.actorID) && !ids.includes(t.targetID));
  }

  legacyObjectData(object) {
    return {id: object.id, name: object.name, category: !!object.category};
  }
}

module.exports = ChangeLogCommit;
