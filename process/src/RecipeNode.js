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
    this.transition = this.object.transitionsToward[0];
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
    if (!this.countCache) {
      this.countCache = this.calculateCount();
    }
    return this.countCache;
  }

  calculateCount() {
    if (this.tool) return 1;
    if (this.parents.length == 0) return 1;
    return Math.ceil(this.parents.map(n => n.countFor(this)).reduce((t, c) => t + c, 0));
  }

  countFor(child) {
    if (this.count() == 1) {
      return 1;
    }
    return this.count() / this.availableUsesFor(child);
  }

  availableUsesFor(child) {
    // if (global.debug && child.object.id == 132) {
    //   debugger;
    // }
    let numUses = child.object.data.numUses || 1;
    if (numUses > 1 && !this.applyUseFor(child)) {
      numUses = 1;
    }
    return numUses + this.remainderUses(this.transition);
  }

  applyUseFor(child) {
    const transition = this.transition;
    if (transition.actor && transition.applyActorUse() && transition.target && transition.applyTargetUse()) {
      // This is a special case where both sides look like tools
      // So we don't want to consider them in the item count
      return false;
    }
    return transition.actor == child.object && transition.applyActorUse() ||
           transition.target == child.object && transition.applyTargetUse();
  }

  remainderUses(transition, depth = 0) {
    if (depth > 10) {
      console.log(`Detected infinite loop calculating remainder for ${this.object.name}`);
      // debugger;
      return 0;
    }
    const remainder = this.remainder(transition);
    if (remainder === this.object) {
      return 1;
    }
    if (remainder) {
      const remainderTransition = this.remainderUseTransition(remainder);
      if (remainderTransition && remainderTransition != transition && remainderTransition != this.transition) {
        return (remainder.data.numUses || 1) + this.remainderUses(remainderTransition, depth + 1);
      }
    }
    return 0;
  }

  // This is to check for a similar transition which results in the same object
  // Such as picking a charcoal out of a small charcoal pile
  remainderUseTransition(remainder) {
    for (let transition of remainder.transitionsAway) {
      if (transition.newActor === this.object || transition.newTarget === this.object) {
        // Make sure we are using the same actor or target so we don't count chisel being put on split rock again
        if (transition.actor === remainder && (!transition.target || transition.targetRemains && transition.target != this.object) ||
            transition.target === remainder && (!transition.actor || transition.tool && transition.actor != this.object)) {
          return transition;
        }
      }
    }
  }

  remainder(transition) {
    if (!transition) return null;
    if (transition.newActor === this.object) {
      return transition.newTarget;
    }
    return transition.newActor;
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

    const transition = this.transition;
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
