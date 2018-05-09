<template>
  <div class="objectBrowser">
    <div class="filterList">
      <div class="filter" v-for="filter in filters" >
        <ObjectFilter :filter="filter" :selected="filter == selectedFilter" />
      </div>
    </div>
    <div class="objectList">
      <div class="object" v-for="object in shownObjects" >
        <ObjectView :object="object" />
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject'

import ObjectFilter from './ObjectFilter'
import ObjectView from './ObjectView';

export default {
  components: {
    ObjectFilter,
    ObjectView,
  },
  data () {
    return {
      showAmount: 24,
      selectedFilter: GameObject.findFilter(this.$route.params.filter),
    }
  },
  created () {
    window.onscroll = () => this.handleScroll();
  },
  watch: {
    "$route" (to, from) {
      this.showAmount = 24;
      this.selectedFilter = GameObject.findFilter(to.params.filter);
    }
  },
  computed: {
    shownObjects () {
      return GameObject.objects(this.showAmount, this.selectedFilter);
    },
    filters () {
      return GameObject.filters;
    }
  },
  methods: {
    handleScroll () {
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (!this.loadingMore) {
          this.loadingMore = true;
          this.showAmount += 24;
        }
      } else {
        this.loadingMore = false;
      }
    }
  },
}
</script>

<style lang="scss">
  .filterList {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }

  .objectList {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;

    display: flex;
    flex-wrap: wrap;
  }

  .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  .filterList > .filter {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectList > .object {
    min-width: 200px;
    width: 33.3333%;
  }

  @media only screen and (max-width: 768px) {
    .filterList > .filter {
      min-width: 150px;
      width: 50%;
    }
    .objectList > .object {
      min-width: 150px;
      width: 50%;
    }
  }
</style>
