<template>
  <div class="transitionsPanel" v-if="transitions.length > 0">
    <h3>{{title}}</h3>
    <div class="transitions">
      <TransitionView
        v-for="(transition, index) in visibleTransitions"
        :key="index"
        :transition="transition"
        :selectedObject="selectedObject" />
    </div>
    <div v-if="canShowMore" class="showMore" @click="expand">
      Show more...
    </div>
  </div>
</template>

<script>
import TransitionView from './TransitionView';

export default {
  props: ['title', 'limit', 'transitions', 'selectedObject'],
  components: {
    TransitionView
  },
  data() {
    return {
      expanded: false,
    };
  },
  watch: {
    selectedObject() {
      this.expanded = false;
    }
  },
  computed: {
    visibleTransitions() {
      if (this.limit && !this.expanded)
        return this.transitions.slice(0, this.limit);
      return this.transitions;
    },
    canShowMore() {
      return this.limit && !this.expanded && this.limit < this.transitions.length;
    }
  },
  methods: {
    expand() {
      this.expanded = true;
    }
  }
}
</script>

<style scoped>
  .transitionsPanel {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
  }

  .transitionsPanel > h3 {
    font-size: 18px;
    margin: 0;
    padding: 0;
  }

  .transitionsPanel .transitions {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .transitionsPanel .showMore {
    margin-top: 10px;
    cursor: pointer;
  }
  .transitionsPanel .showMore:hover {
    text-decoration: underline;
  }
</style>
