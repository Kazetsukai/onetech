<template>
  <div class="node">
    <ObjectImage :object="object" clickable="true" hover="true" class="object" />
    <div class="children" v-if="leftChild || rightChild">
      <TechTreeNode v-if="leftChild" :object="leftChild" :parentObjects="[...parentObjects, object]" />
      <TechTreeNode v-if="rightChild" :object="rightChild" :parentObjects="[...parentObjects, object]" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import ObjectImage from './ObjectImage';

export default {
  name: 'TechTreeNode',
  props: ['object', 'parentObjects'],
  components: {
    ObjectImage
  },
  computed: {
    leftChild () {
      if (this.preferredTransition && !this.isParentObject(this.preferredTransition.actor)) {
        return this.preferredTransition.actor;
      }
    },
    rightChild () {
      if (this.preferredTransition && !this.isParentObject(this.preferredTransition.target)) {
        return this.preferredTransition.target;
      }
    },
    preferredTransition () {
      if (this.parentObjects.length < 5 && !this.object.natural) {
        let object = this.object;
        return _.sortBy(this.object.transitionsTo, function(transition) {
          var weight = 0;
          if (!transition.actor || !transition.target) {
            weight += 1;
          }
          if (transition.newActor) {
            weight += 1;
          }
          if (transition.decay) {
            weight += 1;
          }
          if (transition.newTarget != object) {
            weight += 1;
          }
          return weight;
        })[0];
      }
    },
  },
  methods: {
    isParentObject (object) {
      return _.indexOf(this.parentObjects, object) >= 0;
    }
  }
}
</script>

<style scoped>
  /* Graph from https://codepen.io/philippkuehn/pen/QbrOaN */
  .node {
    display: inline-block;
    vertical-align: top;
    text-align: center;
    position: relative;
    padding: 1em .5em 0 .5em;
  }
  .node .node::before, .node .node::after {
    content: '';
    position: absolute;
    top: 0;
    border-top: 1px solid #555;
    width: 52%;
    height: 1em;
  }
  .node .node::before {
    right: 50%;
  }
  .node .node::after {
    left: 50%;
    border-left: 1px solid #555;
  }
  .node .node:only-child::after, .node .node:only-child::before {
    display: none;
  }
  .node .node:only-child {
    padding-top: 0;
  }
  .node .node:first-child::before, .node .node:last-child::after {
    border: 0 none;
  }
  .node .node:last-child::before{
    border-right: 1px solid #555;
    border-radius: 0 5px 0 0;
  }
  .node .node:first-child::after{
    border-radius: 5px 0 0 0;
  }

  .children {
    position: relative;
    padding: 1em 0;
    white-space: nowrap;
    margin: 0 auto;
    text-align: center;
  }
  .children::after {
    content: '';
    display: table;
    clear: both;
  }
  .children::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    border-left: 1px solid #555;
    width: 0;
    height: 1em;
  }

  .node > .object {
    position: relative;
    top: 1px;
    width: 64px;
    height: 64px;
    border: 1px solid transparent;
    background-color: #444;
  }
  .node > .object:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }
</style>




