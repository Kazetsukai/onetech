<template>
  <div class="recipeFilter">
    <div class="transitionsHeadline">
      <h4>Filter:</h4>
      <ObjectImage
        class="filteredObject"
        hover="true"
        clickable="true"
        :object="filteredObject" />
    </div>
    <div class="transitionsWrapper">
      <div class="transitions">
        <RecipeTransition
          v-for="transition in filteredTransitions"
          :transition="transition"
          :key="transition.id"
          :rightClickObject="rightClickObject"
        />
      </div>
    </div>
    <div class="clearFilter">
      <a href="#" @click.prevent="rightClickObject(null)">Clear Filter</a>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import RecipeTransition from './RecipeTransition';

export default {
  name: 'RecipeFilter',
  props: ['object', 'filteredObject', 'rightClickObject'],
  components: {
    ObjectImage,
    RecipeTransition
  },
  computed: {
    transitions() {
      return this.object.data.recipe.steps.map(transitions => {
        return transitions.map(t => t.subSteps || t);
      }).flat(3);
    },

    transitionsAway() {
      return this.transitions.filter(t => {
        return t.actorID == this.filteredObject.id || t.targetID == this.filteredObject.id;
      });
    },

    transitionsToward() {
      return this.transitions.filter(t => t.id == this.filteredObject.id);
    },

    filteredTransitions() {
      return this.transitionsAway.concat(this.transitionsToward);
    },
  }
}
</script>

<style lang="scss" scoped>
  .transitionsHeadline {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }

  .transitionsWrapper {
    background-color: #3c3c3c;
    margin: 10px;
    margin-top: 0;
    border-radius: 5px;
    padding-top: 10px
  }

  h4 {
    text-align: center;
    font-size: 16px;
    margin: 0;
    margin-right: 10px;
  }

  .transitions {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
  }

  .filteredObject {
    display: flex;
    align-items: center;
    z-index: 1;
    position: relative;
    display: block;
    width: 40px;
    height: 40px;
    background-color: #444;
    border: solid 1px transparent;
    border-radius: 3px;
    &:hover {
      border-color: #aaa;
      background-color: #666;
    }
  }

  .clearFilter {
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .transitions {
      align-items: center;
      justify-content: center;
    }
  }
</style>
