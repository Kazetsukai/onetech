<template>
  <div class="stepWrapper">
    <div class="step">
      <div class="stepNumber">
        {{number}}
      </div>
      <div class="stepTransitionsWrapper">
        <div class="stepTransitions">
          <RecipeTransition
            v-for="transition in unexpandableTransitions"
            :transition="transition"
            :key="transition.id"
            :rightClickObject="rightClickObject"
            @expand="expand"
          />
          <RecipeTransition
            v-for="transition in expandableTransitions"
            :transition="transition"
            :key="transition.id"
            :rightClickObject="rightClickObject"
            @expand="expand"
          />
        </div>
      </div>
    </div>
    <div class="subSteps" v-if="expandedTransition">
      <RecipeStep
        v-for="(transitions, index) in expandedTransition.subSteps"
        :transitions="transitions"
        :number="numberToLetter(index)"
        :rightClickObject="rightClickObject"
        :key="index"
      />
    </div>
  </div>
</template>

<script>
import RecipeTransition from './RecipeTransition';
import RecipeStep from './RecipeStep';

export default {
  name: 'RecipeStep',
  props: ['transitions', 'number', 'rightClickObject'],
  components: {
    RecipeTransition,
    RecipeStep
  },
  data() {
    return {
      expandedTransition: null,
    };
  },
  computed: {
    unexpandableTransitions() {
      return this.transitions.filter(t => !t.subSteps);
    },
    expandableTransitions() {
      return this.transitions.filter(t => t.subSteps);
    },
  },
  methods: {
    numberToLetter(num) {
      return String.fromCharCode(97 + num);
    },

    expand(transition) {
      if (this.expandedTransition)
        this.expandedTransition = null;
      else
        this.expandedTransition = transition;
    }
  }
}
</script>

<style scoped>
  .stepWrapper {
    background-color: #3c3c3c;
    border-radius: 5px;
    margin: 10px;
    padding-top: 10px;
  }

  .subSteps {
    padding-top: 10px;
    border-top: dashed 1px #666;
  }

  .subSteps .stepWrapper {
    margin: 0;
    padding: 0;
    border-radius: 0;
    background-color: inherit;
  }

  .step {
    display: flex;
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

  .subSteps .stepNumber {
    margin-top: 25px;
    font-size: 30px;
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
