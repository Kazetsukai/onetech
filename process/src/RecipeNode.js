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
    this.updateDepth(parent.depth + 1);
    if (parent.tool)
      this.makeTool();
    parent.children.push(this);
  }

  updateDepth(depth) {
    if (this.depth < depth) {
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
    return this.subNodes().map(n => n.depth).sort((a,b) => b - a)[0];
  }

  collapsedDepth() {
    return this.collapsedParent ? this.collapsedParent.depth : this.depth;
  }

  deepestParent() {
    return this.parents.sort((a,b) => b.collapsedDepth() - a.collapsedDepth())[0];
  }

  uniqueChildren() {
    return this.children.filter((c,i) => this.children.indexOf(c) == i);
  }

  immediateUniqueChildren() {
    return this.children.filter((c,i) => this.children.indexOf(c) == i && c.depth == this.depth+1);
  }

  collapseBranches() {
    if (this.collapsedParent) {
      return;
    }
    if (this.children.length > 1) {
      const children = this.immediateUniqueChildren().sort((a,b) => b.subNodeDepth() - a.subNodeDepth());
      // Collapse all except first (deepest) child
      for (let i = 1; i < children.length; i++) {
        children[i].collapse();
      }
    }
    for (let child of this.children) {
      child.collapseBranches();
    }
  }

  collapse(parent = null) {
    // Don't collapse child if it has a deep uncollapsed parent
    if (parent && this.deepestParentIsUncollapsed()) {
      return;
    }
    // Reset collapse to this node if it has multiple collapsed parents
    if (!parent || this.differentCollapsedParent(parent)) {
      parent = this;
      // Reset depth so we aren't left behind
      this.depth = this.deepestParent().collapsedDepth()+1;
    }
    this.collapsedParent = parent;
    this.children.forEach(c => c.collapse(parent));
  }

  deepestParentIsUncollapsed() {
    const parent = this.deepestParent();
    return parent && !parent.collapsedParent;
  }

  differentCollapsedParent(parent) {
    return this.parents.find(p => p.collapsedParent != parent);
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
    if (transition.newActor == this.object && transition.newActorWeight)
      data.weight = transition.newActorWeight;
    if (transition.newTarget == this.object && transition.newTargetWeight)
      data.weight = transition.newTargetWeight;
    if (this.decaySeconds)
      data.decay = transition.calculateDecay(this.decaySeconds);
    else if (transition.decay)
      data.decay = transition.decay;
    if (transition.hand())
      data.hand = true;
    if (transition.targetsPlayer())
      data.targetPlayer = true;

    return data;
  }

  subSteps() {
    return RecipeNode.steps([this].concat(this.collapsedSubNodes()), true);
  }

  parentsAreTools() {
    return this.parents.filter(p => p.tool).length == this.parents.length;
  }
}

module.exports = RecipeNode;
