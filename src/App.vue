<template>
  <div id="app">
    <h1>Crafting reference for One Hour One Life</h1>

    <h2 v-if="loading">Loading...</h2>

    <div v-else>
      <div class="updated">
        Updated {{lastDate}} (v{{lastVersion}})
      </div>

      <ObjectSearch />

      <router-view />
    </div>
  </div>
</template>

<script>
import GameObject from './models/GameObject'

import ObjectSearch from './components/ObjectSearch';
import ObjectBrowser from './components/ObjectBrowser';
import ObjectInspector from './components/ObjectInspector';
import TechTree from './components/TechTree';
import Recipe from './components/Recipe';
import RecipeForLetters from './components/RecipeForLetters';

export default {
  name: 'app',
  components: {
    ObjectSearch,
  },
  data () {
    return {
      loading: true,
    }
  },
  beforeMount () {
    this.redirectOldHash();
    GameObject.load(() => {
      this.loading = false;
    });
  },
  computed: {
    lastDate () {
      const months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      var month = GameObject.date.getMonth();
      var day = GameObject.date.getDate();
      var year = GameObject.date.getFullYear();
      return `${months[month]} ${day}, ${year}`;
    },
    lastVersion () {
      return GameObject.version;
    },
  },
  methods: {
    redirectOldHash () {
      if (!window.location.hash) return;
      const path = window.location.hash.substr(1).split("/");
      if (parseInt(path[0]) > 0) // Object ID route
        path.unshift([path.shift(), path.shift()].join("-"));
      this.$router.replace("/" + path.join("/"));
    }
  },
  metaInfo: {
    title: "Crafting reference for One Hour One Life",
    titleTemplate: '%s | onetech'
  },
  routes: [
    {path: "/", component: ObjectBrowser},
    {path: "/filter/:filter", component: ObjectBrowser},
    {path: "/letters", component: RecipeForLetters},
    {path: "/:id/tech-tree", component: TechTree},
    {path: "/:id/recipe", component: Recipe},
    {path: "/:id", component: ObjectInspector},
  ]
}
</script>

<style lang="scss">
  body {
    background-color: #151515;
    margin: 0 auto;
    padding: 0 10px;
    max-width: 1024px;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #d3d3d3;
    margin-top: 40px;
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

  #app > h1 {
    margin-bottom: 0;
  }

  .updated {
    color: #999;
    text-align: center;
    margin-bottom: 20px;
    font-style: italic;
  }
</style>
