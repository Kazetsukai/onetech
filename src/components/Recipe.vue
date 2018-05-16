<template>
  <div class="recipe">
    <h2><router-link :to="object.url()">{{object.name}}</router-link></h2>
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
import GameObject from '../models/GameObject';

import RecipeIngredients from './RecipeIngredients';
import RecipeStep from './RecipeStep';

export default {
  components: {
    RecipeIngredients,
    RecipeStep
  },
  data() {
    return {
      object: GameObject.findAndLoad(this.$route.params.id),
    };
  },
  created() {
    if (!this.object)
      this.$router.replace("/not-found");
  },
  watch: {
    '$route' (to, from) {
      this.object = GameObject.findAndLoad(this.$route.params.id);
    }
  },
  metaInfo() {
    return {title: `${this.object.name} Recipe`};
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
  .recipe > h2 a {
    color: inherit;
    text-decoration: none;
  }
  .recipe > h2 a:hover {
    text-decoration: underline;
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
