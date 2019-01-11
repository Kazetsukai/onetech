<template>
  <div class="ingredients">
    <h4>{{titleWithDefault}}</h4>
    <div class="filterInstructions">
      right click to filter recipe
    </div>
    <div class="ingredientObjects">
      <ObjectImage
        v-for="object in objects"
        class="ingredientObject"
        hover="true"
        clickable="true"
        :object="object"
        :uses="ingredientUses(object)"
        :key="object.id"
        :rightClick="rightClickObject" />
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: ['ingredients', 'title', 'rightClickObject'],
  components: {
    ObjectImage
  },
  computed: {
    objects() {
      const uniqueIDs = this.ingredients.filter((id, i) => this.ingredients.indexOf(id) == i);
      return uniqueIDs.map(id => GameObject.find(id))
    },
    titleWithDefault() {
      return this.title || "Ingredients";
    }
  },
  methods: {
    ingredientUses(object) {
      const count = this.ingredients.filter(id => id == object.id).length;
      if (count > 1)
        return `x${count}`;
    }
  }
}
</script>

<style lang="scss" scoped>
  .ingredients {
    background-color: #3c3c3c;
    margin: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 10px;
  }

  .ingredients h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 5px;
    margin-bottom: 0;
  }

  .ingredients .ingredientObjects {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    margin-left: 10px;
  }

  .ingredients .ingredientObject {
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
  .ingredients .ingredientObject:hover {
    border-color: #aaa;
    background-color: #666;
  }

  .ingredients .filterInstructions {
    text-align: center;
    color: #BBB;
    font-size: 14px;
  }

  @media only screen and (max-width: 768px) {
    .ingredients .filterInstructions {
      display: none;
    }
  }
</style>
