<template>
  <div class="objectSearch">
    <VueSelect label="name" :options="objects" v-model="tmpSelect" :on-change="selectObject">
      <template slot="option" slot-scope="option">
        <ObjectImage width="35px" height="35px" :object="option" />
        {{ option.name }}
      </template>
    </VueSelect>
  </div>
</template>

<script>
import VueSelect from 'vue-select';

import EventBus from '../services/EventBus';

import ObjectImage from './ObjectImage';

export default {
  props: ['objects', 'selectedObject'],
  data () {
    return {
      tmpSelect: null
    };
  },
  watch: {
    selectedObject (obj) {
      this.tmpSelect = obj;
    }
  },
  components: {
    VueSelect,
    ObjectImage
  },
  methods: {
    selectObject (obj) {
      console.log(obj);
      EventBus.$emit('object-selected', obj);
    }
  }
}
</script>

<style>
  .objectSearch .v-select .dropdown-toggle {
    background-color: #222;
    border: 2px solid #777;
  }

  .objectSearch .dropdown.v-select .dropdown-toggle * {
    color: #dcdcdc;
  }

  .objectSearch .dropdown.v-select .dropdown-menu {
    border: solid #777;
    background-color: #222;
    border-width: 0px 2px 2px 2px;
  }

  .objectSearch .dropdown.v-select .dropdown-menu li a {
    color: #dcdcdc;
  }

  .objectSearch .dropdown.v-select .dropdown-menu li.highlight > a {
    background-color: #333;
  }
</style>