<template>
  <a class="nostyle" :href="url">
    <div class="objectFilter" v-bind:class="{selected}">
      <h3>{{filter.name}}</h3>
      <div v-if="selected" class="deselect">x</div>
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

  a.nostyle:link, a.nostyle:visited {
    text-decoration: inherit;
    color: inherit;
  }

  @media only screen and (min-width: 768px) {
    .objectFilter:hover {
      border: 1px solid #eee;
      background-color: #222;
    }

    .objectFilter.selected:hover {
      background-color: #777;
    }

    .objectFilter:hover .deselect {
      background-color: #222;
    }
  }

  @media only screen and (max-width: 768px) {
    .objectFilter.selected h3 {
      margin-left: 26px;
      margin-right: 26px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .objectFilter h3 {
      font-size: 16px;
    }

    .objectFilter .deselect {
      right: 8px;
      top: 11px;
    }
  }
</style>
