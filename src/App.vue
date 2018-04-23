<template>
  <div id="app">
    <h1>Crafting reference for One Hour One Life</h1>

    <h2 v-if="loading">Loading...</h2>

    <div v-else>
      <ObjectSearch :selectedObject="selectedObject" />

      <div v-if="selectedObject">
        <TechTree :object="selectedObject" v-if="subpage == 'tech-tree'" />
        <Recipe :object="selectedObject" v-else-if="subpage == 'recipe'" />
        <ObjectInspector :object="selectedObject" v-else />
      </div>

      <div v-else>
        <div class="filterList">
          <div class="filter" v-for="filter in filters" >
            <ObjectFilter :filter="filter" :selected="filter == selectedFilter" />
          </div>
        </div>
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
import ObjectFilter from './components/ObjectFilter';
import ObjectInspector from './components/ObjectInspector';
import TechTree from './components/TechTree';
import Recipe from './components/Recipe';

export default {
  name: 'app',
  components: {
    ObjectView,
    ObjectSearch,
    ObjectFilter,
    ObjectInspector,
    TechTree,
    Recipe,
  },
  data () {
    return {
      loading: true,
      showAmount: 24,
      selectedObject: null,
      selectedFilter: null,
      subpage: false,
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
      return GameObject.objects(this.showAmount, this.selectedFilter);
    },
    filters () {
      return GameObject.filters;
    }
  },
  methods: {
    parseHash () {
      if (this.loading) return;
      if (!window.location.hash) {
        this.selectedObject = null;
        this.selectedFilter = null;
        this.subpage = false;
        this.showAmount = 24;
        this.scrollTop();
      } else {
        const path = window.location.hash.split('#')[1].split('/');
        this.routePath(path);
      }
      this.updateTitle();
    },
    routePath (path) {
      if (path[0] == "filter") {
        this.selectedFilter = GameObject.findFilter(path[1]);
        this.selectedObject = null;
        this.subpage = false;
      } else {
        const object = GameObject.find(path[0]);
        if (object) {
          this.selectedObject = object;
          this.selectedObject.loadData();
          this.subpage = path[2];
          this.selectedFilter = null;
          this.scrollTop();
        }
      }
    },
    scrollTop () {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    },
    updateTitle () {
      var parts = []
      if (this.selectedObject) {
        parts.push(this.selectedObject.name);
        if (this.subpage == "tech-tree")
          parts.push("Tech Tree");
        if (this.subpage == "recipe")
          parts.push("Recipe");
      } else if (this.selectedFilter) {
        parts.push(this.selectedFilter.name);
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

  li {
    text-align: left;
  }

  a {
    color: #42b983;
  }

  .filterList {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
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
  }

  .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  .filterList > .filter {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectList > .object {
    min-width: 200px;
    width: 33.3333%;
  }

  @media only screen and (max-width: 768px) {
    .filterList > .filter {
      min-width: 150px;
      width: 50%;
    }
    .objectList > .object {
      min-width: 150px;
      width: 50%;
    }
  }
</style>
