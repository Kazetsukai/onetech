<template>
  <div class="techTree">
    <h2>{{object.name}}</h2>
    <h3>Tech Tree</h3>

    <div class="tree">
      <TechTreeNode
        :object="object"
        :parents="objectData.techTree"
        :selected="subtrees[0]"
        treeIndex="0"
      />
    </div>

    <h3 v-if="objectData.loading">Loading...</h3>

    <div class="tree subtree" v-for="(object, index) in subtrees" :key="index">
      <TechTreeNode
        :object="object"
        :parents="object.techTree"
        :selected="subtrees[index+1]"
        :treeIndex="index+1"
      />
    </div>
  </div>
</template>

<script>
import EventBus from '../services/EventBus';

import TechTreeNode from './TechTreeNode';

export default {
  props: ['object', 'objectData'],
  components: {
    TechTreeNode
  },
  data () {
    return {
      subtrees: []
    };
  },
  created () {
    let vue = this;

    EventBus.$on('expand-tree', (object, treeIndex) => {
      fetch(STATIC_PATH + "/objects/" + object.id + ".json").then(data => {
        return data.json();
      }).then(data => {
        vue.subtrees = vue.subtrees.slice(0, treeIndex).concat([data]);
      });
    });
  },
  destroyed () {
    EventBus.$off('expand-tree');
  },
}
</script>

<style scoped>
  .techTree {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .techTree > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }

  .techTree > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }

  .tree {
    text-align: center;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .subtree {
    border-top: dashed 1px #777;
    margin-top: 15px;
    padding-top: 10px;
  }
</style>
