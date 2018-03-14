<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2 v-if="!gameData">Loading...</h2>

    <div v-if="gameData">
      <ObjectSearch :objects="nonNilObjects" :selectedObject="selectedObject" />

      <div v-if="selectedObject">
        <TechTree :object="selectedObject" v-if="showTechTree" />
        <ObjectInspector :object="selectedObject" v-else />
      </div>

      <div v-if="!selectedObject">
        <div class="objectList">
          <div class="object" v-for="object in firstFewObjects" >
            <ObjectView :object="object" />
          </div>
          <div class="showMore">
            <a href="#" onclick="return false" @click="showAmount = Math.min(nonNilObjects.length, showAmount + 90)" v-if="showAmount < nonNilObjects.length">Show more...</a>
          </div>
        </div>
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
import TechTree from './components/TechTree';

export default {
  name: 'app',
  data () {
    return {
      msg: 'Crafting reference for One Hour One Life',
      gameData: null,
      showAmount: 90,
      selectedObject: null,
      currentRoute: window.location.hash
    }
  },
  methods: {
    load () {
      let vue = this;

      vue.gameData = null;

      GameDataService.loadGameData()
      .then(data => {
        vue.gameData = data;
        vue.objectFromUrl();
      });
    },
    objectFromUrl () {
      console.log("OBJECT FROM URL");
      if (!this.gameData) return;
      if (!window.location.hash) {
        this.selectedObject = null;
      } else {
        console.log(window.location.hash);
        let path = window.location.hash.split('#')[1].split('/');
        this.selectedObject = this.gameData.objectMap[path[0]];
        this.showTechTree = (path[2] == "tech-tree");
      }
    }
  },
  computed: {
    nonNilObjects () {
      return _.filter(this.gameData.objects, _.negate(_.isNil));
    },
    firstFewObjects () {
      return _.take(this.nonNilObjects, this.showAmount);
    }
  },
  beforeMount () {
    this.load();
  },
  created () {
    let vue = this;

    EventBus.$on('object-selected', object => {
      if (object) {
        console.log("Object selected: " + object.name);
        window.location.hash = '#' + object.id + '/' + encodeURIComponent(object.name.split(' ').join('-'));
      }
      else {
        console.log("Object cleared");
        window.location.hash = '#';
      }
      vue.showAmount = 90;
    });

    EventBus.$on('visit-tech-tree', object => {
      window.location.hash = window.location.hash + '/tech-tree';
    });

    window.onhashchange = () => vue.objectFromUrl();
  },
  components: {
    ObjectView,
    ObjectSearch,
    ObjectInspector,
    TechTree
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
  }

  .objectList {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  .showMore {
    width: 100%;
    padding: 10px;
    text-align: center;

    display: flex;
    flex-direction: column;

    > a {
      color: #ccc;
    }
  }
</style>
