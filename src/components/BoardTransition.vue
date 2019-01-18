<template>
  <div class="boardTransition">
    <!-- What object is being used -->
    <div class="leftSide">
      <ObjectImage class="boardTransitionObject"
                  v-if="transition.decay"
                  hover="true"
                  :decay="transition.decay" />

      <ObjectImage class="boardTransitionObject"
                  v-else-if="transition.actor || transition.hand"
                  :hand="transition.hand" hover="true"
                  :object="actor"
                  :uses="transition.actorUses"
                  :clickable="transition.actor"
                  :leftClick="clickObject" />

      <div class="plus" v-if="showPlus">+</div>

      <!-- What object is the target -->
      <ObjectImage class="boardTransitionObject"
                  v-if="transition.target"
                  hover="true"
                  :object="target"
                  :uses="transition.targetUses"
                  clickable="true"
                  :leftClick="clickObject" />

      <ObjectImage class="boardTransitionObject"
                  v-else-if="transition.targetPlayer"
                  hover="true"
                  player="true" />

      <ObjectImage class="boardTransitionObject"
                  v-else
                  ground="true"
                  hover="true" />
    </div>

    <div class="arrow"></div>

    <div class="rightSide">
      <!-- What is the resulting object? -->
      <ObjectImage class="boardTransitionObject"
                  hover="true"
                  :object="result"
                  :uses="transition.uses"
                  :weight="transition.weight"
                  clickable="true"
                  :leftClick="clickObject" />
    </div>
  </div>
</template>

<script>
import GameObject from "../models/GameObject";

import ObjectImage from "./ObjectImage";

export default {
  props: ["transition", "clickObject"],
  components: {
    ObjectImage
  },
  computed: {
    showPlus() {
      return this.transition.actor || this.transition.decay || this.transition.hand;
    },
    actor() {
      return this.transition.actor && GameObject.find(this.transition.actor.id);
    },
    target() {
      return this.transition.target && GameObject.find(this.transition.target.id);
    },
    result() {
      return GameObject.find(this.transition.id);
    }
  }
}
</script>

<style lang="scss" scoped>
  .boardTransition {
    overflow: hidden;

    display: flex;
    align-items: center;

    background-color: #333;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  .boardTransition .leftSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-right: 3px;
    background-color: #2c2c2c;
  }

  .boardTransition .rightSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-left: 8px;
  }

  .boardTransition .boardTransitionObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 70px;
    height: 70px;
  }
  .boardTransition .boardTransitionObject:hover,
  .boardTransition .boardTransitionObject.highlight {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .boardTransition .boardTransitionObject.current {
    background-color: #444;
  }
  .boardTransition .boardTransitionObject.current:hover {
    border: 1px solid transparent;
  }

  .boardTransition .plus {
    z-index: 1;
    font-size: 16pt;
    margin: 0 2px;
  }

  .boardTransition .arrow {
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
