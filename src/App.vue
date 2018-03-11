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
        <div class="objectList">
          <div class="object" v-for="object in firstFewObjects" >
            <ObjectView :object="object" />
          </div>
          <div class="showMore">
            <a href="#" onclick="return false" @click="showAmount = Math.min(nonNilObjects.length, showAmount + 30)" v-if="showAmount < nonNilObjects.length">Show more...</a>
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

export default {
  name: 'app',
  data () {
    return {
      msg: 'Crafting reference for One Hour One Life',
      gameData: null,
      showAmount: 30,
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
      if (!this.gameData) return;
      if (!window.location.hash) {
        this.selectedObject = null;  
      } else {
        let objid = window.location.hash.split('#')[1].split('/')[0];
        this.selectedObject = this.gameData.objectMap[objid];
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
      vue.showAmount = 30;
    });

    window.onhashchange = () => vue.objectFromUrl();
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
