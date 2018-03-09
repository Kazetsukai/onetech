<template>
  <div class="image" :style="'background-image: url(' + imageUrl + ');'" @click="select()">
  </div>
</template>

<script>
import EventBus from '../services/EventBus';

export default {
  props: ['object', 'clickable'],
  computed: {
    imageUrl () {
      return this.object.sprites[0]
        ? './static/sprites/obj_' + this.object.id + '.png'
        : 'about:blank'
    }
  },
  methods: {
    select () {
      if (this.clickable)
        EventBus.$emit('object-selected', this.object);
    }
  }
}
</script>

<style scoped>
  .image {
    display: inline-block;
    vertical-align: middle;

    background-repeat:no-repeat;
    background-position: center center;
    background-size: contain;

    width: 200px;
    height: 200px;
  }
</style>