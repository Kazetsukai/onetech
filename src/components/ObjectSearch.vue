<template>
  <div class="objectSearch">
    <VueSelect label="name" :options="sortedOptions" v-model="selectedOption" :on-change="selectObject">
      <template slot="option" slot-scope="option">
        <ObjectImage :objectID="option.id" />
        {{option.name}}
      </template>
    </VueSelect>
  </div>
</template>

<script>
import _ from 'lodash';

import ObjectService from '../services/ObjectService'

import VueSelect from './Select';
import ObjectImage from './ObjectImage';

export default {
  props: ['selectedObjectID'],
  components: {
    VueSelect,
    ObjectImage
  },
  computed: {
    options () {
      return ObjectService.ids.map(id => {
        return {id: id, name: ObjectService.name(id)};
      });
    },
    sortedOptions () {
      return _.sortBy(this.options, option => option.name.length);
    },
    selectedOption () {
      return this.options.find(option => option.id == this.selectedObjectID);
    }
  },
  methods: {
    selectObject (option) {
      if (!option)
        window.location = '#';
      else if (option.id != this.selectedObjectID)
        window.location = ObjectService.url(option.id);
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
