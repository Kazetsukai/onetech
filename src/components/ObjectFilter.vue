<template>
  <a class="nostyle" :href="url">
    <div class="objectFilter" v-bind:class="{selected}">
      <div v-if="selected" class="deselect">x</div>
      <h3>{{filter.name}}</h3>
    </div>
  </a>
</template>

<script>
export default {
  props: ['filter', 'selected'],
  computed: {
    url() {
      if (this.selected) return "#";
      return `#filter/${this.filter.key}`;
    }
  }
}
</script>

<style scoped>
  .objectFilter {
    position: relative;
    margin: 5px 10px;
    background-color: #444;
    border-radius: 5px;
    border: 1px solid transparent;
  }

  .objectFilter:hover {
    border: 1px solid #eee;
    background-color: #222;
  }

  .objectFilter.selected {
    background-color: #777;
  }

  .objectFilter h3 {
    text-align: center;
    margin: 10px 5px;
  }

  .objectFilter .deselect {
    position: absolute;
    right: 15px;
    top: 13px;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    font-size: 16px;
    background-color: #555;
    font-weight: bold;
    line-height: 18px;
    text-align: center;
  }

  .objectFilter:hover .deselect {
    background-color: #222;
  }

  a.nostyle:link, a.nostyle:visited {
    text-decoration: inherit;
    color: inherit;
  }
</style>
