<template>
  <div class="objectSearch">
    <VueSelect label="name" :options="objects" v-model="selectedObject" :on-change="selectObject">
      <template slot="option" slot-scope="option">
        <ObjectImage :object="option" />
        {{option.name}}
      </template>
    </VueSelect>
  </div>
</template>

<script>
import _ from 'lodash';

import GameObject from '../models/GameObject'

import VueSelect from './Select';
import ObjectImage from './ObjectImage';

export default {
  props: ['selectedObject'],
  components: {
    VueSelect,
    ObjectImage
  },
  computed: {
    objects () {
      return GameObject.byName();
    }
  },
  methods: {
    selectObject (object) {
      if (object == this.selectedObject) return;
      window.location = object ? object.url() : '#';
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

  .objectSearch .dropdown.v-select .image {
    width: 35px;
    height: 35px;
  }
</style>
