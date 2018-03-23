<template>
  <div class="techTreeView">
    <h3 v-if="object.loading">Loading...</h3>

    <div v-else class="tree">
      <TechTreeNode
        :objectID="objectID"
        :nodes="object.techTree"
        :selectedID="selectedID"
        @expand="expand"
      />
    </div>

    <div v-if="selectedID" class="subtree">
      <TechTreeView :objectID="selectedID" />
    </div>
  </div>
</template>

<script>
import ObjectService from '../services/ObjectService'

import TechTreeView from './TechTreeView';
import TechTreeNode from './TechTreeNode';

export default {
  name: 'TechTreeView',
  props: ['objectID'],
  components: {
    TechTreeView,
    TechTreeNode
  },
  data () {
    return {
      object: null,
      selectedID: null,
    };
  },
  beforeMount () {
    this.loadObject();
  },
  watch: {
    objectID () { this.loadObject(); }
  },
  methods: {
    loadObject () {
      this.selectedID = null;
      this.object = {loading: true};
      ObjectService.fetchObject(this.objectID, obj => this.object = obj);
    },
    expand (objectID) {
      this.selectedID = objectID;
    }
  }
}
</script>

<style scoped>
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
