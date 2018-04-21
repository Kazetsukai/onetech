<template>
  <div class="recipe">
    <h2>{{object.name}}</h2>
    <h3>Crafting Recipe</h3>

    <h3 v-if="!object.data">Loading...</h3>
    <div v-else class="steps">
      <RecipeIngredients :ingredients="object.data.recipe.ingredients" />
      <RecipeStep
        v-for="(transitions, index) in object.data.recipe.steps"
        :transitions="transitions"
        :number="index+1"
        :key="index" />
    </div>
  </div>
</template>

<script>
import RecipeIngredients from './RecipeIngredients';
import RecipeStep from './RecipeStep';

export default {
  props: ['object'],
  components: {
    RecipeIngredients,
    RecipeStep
  }
}
</script>

<style scoped>
  .recipe {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .recipe > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }

  .recipe h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }

  .recipe .steps {
    display: flex;
    flex-direction: column;
  }
</style>
