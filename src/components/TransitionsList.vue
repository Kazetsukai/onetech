<template>
  <div class="transitionsList">
    <div class="transitions">
      <TransitionView
        v-for="(transition, index) in visibleTransitions"
        :key="index"
        :transition="transition"
        :selectedObject="selectedObject" />
    </div>
    <div v-if="canShowMore" class="showMoreWrapper">
      <span class="showMore" @click="expand">
        Show more...
      </span>
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
  computed: {
    visibleTransitions() {
      return this.transitions.slice(0, this.limit);
    },
    canShowMore() {
      return this.limit && this.limit < this.transitions.length;
    }
  },
  methods: {
    expand() {
      this.limit = parseInt(this.limit) + 50;
    }
  }
}
</script>

<style scoped>
  .transitionsList .transitions {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .transitionsList .showMoreWrapper {
    text-align: center;
    margin-top: 10px;
  }
  .transitionsList .showMore {
    cursor: pointer;
  }
  .transitionsList .showMore:hover {
    text-decoration: underline;
  }
</style>
