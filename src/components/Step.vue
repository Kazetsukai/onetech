<template>
  <div class="step">
    <h4>Step {{number}}</h4>
    <div class="stepResults">
      <StepResult v-for="item in items" :stepItem="item" :key="item.id" />
    </div>
    <div v-if="!showDetails" class="showDetails">
      <a @click="expandDetails">Show Details</a>
    </div>
    <div v-else class="stepItems">
      <StepItem v-for="item in items" :stepItem="item" :key="item.id" />
    </div>
  </div>
</template>

<script>
import StepItem from './StepItem';
import StepResult from './StepResult';

export default {
  props: ['items', 'number'],
  components: {
    StepItem,
    StepResult
  },
  data() {
    return {
      showDetails: false,
    }
  },
  methods: {
    expandDetails() {
      this.showDetails = true;
    }
  }
}
</script>

<style scoped>
  .step {
    width: 310px;
    background-color: #3c3c3c;
    margin: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 10px;
  }

  .step h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .stepResults {
    padding-left: 5px;
    display: flex;
    flex-wrap: wrap;
  }

  .showDetails {
    text-align: center;
    margin-top: 10px;
  }

  .showDetails a {
    color: #ccc;
    cursor: pointer;
    background-color: #292929;
    border-radius: 5px;
    padding: 3px 10px;
    font-size: 16px;
  }

  .stepItems {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #999;
    display: flex;
    flex-direction: column;
  }
</style>
