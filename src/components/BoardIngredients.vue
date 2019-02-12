<template>
  <div class="boardIngredients">
    <h4>Ingredients</h4>
    <div class="ingredientObjects">
      <ObjectImage
        v-for="step in steps"
        class="ingredientObject"
        hover="true"
        clickable="true"
        :object="object(step)"
        :uses="uses(step)"
        :key="step.id"
        :leftClick="clickObject" />
    </div>
  </div>
</template>

<script>
import GameObject from "../models/GameObject";

import ObjectImage from "./ObjectImage";

export default {
  props: ["steps", "clickObject"],
  components: {
    ObjectImage
  },
  computed: {
    objects() {
      const uniqueIDs = this.objectIds.filter((id, i) => this.objectIds.indexOf(id) == i);
      return uniqueIDs.map(id => GameObject.find(id))
    }
  },
  methods: {
    uses(step) {
      if (step.count > 1) {
        return `x${step.count}`;
      }
    },
    object(step) {
      return GameObject.find(step.id)
    }
  }
}
</script>

<style lang="scss" scoped>
  .boardIngredients {
    background-color: #3c3c3c;
    margin: 10px;
    margin-bottom: 0;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 10px;
  }

  .boardIngredients h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 5px;
    margin-bottom: 0;
  }

  .boardIngredients .ingredientObjects {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    margin-left: 10px;
  }

  .boardIngredients .ingredientObject {
    display: flex;
    align-items: center;
    margin: 5px;
    z-index: 1;
    position: relative;
    display: block;
    background-color: #555;
    width: 80px;
    height: 80px;
    border: solid 2px #333;
    border-radius: 5px;
  }
  .boardIngredients .ingredientObject:hover {
    border-color: #aaa;
    background-color: #666;
  }
</style>
