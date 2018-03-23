<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2 v-if="!objectIDs">Loading...</h2>

    <div v-else>
      <ObjectSearch :selectedObjectID="selectedObjectID" />

      <div v-if="selectedObjectID">
        <TechTree :objectID="selectedObjectID" v-if="showTechTree" />
        <ObjectInspector :objectID="selectedObjectID" v-else />
      </div>

      <div v-else>
        <div class="objectList">
          <div class="object" v-for="objectID in shownObjectIDs" >
            <ObjectView :objectID="objectID" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import ObjectService from './services/ObjectService'

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
      msg: 'Crafting reference for One Hour One Life',
      showAmount: 24,
      objectIDs: null,
      selectedObjectID: null,
      showTechTree: false
    }
  },
  created () {
    window.onhashchange = () => this.parseHash();
    window.onscroll = () => this.handleScroll();
  },
  beforeMount () {
    ObjectService.load(ids => {
      this.objectIDs = ids;
      this.parseHash();
    });
  },
  computed: {
    shownObjectIDs () {
      return this.objectIDs.slice(0, this.showAmount);
    }
  },
  methods: {
    parseHash () {
      if (!this.objectIDs) return;
      if (!window.location.hash) {
        this.selectedObjectID = null;
        this.showTechTree = false;
        this.showAmount = 24;
      } else {
        let path = window.location.hash.split('#')[1].split('/');
        if (this.objectIDs.includes(path[0])) {
          this.selectedObjectID = path[0];
          this.showTechTree = (path[2] == "tech-tree");
        }
      }
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      this.updateTitle();
    },
    updateTitle () {
      var parts = []
      if (this.selectedObjectID) {
        parts.push(ObjectService.name(this.selectedObjectID));
        if (this.showTechTree)
          parts.push("Tech Tree");
      } else {
        parts.push("Crafting reference for One Hour One Life");
      }
      parts.push("onetech");
      document.title = parts.join(" - ");
    },
    handleScroll () {
      if (!this.selectedObjectID) {
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
