<template>
  <div class="stepList">
    <h2>{{object.name}}</h2>
    <h3>Crafting Steps</h3>

    <h3 v-if="!object.data">Loading...</h3>
    <div v-else class="steps">
      <div class="step" v-for="(items, index) in object.data.steps" >
        <h4>Step {{index+1}}</h4>
        <div class="stepItems">
          <StepItem v-for="item in items" :stepItem="item" :key="item.id" />
        </div>
        <div class="stepResults">
          <StepResult v-for="item in items" :stepItem="item" :key="item.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StepItem from './StepItem';
import StepResult from './StepResult';

export default {
  props: ['object'],
  components: {
    StepItem,
    StepResult
  },
  computed: {
    steps() {
      if (!this.object.data) return [];

      const steps = [];
      for (let i in this.object.data.steps) {
        const parts = this.splitItems(this.object.data.steps[i]);
        for (let j in parts) {
          var name = parseInt(i) + 1;
          if (parts.length > 1)
            name += String.fromCharCode(97 + parseInt(j))
          steps.push({name: name, items: parts[j]});
        }
      }
      return steps;
    }
  },
  methods: {
    splitItems(items) {
      if (items.length <= 4)
        return [items];

      var parts = [];
      const size = Math.ceil(items.length / 3) == Math.ceil(items.length / 4) ? 3 : 4;
      for (let i=0; i < items.length; i += size) {
        parts.push(items.slice(i, i+size));
      }
      return parts;
    }
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

  .stepList .step {
    background-color: #3c3c3c;
    margin: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 10px;
  }

  .stepList .step h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .stepList .stepItems {
    display: flex;
    flex-wrap: wrap;
  }

  .stepList .stepResults {
    margin-top: 10px;
    padding-top: 10px;
    padding-left: 5px;
    border-top: 1px dashed #999;
    display: flex;
    flex-wrap: wrap;
  }
</style>
