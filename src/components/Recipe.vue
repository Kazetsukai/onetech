<template>
  <div class="recipe">
    <div class="recipeHeadline">
      <ObjectImage
        class="recipeHeadlineObject"
        :hover="false"
        :clickable="true"
        :object="object" />
      <div class="recipeHeadlineText">
        <h2><router-link :to="object.url()">{{object.name}}</router-link></h2>
        <h3>Crafting Recipe</h3>
      </div>
    </div>

    <h3 v-if="!object.data">Loading...</h3>
    <div v-else class="steps">
      <RecipeIngredients :ingredients="object.data.recipe.ingredients" :rightClickObject="filterObject" />
      <template v-if="filteredObject">
        <RecipeFilter
          :object="object"
          :filteredObject="filteredObject"
          :rightClickObject="filterObject" />
      </template>
      <template v-else>
        <RecipeStep
          v-for="(transitions, index) in object.data.recipe.steps"
          :transitions="transitions"
          :number="index+1"
          :key="index"
          :rightClickObject="filterObject" />
      </template>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import RecipeIngredients from './RecipeIngredients';
import RecipeFilter from './RecipeFilter';
import RecipeStep from './RecipeStep';
import ObjectImage from './ObjectImage';

export default {
  components: {
    RecipeIngredients,
    RecipeFilter,
    RecipeStep,
    ObjectImage
  },
  data() {
    return {
      object: GameObject.findAndLoad(this.$route.params.id),
      filteredObject: null,
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
  methods: {
    filterObject(object) {
      this.filteredObject = object;
    }
  },
  metaInfo() {
    return {title: `${this.object.name} Recipe`};
  }
}
</script>

<style lang="scss" scoped>
  .recipe {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .recipeHeadline {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .recipeHeadlineObject {
    margin-right: 10px;
    display: flex;
    align-items: center;
    z-index: 1;
    position: relative;
    display: block;
    width: 60px;
    height: 60px;
    background-color: #444;
    border: solid 1px transparent;
    border-radius: 3px;
    &:hover {
      border-color: #aaa;
      background-color: #666;
    }
  }

  .recipeHeadlineText {
    h2 {
      text-align: left;
      font-size: 20px;
      font-weight: bolder;
      margin: 0;
      a {
        color: inherit;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    h3 {
      text-align: left;
      font-size: 16px;
      font-weight: lighter;
      font-style: italic;
      margin: 0;
    }
  }

  .recipe .steps {
    display: flex;
    flex-direction: column;
  }

  @media only screen and (max-width: 768px) {
    .recipeHeadline {
      flex-direction: column;
      h2 {
        font-size: 18px;
        text-align: center;
      }
      h3 {
        font-size: 14px;
        text-align: center;
      }
    }
  }
</style>
