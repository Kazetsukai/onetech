<template>
  <div class="changeLog">
    <ChangeLogVersion v-for="id in versionIds" :id="id" :key="id" />
    <div class="showMore">
      <span class="showMoreLink" @click="showMore" v-if="!singleVersion">
        Show More
      </span>
      <router-link v-else to="/versions">Show All Versions</router-link>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';
import Version from '../models/Version';

import ChangeLogVersion from './ChangeLogVersion';

export default {
  components: {
    ChangeLogVersion
  },
  data() {
    return {
      limit: 3,
    };
  },
  created () {
    window.onscroll = () => this.handleScroll();
  },
  computed: {
    versionIds() {
      if (this.singleVersion)
        return [this.singleVersion];
      return GameObject.versions.slice(0, this.limit);
    },
    singleVersion() {
      return this.$route.params.id;
    }
  },
  methods: {
    handleScroll() {
      if (this.singleVersion)
        return;
      if (window.scrollY + window.innerHeight > document.body.clientHeight - 100) {
        if (Version.isLoading())
          return;
        if (!this.loadingMore) {
          this.loadingMore = true;
          this.limit += 1;
        }
      } else {
        this.loadingMore = false;
      }
    },
    showMore() {
      this.limit += 3;
    }
  },
  metaInfo() {
    if (this.singleVersion)
      return {title: `Version ${this.singleVersion}`};
    return {title: "Change Log"};
  }
}
</script>

<style scoped>
  .changeLog {
    margin-bottom: 10px;
  }

  .showMore {
    text-align: center;
    margin: 20px 0;
    font-size: 18px;
  }

  .showMoreLink {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
