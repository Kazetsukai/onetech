<template>
  <div class="stepResult" v-bind:class="{selected}" @click="select">
    <ObjectImage class="stepItemObject"
                hover="true"
                :object="result"
                :uses="resultCount" />
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
  data() {
    return {
      selected: false
    };
  },
  computed: {
    result() {
      return GameObject.find(this.stepItem.id);
    },
    resultCount() {
      console.log(this.stepItem);
      if (this.stepItem.count)
        return `x${this.stepItem.count}`;
    }
  },
  methods: {
    select() {
      this.selected = !this.selected;
      this.$emit('click', this.stepItem);
    }
  }
}
</script>

<style scoped>
  .stepResult {
    display: flex;
    align-items: center;
    margin: 5px;
    border: solid 2px #333;
    border-radius: 5px;
  }

  .stepResult.selected {
    border-color: #aaa;
  }

  .stepResult .stepItemObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 80px;
    height: 80px;
  }
  .stepResult .stepItemObject:hover {
    cursor: pointer;
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
