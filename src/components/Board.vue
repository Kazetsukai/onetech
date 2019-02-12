<template>
  <div class="board">
    <div v-if="isEmpty" class="boardEmpty">
      Search for an object to add it.
    </div>
    <div v-else>
      <BoardIngredients
        v-if="ingredientSteps.length"
        :steps="ingredientSteps"
        :clickObject="addObject" />

      <div class="boardPanels">
        <BoardPanel
          v-for="(panel, index) in board.panels"
          :panel="panel"
          :key="index"
          :clickObject="addObject"
          :close="closePanel" />
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';
import Board from '../models/Board';

import BoardIngredients from './BoardIngredients';
import BoardPanel from './BoardPanel';

export default {
  components: {
    BoardIngredients,
    BoardPanel
  },
  data() {
    return {
      board: new Board([GameObject.find(this.$route.params.id)]),
    };
  },
  watch: {
    '$route' (to, from) {
      this.board = new Board([GameObject.find(this.$route.params.id)]);
    }
  },
  computed: {
    isEmpty() {
      return this.board.panels.length === 0;
    },
    ingredientSteps() {
      return this.board.ingredientSteps();
    }
  },
  methods: {
    addObject(object) {
      this.board.addObject(object);
    },
    closePanel(panel) {
      this.board.removePanel(panel);
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
    margin-bottom: 20px;
  }

  .boardPanels {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .boardEmpty {
    font-size: 24px;
    text-align: center;
    padding-top: 30px;
    padding-bottom: 20px;
  }
</style>
