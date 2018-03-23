<template>
  <div class="techTree">
    <h2>{{name}}</h2>
    <h3>Tech Tree</h3>

    <h3 v-if="object.loading">Loading...</h3>

    <div v-else class="tree">
      <TechTreeNode
        :objectID="objectID"
        :nodes="object.techTree"
        :selectedID="subtrees[0] && subtrees[0].id"
        treeIndex="0"
        @expand="expand"
      />
    </div>

    <div class="tree subtree" v-for="(object, index) in subtrees" :key="index">
      <TechTreeNode
        :objectID="object.id"
        :nodes="object.techTree"
        :selectedID="subtrees[index+1] && subtrees[index+1].id"
        :treeIndex="index+1"
        @expand="expand"
      />
    </div>
  </div>
</template>

<script>
import ObjectService from '../services/ObjectService'

import TechTreeNode from './TechTreeNode';

export default {
  props: ['objectID'],
  components: {
    TechTreeNode
  },
  data () {
    return {
      object: null,
      subtrees: []
    };
  },
  beforeMount () {
    this.loadObject();
  },
  computed: {
    name () { return ObjectService.name(this.objectID); },
  },
  watch: {
    objectID () { this.loadObject(); }
  },
  methods: {
    loadObject () {
      this.object = {loading: true};
      ObjectService.fetchObject(this.objectID, obj => this.object = obj);
    },
    expand (objectID, treeIndex) {
      ObjectService.fetchObject(objectID, object => {
        this.subtrees = this.subtrees.slice(0, treeIndex).concat([object]);
      })
    }
  }
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
    box-sizing: border-box;
  }

  .subtree {
    border-top: dashed 1px #777;
    margin-top: 15px;
    padding-top: 10px;
  }
</style>
