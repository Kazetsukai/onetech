<template>
  <div class="objectView" @click="select">
    <h3>{{object.name}}</h3>
    <ObjectImage :object="object" />
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import EventBus from '../services/EventBus';

export default {
  props: ['object'],
  components: {
    ObjectImage
  },
  methods: {
    select () {
      EventBus.$emit('object-selected', this.object);
      return false;
    }
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
</style>
