<template>
  <div class="objectBrowser">
    <div v-if="selectedFilter" class="filterSelection">
      <router-link to="/" class="filterSelectionBack">Back</router-link>
      <div class="filterSelectionName">{{selectedFilter.name}}</div>
    </div>

    <div v-else class="filterList">
      <div class="filter" v-for="filter in filters" >
        <ObjectFilter :filter="filter" />
      </div>
    </div>

    <div v-if="showBiomes" class="biomes">
      <div class="biomesTitle">Biomes</div>
      <BiomeList />
    </div>

    <div class="objectListWrapper">
      <div class="objectListHeader">
        <div class="objectListSorter">
          Sort by:
          <span @click="sort('recent', false)" :class="{selected: sortBy == 'recent'}">Recent</span>,
          <span @click="sort('difficulty', false)" :class="{selected: sortBy == 'difficulty'}">Difficulty</span>,
          <span @click="sort('name', false)" :class="{selected: sortBy == 'name'}">Name</span>
        </div>
        <div class="objectListSorter">
          Order:
          <span @click="sort(sortBy, false)" :class="{selected: !descending}">Asc</span>,
          <span @click="sort(sortBy, true)" :class="{selected: descending}">Desc</span>
        </div>
      </div>
      <div class="objectList">
        <div class="object" v-for="object in shownObjects">
          <ObjectView :object="object" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';
import BrowserStorage from '../models/BrowserStorage';

import ObjectFilter from './ObjectFilter';
import ObjectView from './ObjectView';
import BiomeList from './BiomeList';

export default {
  components: {
    ObjectFilter,
    ObjectView,
    BiomeList,
  },
  data () {
    return {
      showAmount: 24,
      selectedFilter: GameObject.findFilter(this.$route.params.filter),
      sortBy: BrowserStorage.getItem("ObjectBrowser.sortBy") || "recent",
      descending: BrowserStorage.getItem("ObjectBrowser.descending") === "true"
    }
  },
  created () {
    window.onscroll = () => this.handleScroll();
  },
  watch: {
    "$route"(to, from) {
      this.showAmount = 24;
      this.selectedFilter = GameObject.findFilter(to.params.filter);
    }
  },
  computed: {
    shownObjects() {
      return GameObject.objects(this.showAmount, this.selectedFilter, this.sortBy, this.descending);
    },
    filters() {
      return GameObject.filters;
    },
    showBiomes() {
      return this.selectedFilter && this.selectedFilter.key === "natural";
    },
  },
  methods: {
    handleScroll() {
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (!this.loadingMore) {
          this.loadingMore = true;
          this.showAmount += 24;
        }
      } else {
        this.loadingMore = false;
      }
    },
    sort(sortBy, descending) {
      this.sortBy = sortBy;
      this.descending = descending;

      BrowserStorage.setItem("ObjectBrowser.sortBy", sortBy);
      BrowserStorage.setItem("ObjectBrowser.descending", descending.toString());
    }
  },
  metaInfo() {
    if (this.selectedFilter)
      return {title: this.selectedFilter.name};
    return {};
  }
}
</script>

<style lang="scss">
  .objectBrowser .filterSelection {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    text-align: center;
    position: relative;
  }

  .objectBrowser .filterSelectionBack {
    position: absolute;
    top: 0;
    left: 0;
    padding: 15px 20px;
  }

  .objectBrowser .filterSelectionName {
    font-size: 24px;
    font-weight: bold;
  }

  .objectBrowser .filterList {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
  }

  .objectBrowser .objectListWrapper {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }

  .objectBrowser .objectListHeader {
    margin: 0 15px;
    padding: 0;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .objectBrowser .objectListSorter {
    padding: 0 10px;
  }
  .objectBrowser .objectListSorter span {
    cursor: pointer;
    text-decoration: underline;
  }
  .objectBrowser .objectListSorter .selected {
    color: inherit;
    font-weight: bold;
    cursor: normal;
    text-decoration: none;
  }

  .objectBrowser .objectList {
    display: flex;
    flex-wrap: wrap;
  }

  .objectBrowser .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  .objectBrowser .filterList > .filter {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectBrowser .objectList > .object {
    min-width: 200px;
    width: 33.3333%;
  }

  .objectBrowser .biomes {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }
  .objectBrowser .biomesTitle {
    font-weight: bold;
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .objectBrowser .filterList > .filter {
      min-width: 150px;
      width: 50%;
    }
    .objectBrowser .objectList > .object {
      min-width: 150px;
      width: 50%;
    }
    .objectBrowser .objectListHeader {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
