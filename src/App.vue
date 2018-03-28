<template>
  <div id="app">
    <h1>Crafting reference for One Hour One Life</h1>

    <h2 v-if="loading">Loading...</h2>

    <div v-else>
      <ObjectSearch :selectedObject="selectedObject" />

      <div v-if="selectedObject">
        <TechTree :object="selectedObject" v-if="showTechTree" />
        <ObjectInspector :object="selectedObject" v-else />
      </div>

      <div v-else>
        <div class="objectList">
          <div class="object" v-for="object in shownObjects" >
            <ObjectView :object="object" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import GameObject from './models/GameObject'

import ObjectView from './components/ObjectView';
import ObjectSearch from './components/ObjectSearch';
import ObjectInspector from './components/ObjectInspector';
import TechTree from './components/TechTree';

export default {
  name: 'app',
  components: {
    ObjectView,
    ObjectSearch,
    ObjectInspector,
    TechTree
  },
  data () {
    return {
      loading: true,
      showAmount: 24,
      selectedObject: null,
      showTechTree: false
    }
  },
  created () {
    window.onhashchange = () => this.parseHash();
    window.onscroll = () => this.handleScroll();
  },
  beforeMount () {
    GameObject.load(() => {
      this.loading = false;
      this.parseHash();
    });
  },
  computed: {
    shownObjects () {
      return GameObject.first(this.showAmount);
    }
  },
  methods: {
    parseHash () {
      if (this.loading) return;
      if (!window.location.hash) {
        this.selectedObject = null;
        this.showTechTree = false;
        this.showAmount = 24;
      } else {
        const path = window.location.hash.split('#')[1].split('/');
        const object = GameObject.find(path[0]);
        if (object) {
          this.selectedObject = object;
          this.selectedObject.loadData();
          this.showTechTree = (path[2] == "tech-tree");
        }
      }
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.updateTitle();
    },
    updateTitle () {
      var parts = []
      if (this.selectedObject) {
        parts.push(this.selectedObject.name);
        if (this.showTechTree)
          parts.push("Tech Tree");
      } else {
        parts.push("Crafting reference for One Hour One Life");
      }
      parts.push("onetech");
      document.title = parts.join(" - ");
    },
    handleScroll () {
      if (!this.selectedObject) {
        if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
          if (!this.loadingMore) {
            this.loadingMore = true;
            this.showAmount += 24;
          }
        } else {
          this.loadingMore = false;
        }
      }
    }
  },
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
