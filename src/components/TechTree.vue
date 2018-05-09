<template>
  <div class="techTree">
    <h2><router-link :to="object.url()">{{object.name}}</router-link></h2>
    <h3>Tech Tree</h3>

    <TechTreeView :object="object" />
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import TechTreeView from './TechTreeView';

export default {
  components: {
    TechTreeView
  },
  data() {
    return {
      object: GameObject.findAndLoad(this.$route.params.id),
    };
  },
  watch: {
    '$route' (to, from) {
      this.object = GameObject.findAndLoad(this.$route.params.id);
    }
  },
}
</script>

<style scoped>
  .techTree {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .techTree > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }
  .techTree > h2 a {
    color: inherit;
    text-decoration: none;
  }
  .techTree > h2 a:hover {
    text-decoration: underline;
  }

  .techTree h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
</style>
