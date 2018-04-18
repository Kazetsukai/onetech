<template>
  <div class="step">
    <h4>Step {{number}}</h4>
    <div class="stepTransitions">
      <RecipeTransition v-for="transition in transitions" :transition="transition" :key="transition.id" />
    </div>
  </div>
</template>

<script>
import RecipeTransition from './RecipeTransition';

export default {
  props: ['transitions', 'number'],
  components: {
    RecipeTransition
  }
}
</script>

<style scoped>
  .step {
    background-color: #3c3c3c;
    margin: 10px;
    border-radius: 5px;
  }

  .step h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 6px;
    margin-bottom: -5px;
  }

  .stepTransitions {
    display: flex;
    flex-wrap: wrap;
  }
</style>
