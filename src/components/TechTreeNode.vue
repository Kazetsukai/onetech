<template>
  <div class="node">
    <ObjectImage :object="object" clickable="true" hover="true" class="object" />
    <div class="parents" v-if="parents">
      <TechTreeNode
        v-for="(parent, index) in parents"
        :object="parent"
        :parents="parent.parents"
        :selected="selected"
        :treeIndex="treeIndex"
        :key="index"
      />
      <div class="expand"
        v-if="parents.length == 0"
        v-bind:class="{selected: selected && selected.id == object.id}"
        @click="expandTree()"
      >
        &#9660;
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '../services/EventBus';

import ObjectImage from './ObjectImage';

export default {
  name: 'TechTreeNode',
  props: ['object', 'parents', 'treeIndex', 'selected'],
  components: {
    ObjectImage
  },
  methods: {
    expandTree () {
      EventBus.$emit('expand-tree', this.object, this.treeIndex);
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
    padding: 12px 6px 0 6px;
  }
  .node .node::before, .node .node::after {
    content: '';
    position: absolute;
    top: 0;
    border-top: 1px solid #555;
    width: 52%;
    height: 12px;
  }
  .node .node::before {
    right: 50%;
  }
  .node .node::after {
    left: 50%;
    border-left: 1px solid #555;
  }
  .node .node:first-child::before, .node .node:last-child::after {
    border: 0 none;
  }
  .node .node:last-child::before{
    border-right: 1px solid #555;
    border-radius: 0 5px 0 0;
  }
  .node .node:first-child::after {
    border-radius: 5px 0 0 0;
  }
  .node .node:only-child::before {
    border-radius: 0;
    right: 50%;
  }
  .node .node:only-child::after {
    display: none;
  }

  .parents {
    position: relative;
    padding-top: 12px;
    white-space: nowrap;
    margin: 0 auto;
    text-align: center;
  }
  .parents::after {
    content: '';
    display: table;
    clear: both;
  }
  .parents::before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - 1px);
    border-left: 1px solid #555;
    width: 0;
    height: 12px;
  }

  .node > .object {
    position: relative;
    top: 1px;
    width: 80px;
    height: 80px;
    border: 1px solid transparent;
    background-color: #444;
  }
  .node > .object:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .parents > .expand {
    margin-top: -5px;
    color: #555;
    cursor: default;
  }
  .parents > .expand:hover {
    color: #999;
  }
  .parents > .expand.selected {
    color: #ccc;
    margin-top: -6px;
    font-size: 20px;
  }
</style>
