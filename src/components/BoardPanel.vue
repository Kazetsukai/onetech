<template>
  <div class="boardPanel">
    <div class="panelClose" @click="close(panel)">
      x
    </div>
    <ObjectImage
      class="panelObject"
      hover="true"
      clickable="true"
      :object="object" />
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
  props: ["panel", "clickObject", "close"],
  components: {
    BoardTransition,
    ObjectImage
  },
  computed: {
    object() {
      return this.panel.object;
    },
    loading() {
      return this.panel.loading();
    },
    steps() {
      return this.panel.steps;
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
    margin-bottom: 0;
    padding-top: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .panelClose {
    position: absolute;
    top: 0;
    right: 7px;
    padding: 8px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: white;
    }
  }

  .panelObject {
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
    &:hover {
      border-color: #aaa;
      background-color: #666;
    }
  }

  .panelName {
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 14px;
  }

  .panelSteps {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
