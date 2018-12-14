<template>
  <div class="changeLogVersion">
    <h2>{{name}}</h2>
    <div v-if="!version.data" class="loading">
      Loading...
    </div>
    <div v-else-if="isEmptyUnreleased">
      <div class="empty">Currently no unreleased content</div>
    </div>
    <div v-else>
      <div v-if="date" class="date">{{date}}</div>
      <ChangeLogCommit v-for="commit in version.data.commits" :commit="commit" :key="commit.sha" />
    </div>
  </div>
</template>

<script>
import Version from '../models/Version';

import ChangeLogCommit from './ChangeLogCommit';

export default {
  props: [
    'id',
  ],
  data() {
    return {
      version: Version.fetch(this.id),
    };
  },
  components: {
    ChangeLogCommit
  },
  computed: {
    date() {
      if (!this.version.data.date) return;
      const date = new Date(this.version.data.date);
      const months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      var month = date.getMonth();
      var day = date.getDate();
      var year = date.getFullYear();
      return `${months[month]} ${day}, ${year}`;
    },
    name() {
      if (this.id === "unreleased") {
        return "Unreleased";
      }
      return "Version " + this.id;
    },
    isEmptyUnreleased() {
      return this.id === "unreleased" && this.version.data.commits.length === 0;
    }
  }
}
</script>

<style scoped>
  .changeLogVersion > h2 {
    margin-top: 20px;
    margin-bottom: 0;
    padding: 0;
  }

  .changeLogVersion .date,
  .changeLogVersion .empty {
    color: #999;
    text-align: center;
    margin-bottom: 10px;
    font-style: italic;
  }
</style>
