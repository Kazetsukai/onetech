<template>
  <div class="recipeTransition">
    <!-- What object is being used -->
    <div class="leftSide">
      <ObjectImage class="recipeTransitionObject"
                  v-if="transition.decay"
                  hover="true"
                  :decay="transition.decay" />

      <ObjectImage class="recipeTransitionObject"
                  v-else-if="transition.actorID || transition.hand"
                  hand="true" hover="true"
                  :object="actor"
                  :clickable="transition.actorID" />

      <div class="plus" v-if="showPlus">+</div>

      <!-- What object is the target -->
      <ObjectImage class="recipeTransitionObject"
                  v-if="transition.targetID"
                  hover="true"
                  :object="target"
                  clickable="true" />

      <ObjectImage class="recipeTransitionObject"
                  v-else
                  ground="true"
                  hover="true" />
    </div>

    <div class="arrow"></div>

    <div class="rightSide">
      <!-- What is the resulting object? -->
      <ObjectImage class="recipeTransitionObject"
                  hover="true"
                  :object="result"
                  :uses="resultCount"
                  clickable="true" />
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: ['transition'],
  components: {
    ObjectImage
  },
  computed: {
    showPlus() {
      return this.transition.actorID || this.transition.decay || this.transition.hand;
    },
    actor() {
      return GameObject.find(this.transition.actorID);
    },
    target() {
      return GameObject.find(this.transition.targetID);
    },
    result() {
      return GameObject.find(this.transition.id);
    },
    resultCount() {
      if (this.transition.count)
        return `x${this.transition.count}`;
    }
  }
}
</script>

<style scoped>
  .recipeTransition {
    overflow: hidden;

    display: flex;
    align-items: center;

    background-color: #333;
    border-radius: 5px;
    margin: 10px;
    margin-top: 0;
  }

  .recipeTransition .leftSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-right: 3px;
    background-color: #2c2c2c;
  }

  .recipeTransition .rightSide {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-left: 8px;
  }

  .recipeTransition .recipeTransitionObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 70px;
    height: 70px;
  }
  .recipeTransition .recipeTransitionObject:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .recipeTransition .recipeTransitionObject.current {
    background-color: #444;
  }
  .recipeTransition .recipeTransitionObject.current:hover {
    border: 1px solid transparent;
  }

  .recipeTransition .plus {
    z-index: 1;
    font-size: 16pt;
    margin: 0 2px;
  }

  .recipeTransition .arrow {
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
