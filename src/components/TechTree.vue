<template>
  <div class="techTree">
    <h2>{{object.name}}</h2>
    <h3>Tech Tree</h3>
    <TechTreeNode :object="object" :parentObjects="[]" />
  </div>
</template>

<script>
import TechTreeNode from './TechTreeNode';

export default {
  props: ['object'],
  components: {
    TechTreeNode
  }
}
</script>

<style scoped>
  .techTree {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-content: center;

    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
  }

  .techTree > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }

  .techTree > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
</style>
