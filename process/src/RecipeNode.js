"use strict";

class RecipeNode {
  static steps(nodes, expand = false) {
    const steps = [];
    nodes = nodes.sort((a,b) => b.subNodeDepth() - a.subNodeDepth()).
                  sort((a,b) => (b.collapsedParent ? 0 : 1) - (a.collapsedParent ? 0 : 1))
    for (let node of nodes) {
      if (node.showInStep(expand)) {
        if (!steps[node.depth()])
          steps[node.depth()] = []
        steps[node.depth()].push(node.jsonData(expand));
      }
    }
    return steps.filter(s => s).reverse();
  }

  constructor(object) {
    this.object = object;
    this.parents = [];
    this.children = [];
    this.decaySeconds = 0;
    this.tool = false;
    this.collapsedParent = null;
  }

  addParent(parent) {
    this.parents.push(parent);
    parent.children.push(this);
  }

  depth() {
    if (!this.cachedDepth) {
      this.cachedDepth = this.calculateDepth();
    }
    return this.cachedDepth;
  }

  calculateDepth() {
    if (this.parents.length === 0) {
      return 0;
    }
    let depths;
    if (this.collapsedParent && this.collapsedParent != this) {
      depths = this.parents.map(p => p.depth());
    } else {
      depths = this.parents.map(p => p.collapsedDepth());
    }
    return depths.sort((a,b) => b - a)[0] + 1;
  }

  collapsedDepth() {
    if (this.collapsedParent) {
      return this.collapsedParent.depth();
    }
    return this.depth();
  }

  makeTool(generator) {
    if (this.tool) return;
    this.tool = true;
    this.children.forEach(child => child.deleteToolNode(generator));
    this.children = [];
  }

  deleteToolNode(generator) {
    this.parents = this.parents.filter(p => !p.tool);
    if (this.parents.length === 0) {
      this.tool = true; // So children will remove this node
      this.children.forEach(child => child.deleteToolNode(generator));
      generator.deleteNode(this);
    }
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
    return this.subNodes().map(n => n.depth()).sort((a,b) => b - a)[0];
  }

  uniqueChildren() {
    return this.children.filter((c,i) => this.children.indexOf(c) == i);
  }

  trackMainBranch() {
    this.mainBranch = true;
    const child = this.uniqueChildren().sort((a,b) => b.subNodes().length - a.subNodes().length)[0];
    if (child) {
      child.trackMainBranch();
    }
  }

  collapseBranches() {
    for (let child of this.children) {
      if (child.mainBranch) {
        child.collapseBranches();
      } else {
        child.collapse();
      }
    }
  }

  largestChild() {
    if (!this.cachedLargestChild) {
      this.cachedLargestChild = this.children.sort((a,b) => b.subNodes().length - a.subNodes().length)[0];
    }
    return this.cachedLargestChild;
  }

  collapse(parent = null) {
    // Don't collapse the main branch
    if (this.mainBranch) {
      return;
    }
    // Reset collapse to this node if it has multiple collapsed parents
    if (!parent || this.differentCollapsedParent(parent)) {
      parent = this;
    }
    this.collapsedParent = parent;
    this.children.forEach(c => c.collapse(parent));
  }

  differentCollapsedParent(parent) {
    return this.parents.find(p => p.collapsedParent != parent);
  }

  jsonData(expand = false) {
    const data = {id: this.object.id};
    if (this.count() > 1) {
      data.count = this.count();
    }

    data.mainBranch = this.mainBranch;
    data.depth = this.depth();

    if (!expand && this.isExpandable()) {
      data.subSteps = this.subSteps();
      return data;
    }

    const transition = this.object.transitionsToward[0];
    if (transition.actor) {
      data.actorID = transition.actor.id;
      if (transition.lastUseActor && transition.actor.data.numUses > 1) {
        data.actorUses = transition.reverseUseActor ? "max" : "last";
      }
    }
    if (transition.target) {
      data.targetID = transition.target.id;
      if (transition.lastUseTarget && transition.target.data.numUses > 1) {
        data.targetUses = transition.reverseUseTarget ? "max" : "last";
      }
    }
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
