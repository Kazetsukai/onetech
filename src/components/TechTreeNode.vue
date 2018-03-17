<template>
  <div class="node">
    <ObjectImage :object="object" clickable="true" hover="true" class="object" />
    <div class="parents" v-if="parents">
      <TechTreeNode v-for="parent in parents" :object="parent" :parents="parent.parents" />
    </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';

export default {
  name: 'TechTreeNode',
  props: ['object', 'parents'],
  components: {
    ObjectImage
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
    right: 49.5%;
  }
  .node .node:only-child::after {
    display: none;
  }

  .parents {
    position: relative;
    padding: 1em 0;
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
