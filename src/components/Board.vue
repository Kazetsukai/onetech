<template>
  <div class="board">
    <BoardIngredients v-if="naturalObjects.length" title="Natural Resources" :objectIds="naturalObjects" :clickObject="addObject" />

    <BoardIngredients v-if="usedObjects.length" title="Used Objects" :objectIds="usedObjects" :clickObject="addObject" />

    <div v-if="objects.length == 0" class="empty">
      Search for an object to add to the board.
    </div>
    <div v-else class="boardPanels">
      <BoardPanel
        v-for="(object, index) in objects"
        :object="object"
        :key="index"
        :clickObject="addObject" />
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import BoardIngredients from './BoardIngredients';
import BoardPanel from './BoardPanel';

export default {
  components: {
    BoardIngredients,
    BoardPanel
  },
  data() {
    return {
      objects: [GameObject.findAndLoad(this.$route.params.id)],
    };
  },
  watch: {
    '$route' (to, from) {
      this.objects = [GameObject.findAndLoad(this.$route.params.id)];
    }
  },
  computed: {
    naturalObjects() {
      let naturalObjects = [];
      for (let object of this.objects) {
        if (object.data && object.data.boardRecipe && object.data.boardRecipe.naturalObjects) {
          naturalObjects = naturalObjects.concat(object.data.boardRecipe.naturalObjects);
        }
      }
      naturalObjects = naturalObjects.filter(id => !this.objects.map(o => o.id).includes(id));
      return naturalObjects;
    },
    usedObjects() {
      let usedObjects = [];
      for (let object of this.objects) {
        if (object.data && object.data.boardRecipe && object.data.boardRecipe.usedObjects) {
          usedObjects = usedObjects.concat(object.data.boardRecipe.usedObjects);
        }
      }
      usedObjects = usedObjects.filter(id => !this.objects.map(o => o.id).includes(id));
      return usedObjects;
    }
  },
  methods: {
    addObject(object) {
      object.loadData();
      this.objects.push(object);
    }
  },
  metaInfo() {
    return {title: "Crafting Board"};
  }
}
</script>

<style lang="scss" scoped>
  .board {
    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 20px;
  }

  .boardPanels {
    display: flex;
    flex-wrap: wrap;
  }
</style>
