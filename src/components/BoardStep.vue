<template>
  <div class="boardStep">
    <!-- What object is being used -->
    <div class="leftSide">
      <ObjectImage class="boardStepObject"
                  v-if="node.decay"
                  hover="true"
                  :decay="node.decay" />

      <ObjectImage class="boardStepObject"
                  v-else-if="actor || node.hand"
                  :hand="node.hand" hover="true"
                  :object="actor"
                  :uses="node.actorUses"
                  :clickable="actor"
                  :leftClick="clickObject" />

      <div class="plus" v-if="showPlus">+</div>

      <!-- What object is the target -->
      <ObjectImage class="boardStepObject"
                  v-if="target"
                  hover="true"
                  :object="target"
                  :uses="node.targetUses"
                  clickable="true"
                  :leftClick="clickObject" />

      <ObjectImage class="boardStepObject"
                  v-else-if="node.targetPlayer"
                  hover="true"
                  player="true" />

      <ObjectImage class="boardStepObject"
                  v-else
                  ground="true"
                  hover="true" />
    </div>

    <div class="arrow"></div>

    <div class="rightSide">
      <!-- What is the resulting object? -->
      <ObjectImage class="boardStepObject"
                  hover="true"
                  :object="result"
                  :uses="node.uses"
                  :weight="node.weight"
                  clickable="true"
                  :leftClick="clickObject" />
    </div>
  </div>
</template>

<script>
import GameObject from "../models/GameObject";

import ObjectImage from "./ObjectImage";

export default {
  props: ["step", "clickObject"],
  components: {
    ObjectImage
  },
  computed: {
    node() {
      return this.step.node;
    },
    showPlus() {
      return this.node.actorID || this.node.decay || this.node.hand;
    },
    actor() {
      return GameObject.find(this.node.actorID);
    },
    target() {
      return GameObject.find(this.node.targetID);
    },
    result() {
      return GameObject.find(this.node.id);
    }
  }
}
</script>

<style lang="scss" scoped>
  .boardStep {
    overflow: hidden;

    display: flex;
    align-items: center;

    background-color: #333;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  .boardStep .leftSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-right: 3px;
    background-color: #2c2c2c;
  }

  .boardStep .rightSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-left: 8px;
  }

  .boardStep .boardStepObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 70px;
    height: 70px;
  }
  .boardStep .boardStepObject:hover,
  .boardStep .boardStepObject.highlight {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .boardStep .boardStepObject.current {
    background-color: #444;
  }
  .boardStep .boardStepObject.current:hover {
    border: 1px solid transparent;
  }

  .boardStep .plus {
    z-index: 1;
    font-size: 16pt;
    margin: 0 2px;
  }

  .boardStep .arrow {
    z-index: 0;
    height: 0;
    width: 0;
    background-color: #333;
    border-top: 50px solid transparent;
    border-left: 25px solid #2c2c2c;
    border-bottom: 50px solid transparent;
    margin: -10px;
    margin-left: 0;
    margin-right: 0;
  }
</style>
