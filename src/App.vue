<template>
  <div id="app">
    <h1>{{ msg }}</h1>

    <h2 v-if="!gameData">Loading...</h2>
    <h3 v-if="loadNum && !gameData">Loaded {{loadType}} {{loadNum}}/{{loadTotal}}</h3>

    <div v-if="gameData">
      <ul class="object-list">
        <li class="object" v-for="object in notNil(gameData.objects)" >
          <span >{{object.name}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import GameDataService from './services/GameDataService';
import ObjectView from './components/ObjectView';

export default {
  name: 'app',
  data () {
    return {
      msg: 'Auto-generated crafting guide for One Hour One Life',
      gameData: null,
      loadType: null,
      loadTotal: null,
      loadNum: null
    }
  },
  methods: {
    load () {
      let vue = this;
      vue.gameData = null;

      GameDataService.loadGameData((type, count, total, obj) => {
        vue.loadType = type;
        vue.loadTotal = total;
        vue.loadNum = count;
      }).then(data => {
        vue.gameData = data;
        console.dir(vue);
      });
    },
    notNil (array) {
      return _.omitBy(array, _.isNil);
    }
  },
  beforeMount () {
    this.load();
  },
  components: {
    ObjectView
  }
}
</script>

<style lang="scss">
body { 
  background-color: #151515;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #d3d3d3;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
}

li {
  text-align: left;
}

a {
  color: #42b983;
}
</style>
