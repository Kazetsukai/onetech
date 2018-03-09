<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2 v-if="!gameData">Loading...</h2>

    <div v-if="gameData">
      <ObjectSearch :objects="nonNilObjects" :selectedObject="selectedObject" />
      
      <div v-if="selectedObject">
        <ObjectInspector :object="selectedObject" />
      </div>
      
      <div v-if="!selectedObject">
        <ul class="object-list">
          <div class="object" v-for="object in nonNilObjects" >
            <ObjectView :object="object" />
          </div>
        </ul>
      </div>

    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import GameDataService from './services/GameDataService';
import EventBus from './services/EventBus';

import ObjectView from './components/ObjectView';
import ObjectSearch from './components/ObjectSearch';
import ObjectInspector from './components/ObjectInspector';

export default {
  name: 'app',
  data () {
    return {
      msg: 'Auto-generated crafting guide for One Hour One Life',
      gameData: null,
      selectedObject: null
    }
  },
  methods: {
    load () {
      let vue = this;

      vue.gameData = null;

      GameDataService.loadGameData()
      .then(data => {
        vue.gameData = data;
        console.dir(vue);
      });
    }
  },
  computed: {
    nonNilObjects () {
      return _.filter(this.gameData.objects, _.negate(_.isNil));
    }
  },
  beforeMount () {
    this.load();
  },
  created () {
    let vue = this;

    EventBus.$on('object-selected', object => {
      if (object)
        console.log("Object selected: " + object.name);
      else
        console.log("Object cleared");
      vue.selectedObject = object;
    });
  },
  components: {
    ObjectView,
    ObjectSearch,
    ObjectInspector
  }
}
</script>

<style lang="scss">
  body { 
    background-color: #151515;
    margin: 0 auto;
    width: 1024px;
    padding-left: calc(100vw - 100%);
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #d3d3d3;
    margin-top: 60px;
  }

  h1, h2 {
    font-weight: normal;
    text-align: center;
  }

  ul {
  }

  li {
    text-align: left;
  }

  a {
    color: #42b983;
  }

  .object {
    float: left;
  }
</style>
