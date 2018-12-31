<template>
  <div class="stepWrapper" v-if="showStep">
    <div class="step">
      <div class="stepNumber">
        {{number}}
      </div>
      <div class="stepTransitionsWrapper">
        <div class="stepTransitions">
          <RecipeTransition
            v-for="transition in unexpandableTransitions"
            :transition="transition"
            :highlight="highlightTransition(transition)"
            :key="transition.id"
            :rightClickObject="rightClickObject"
          />
          <RecipeTransition
            v-for="transition in expandableTransitions"
            :transition="transition"
            :key="transition.id"
            :rightClickObject="rightClickObject"
            :expanded="transition == expandedTransition"
            :highlight="highlightTransition(transition)"
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
        :filteredObject="filteredObject"
        :highlightObjects="highlightObjects"
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
  props: ['transitions', 'number', 'rightClickObject', 'filteredObject', 'highlightObjects'],
  components: {
    RecipeTransition,
    RecipeStep
  },
  data() {
    return {
      manuallyExpandedTransition: null,
    };
  },
  computed: {
    showStep() {
      return this.filteredTransitions.length > 0;
    },
    filteredTransitions() {
      if (this.filteredObject) {
        return this.transitionsWithObject(this.transitions, this.filteredObject);
      }
      return this.transitions;
    },
    unexpandableTransitions() {
      return this.filteredTransitions.filter(t => !t.subSteps);
    },
    expandableTransitions() {
      return this.filteredTransitions.filter(t => t.subSteps);
    },
    expandedTransition() {
      return this.manuallyExpandedTransition || this.filteredObject && this.expandableTransitions[0];
    }
  },
  methods: {
    numberToLetter(num) {
      return String.fromCharCode(97 + num);
    },

    expand(transition) {
      if (this.expandedTransition == transition) {
        this.manuallyExpandedTransition = null;
      } else {
        this.manuallyExpandedTransition = transition;
      }
    },

    transitionsWithObject(transitions, object) {
      return transitions.filter(t => this.transitionIncludesObject(t, object));
    },

    transitionIncludesObject(transition, object) {
      if (transition.subSteps) {
        for (var transitions of transition.subSteps) {
          if (this.transitionsWithObject(transitions, object).length > 0) {
            return true;
          }
        }
        return false;
      }
      return transition.actorID == object.id ||
             transition.targetID == object.id ||
             transition.id == object.id;
    },

    highlightTransition(transition) {
      if (!this.highlightObjects) return;
      for (var object of this.highlightObjects) {
        if (object.id == transition.id) {
          return true;
        }
      }
      return false;
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
