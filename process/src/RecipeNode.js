"use strict";

class RecipeNode {
  static steps(nodes, expand = false) {
    const steps = [];
    for (let node of nodes) {
      if (node.showInStep(expand)) {
        if (!steps[node.depth])
          steps[node.depth] = []
        steps[node.depth].push(node.jsonData(expand));
      }
    }
    return steps.filter(s => s).reverse();
  }

  constructor(object) {
    this.object = object;
    this.parents = [];
    this.children = [];
    this.depth = 0;
    this.decaySeconds = 0;
    this.tool = false;
    this.collapsed = false;
    this.expandable = false;
  }

  addParent(parent) {
    this.parents.push(parent);
    this.updateDepth(parent.depth + 1);
    if (parent.tool)
      this.makeTool();
    parent.children.push(this);
  }

  updateDepth(depth) {
    if (depth > this.depth) {
      this.depth = depth;
      this.children.forEach(child => child.updateDepth(depth + 1));
    }
  }

  makeTool() {
    if (this.tool) return;
    this.tool = true;
    this.children.forEach(child => child.makeTool());
  }

  showInStep(expand) {
    return !this.tool && !this.isIngredient() && (!this.collapsed || expand);
  }

  isIngredient() {
    return !this.tool && (!this.object.depth.hasValue() || this.object.depth.difficulty == 0);
  }

  count() {
    if (this.tool) return 1;
    if (this.parents.length == 0) return 1;
    return this.parents.map(n => n.count()).reduce((t, c) => t + c, 0);
  }

  subNodes() {
    if (!this.cachedSubNodes)
      this.cachedSubNodes = this.calculateSubNodes();
    return this.cachedSubNodes;
  }

  calculateSubNodes() {
    let subNodes = [];
    for (let child of this.uniqueChildren()) {
      if (child.canBeSubNode()) {
        subNodes.push(child);
        subNodes = subNodes.concat(child.subNodes());
      }
    }
    return subNodes;
  }

  canBeSubNode() {
    return !this.tool && !this.isIngredient() && this.uniqueParents().length == 1;
  }

  subNodeDepth() {
    if (this.subNodes().length == 0)
      return 0;
    return this.subNodes().map(n => n.depth).sort((a,b) => b - a)[0] - this.depth;
  }

  uniqueChildren() {
    return this.children.filter((c,i) => this.children.indexOf(c) == i);
  }

  uniqueParents() {
    return this.parents.filter((p,i) => this.parents.indexOf(p) == i);
  }

  collapse() {
    this.expandable = true;
    for (let node of this.subNodes()) {
      node.collapsed = true;
    }
  }

  jsonData(expand = false) {
    const data = {id: this.object.id};
    if (this.count() > 1)
      data.count = this.count();

    if (!expand && this.expandable) {
      data.subSteps = this.subSteps();
      return data;
    }

    const transition = this.object.transitionsToward[0];
    if (transition.actor)
      data.actorID = transition.actor.id;
    if (transition.target)
      data.targetID = transition.target.id;
    if (this.decaySeconds)
      data.decay = transition.calculateDecay(this.decaySeconds);
    else if (transition.decay)
      data.decay = transition.decay;
    if (transition.hand)
      data.hand = true;
    if (transition.targetsPlayer())
      data.targetPlayer = true;

    return data;
  }

  subSteps() {
    return RecipeNode.steps([this].concat(this.subNodes()), true);
  }
}

module.exports = RecipeNode;
