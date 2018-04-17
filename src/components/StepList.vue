<template>
  <div class="stepList">
    <h2>{{object.name}}</h2>
    <h3>Crafting Steps</h3>

    <h3 v-if="!object.data">Loading...</h3>
    <div v-else class="steps">
      <StepListRequirements :requirements="object.data.recipe.requirements" />
      <Step v-for="(items, index) in object.data.recipe.steps" :items="items" :number="index+1" />
    </div>
  </div>
</template>

<script>
import StepListRequirements from './StepListRequirements';
import Step from './Step';

export default {
  props: ['object'],
  components: {
    StepListRequirements,
    Step
  }
}
</script>

<style scoped>
  .stepList {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .stepList > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }

  .stepList h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }

  .stepList .steps {
    display: flex;
    flex-direction: column;
  }
</style>
