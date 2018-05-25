<template>
  <div class="changeLog">
    <ChangeLogVersion v-for="id in versionIds" :id="id" :key="id" />
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
      limit: 5,
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
    }
  },
  metaInfo() {
    if (this.$route.params.id)
      return {title: `Version ${this.$route.params.id}`};
    return {title: "Change Log"};
  }
}
</script>

<style scoped>
  .changeLog {
  }
</style>
