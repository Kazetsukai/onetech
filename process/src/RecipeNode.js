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
    this.collapsedParent = null;
  }

  addParent(parent) {
    this.parents.push(parent);
    if (parent.depth >= this.depth)
      this.updateDepth(parent.depth + 1);
    if (parent.tool)
      this.makeTool();
    parent.children.push(this);
  }

  updateDepth(depth) {
    this.depth = depth;
    this.children.forEach(child => child.updateDepth(depth + 1));
  }

  resetDepth() {
    const depths = this.parents.map(parent => {
      if (parent.collapsedParent)
        return parent.collapsedParent.depth;
      return parent.depth;
    });
    this.updateDepth(depths.sort((a,b) => b - a)[0] + 1);
  }

  makeTool() {
    if (this.tool) return;
    this.tool = true;
    this.children.forEach(child => child.makeTool());
  }

  showInStep(expand) {
    return !this.tool && !this.isIngredient() && (!this.isCollapsed() || expand);
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

  collapsedSubNodes() {
    return this.subNodes().filter(n => n.collapsedParent == this);
  }

  calculateSubNodes() {
    let subNodes = [];
    for (let child of this.uniqueChildren()) {
      if (child.canBeSubNode()) {
        subNodes.push(child);
        subNodes = subNodes.concat(child.subNodes());
      }
    }
    return subNodes.filter((s,i) => subNodes.indexOf(s) == i);
  }

  canBeSubNode() {
    return !this.tool && !this.isIngredient();
  }

  isExpandable() {
    return this.collapsedParent == this && this.collapsedSubNodes().length > 0;
  }

  isCollapsed() {
    return this.collapsedParent && this.collapsedParent != this;
  }

  subNodeDepth() {
    if (this.subNodes().length == 0)
      return 0;
    return this.subNodes().map(n => n.depth).sort((a,b) => b - a)[0] - this.depth;
  }

  uniqueChildren() {
    return this.children.filter((c,i) => this.children.indexOf(c) == i);
  }

  collapseBranches() {
    this.object
    if (this.collapsedParent)
      return;
    if (this.children.length > 1) {
      const children = this.uniqueChildren()
        .sort((a,b) => b.subNodes().length - a.subNodes().length);
      children[0].uncollapse();
      for (let i=1; i < children.length; i++) {
        children[i].collapse();
      }
    }
    for (let child of this.children) {
      child.collapseBranches();
    }
  }

  collapse(parent = null) {
    if (!parent || this.canCollapse(parent)) {
      this.collapsedParent = parent || this;
      this.children.forEach(c => c.collapse(parent || this));
    } else {
      this.resetDepth();
      this.collapseBranches();
    }
  }

  // Only collapse if the parents are all in the same collapsed branch
  canCollapse(parent) {
    return this.parents.filter(p => p.collapsedParent == parent).length == this.parents.length;
  }

  uncollapse() {
    if (!this.collapsedParent) return;
    this.collapsedParent = null;
    this.children.forEach(c => c.uncollapse());
  }

  jsonData(expand = false) {
    const data = {id: this.object.id};
    if (this.count() > 1)
      data.count = this.count();

    if (!expand && this.isExpandable()) {
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
    return RecipeNode.steps([this].concat(this.collapsedSubNodes()), true);
  }
}

module.exports = RecipeNode;
