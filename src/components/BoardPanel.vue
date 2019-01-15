<template>
  <div class="boardPanel">
    <div class="panelName">
      {{object.name}}
    </div>
    <div v-if="loading" class="panelLoading">
      Loading...
    </div>
    <div v-else>
      <div v-if="steps" class="panelSteps">
        <BoardTransition v-for="(transition, index) in steps" :key="index" :transition="transition" :clickObject="clickObject" />
      </div>
    </div>
  </div>
</template>

<script>
import BoardTransition from "./BoardTransition";
import ObjectImage from "./ObjectImage";

export default {
  props: ["object", "clickObject"],
  components: {
    BoardTransition,
    ObjectImage
  },
  computed: {
    loading() {
      return !this.object.data;
    },
    steps() {
      return this.object.data.boardRecipe && this.object.data.boardRecipe.steps;
    }
  }
}
</script>

<style lang="scss" scoped>
  .boardPanel {
    background-color: #3c3c3c;
    border-radius: 5px;
    width: 310px;
    margin: 10px;
  }

  .panelName {
    margin: 10px;
    text-align: center;
  }

  .panelSteps {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
