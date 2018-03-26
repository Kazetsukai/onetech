<template>
  <div class="techTree">
    <h2>{{object.name}}</h2>
    <h3>Tech Tree</h3>

    <TechTreeView :object="object" />
  </div>
</template>

<script>
import TechTreeView from './TechTreeView';

export default {
  props: ['object'],
  components: {
    TechTreeView
  }
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

  .techTree h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
</style>
