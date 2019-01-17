<template>
  <div class="objectSearch">
    <VueSelect ref="vueSelect" label="name" :options="objects" v-model="selectedObject" :on-change="selectObject" placeholder="Search">
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
  components: {
    VueSelect,
    ObjectImage
  },
  data() {
    // TODO: Remove duplication with watch
    if (this.$route.path.startsWith("/board/")) {
      return {
        onBoard: true,
        selectedObject: null
      };
    }
    return {
      onBoard: false,
      selectedObject: GameObject.find(this.$route.params.id)
    };
  },
  watch: {
    '$route' (to, from) {
      if (this.$route.path.startsWith("/board/")) {
        this.onBoard = true;
        this.selectedObject = null;
      } else {
        this.onBoard = false;
        this.selectedObject = GameObject.find(this.$route.params.id);
      }
    }
  },
  computed: {
    objects () {
      return GameObject.byNameLength();
    }
  },
  methods: {
    selectObject (object) {
      if (object == this.selectedObject) return;
      // It may be better to use a global event bus instead of hacking through route instances
      if (this.onBoard && this.$route.matched[0] && this.$route.matched[0].instances.default) {
        this.$route.matched[0].instances.default.addObject(object);
        this.$refs.vueSelect.clearSelection();
      } else {
        this.$router.push(object ? object.url() : "/");
      }
    }
  }
}
</script>

<style>
  .objectSearch {
    margin-top: 20px;
  }
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
