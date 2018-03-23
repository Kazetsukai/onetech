<template>
  <a class="nostyle" :href="url">
    <div class="objectView">
      <h3>{{name}}</h3>
      <ObjectImage :objectID="objectID" />
    </div>
  </a>
</template>

<script>
import ObjectService from '../services/ObjectService'

import ObjectImage from './ObjectImage';

export default {
  props: ['objectID'],
  components: {
    ObjectImage
  },
  computed: {
    url () { return ObjectService.url(this.objectID) },
    name () { return ObjectService.name(this.objectID) },
  }
}
</script>

<style scoped>
  .objectView {
    height: 200px;

    display: flex;
    flex-direction: column;
    align-items: center;

    background-color: #333;
    margin: 10px;
    border-radius: 5px;
    border: 1px solid transparent;
  }

  .objectView:hover {
    border: 1px solid #eee;
    background-color: #222;
  }

  .objectView h3 {
    text-align: center;
  }

  a.nostyle:link {
    text-decoration: inherit;
    color: inherit;
  }

  a.nostyle:visited {
      text-decoration: inherit;
      color: inherit;
  }
</style>
