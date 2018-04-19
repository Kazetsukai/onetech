<template>
  <div class="step">
    <div class="stepNumber">
      {{number}}
    </div>
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
    border-radius: 5px;
    display: flex;
    margin: 10px;
    padding-top: 10px;
  }

  .step .stepNumber {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-left: 12px;
    font-size: 40px;
    color: #ccc;
    border-radius: 5px;
    width: 45px;
  }

  .stepTransitions {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }

  @media only screen and (max-width: 768px) {
    .step {
      flex-direction: column;
      align-items: center;
      padding-top: 5px;
    }

    .step .stepNumber::before {
      content: "Step";
      padding-right: 5px;
    }

    .step .stepNumber {
      padding: 0;
      margin: 0;
      margin-bottom: 5px;
      font-size: 16px;
      font-weight: bold;
      color: inherit;
    }

    .stepTransitions {
      align-items: center;
      justify-content: center;
    }
  }
</style>
