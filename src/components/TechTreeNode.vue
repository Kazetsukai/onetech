<template>
  <div class="node">
    <ObjectImage v-if="decay" :decay="decay" hover="true" class="object" />
    <ObjectImage v-else :objectID="objectID" clickable="true" hover="true" class="object" />
    <div class="nodes" v-if="nodes">
      <TechTreeNode
        v-for="(node, index) in nodes"
        :objectID="node.id"
        :decay="node.decay"
        :nodes="node.nodes"
        :selectedID="selectedID"
        :key="index"
        @expand="expandTree"
      />
      <div class="expand"
        v-if="nodes.length == 0"
        v-bind:class="{selected: selectedID == objectID}"
        @click="expandTree(objectID)"
      >
        &#9660;
      </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';

export default {
  name: 'TechTreeNode',
  props: ['objectID', 'nodes', 'decay', 'selectedID'],
  components: {
    ObjectImage
  },
  methods: {
    expandTree (objectID) {
      this.$emit('expand', objectID);
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

  .nodes {
    position: relative;
    padding-top: 12px;
    white-space: nowrap;
    margin: 0 auto;
    text-align: center;
  }
  .nodes::after {
    content: '';
    display: table;
    clear: both;
  }
  .nodes::before {
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

  .node > .object.current {
    background-color: #444;
  }
  .node > .object.current:hover {
    border: 1px solid transparent;
  }

  .nodes > .expand {
    margin-top: -5px;
    color: #555;
    cursor: default;
  }
  .nodes > .expand:hover {
    color: #999;
  }
  .nodes > .expand.selected {
    color: #ccc;
    margin-top: -6px;
    font-size: 20px;
  }
</style>
