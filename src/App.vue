<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2 v-if="!objects">Loading...</h2>

    <div v-if="objects">
      <ObjectSearch :objects="nonNilObjects" :selectedObject="selectedObject" />

      <div v-if="selectedObject">
        <TechTree :object="selectedObject" :objectData="selectedObjectData" v-if="showTechTree" />
        <ObjectInspector :object="selectedObject" :objectData="selectedObjectData" v-else />
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
      objects: null,
      showAmount: 90,
      selectedObject: null,
      selectedObjectData: {loading: true},
      currentRoute: window.location.hash
    }
  },
  methods: {
    loadObjects () {
      let vue = this;
      fetch("./static/objects.json").then(data => {
        return data.json();
      }).then(data => {
        vue.objects = data;
        vue.parseHash();
      });
    },
    loadSelectedObjectData () {
      let vue = this;
      if (this.selectedObject) {
        vue.selectedObjectData = {loading: true};
        fetch("./static/objects/" + this.selectedObject.id + ".json").then(data => {
          return data.json();
        }).then(data => {
          vue.selectedObjectData = data;
        });
      }
    },
    parseHash () {
      if (!this.objects) return;
      if (!window.location.hash) {
        this.selectedObject = null;
        this.showTechTree = false;
      } else {
        let path = window.location.hash.split('#')[1].split('/');
        if (!this.selectedObject || path[0] != this.selectedObject.id) {
          this.selectedObject = _.find(this.objects, o => o.id == path[0]);
          this.showTechTree = (path[2] == "tech-tree");
          this.loadSelectedObjectData();
        }
      }
    }
  },
  computed: {
    nonNilObjects () {
      return _.filter(this.objects, _.negate(_.isNil));
    },
    firstFewObjects () {
      return _.take(this.nonNilObjects, this.showAmount);
    }
  },
  beforeMount () {
    this.loadObjects();
    this.parseHash();
  },
  created () {
    let vue = this;

    EventBus.$on('object-selected', object => {
      if (object) {
        console.log("Object selected: " + object.name);
        window.location.hash = '#' + object.id + '/' + encodeURIComponent(object.name.split(' ').join('-'));
      } else {
        console.log("Object cleared");
        window.location.hash = '#';
      }
      vue.showAmount = 90;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });

    EventBus.$on('visit-tech-tree', object => {
      window.location.hash = window.location.hash + '/tech-tree';
    });

    window.onhashchange = () => vue.parseHash();
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
    padding: 0 20px;
    max-width: 1024px;
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

  .objectList > .object {
    min-width: 200px;
    width: 33.3333%;
  }

  @media only screen and (max-width: 768px) {
    .objectList > .object {
      min-width: 150px;
      width: 50%;
    }
  }
</style>
