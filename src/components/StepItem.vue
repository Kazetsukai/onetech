<template>
  <div class="stepItem">
    <!-- What object is being used -->
    <div class="parts">
      <ObjectImage class="stepItemObject"
                  v-if="stepItem.decay"
                  hover="true"
                  :decay="stepItem.decay" />

      <ObjectImage class="stepItemObject"
                  v-else-if="stepItem.actorID || stepItem.hand"
                  hand="true" hover="true"
                  :object="actor"
                  :clickable="stepItem.actorID" />

      <div class="plus" v-if="showPlus">+</div>

      <!-- What object is the target -->
      <ObjectImage class="stepItemObject"
                  v-if="stepItem.targetID"
                  hover="true"
                  :object="target"
                  clickable="true" />

      <ObjectImage class="stepItemObject"
                  v-else
                  ground="true"
                  hover="true" />
    </div>

    <div class="arrow"></div>

    <div class="result">
      <!-- What is the resulting object? -->
      <ObjectImage class="stepItemObject"
                  hover="true"
                  :object="result"
                  clickable="true" />
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: ['stepItem'],
  components: {
    ObjectImage
  },
  computed: {
    showPlus() {
      return this.stepItem.actorID || this.stepItem.decay || this.stepItem.hand;
    },
    actor() {
      return GameObject.find(this.stepItem.actorID);
    },
    target() {
      return GameObject.find(this.stepItem.targetID);
    },
    result() {
      return GameObject.find(this.stepItem.id);
    }
  }
}
</script>

<style scoped>
  .stepItem {
    overflow: hidden;

    display: flex;
    align-items: center;

    background-color: #333;
    border-radius: 5px;
    margin: 10px;
  }

  .stepItem .parts {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-right: 3px;
    background-color: #2c2c2c;
  }

  .stepItem .result {
    display: flex;
    align-items: center;
    padding: 10px;
    padding-left: 8px;
  }

  .stepItem .stepItemObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 70px;
    height: 70px;
  }
  .stepItem .stepItemObject:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .stepItem .stepItemObject.current {
    background-color: #444;
  }
  .stepItem .stepItemObject.current:hover {
    border: 1px solid transparent;
  }

  .stepItem .plus {
    z-index: 1;
    font-size: 16pt;
    margin: 0 2px;
  }

  .stepItem .arrow {
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
