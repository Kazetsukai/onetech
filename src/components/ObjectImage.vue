<template>
  <div class="imgContainer">
    <div v-if="hand" class="hand" />
    <div class="image" :title="hover ? object.name : ''" :style="'background-image: url(' + imageUrl + ');'" @click="select()">
    </div>
  </div>
</template>

<script>
import EventBus from '../services/EventBus';

export default {
  props: ['object', 'clickable', 'hand', 'hover'],
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
    background-repeat:no-repeat;
    background-position: center center;
    background-size: contain;

    transform: translateZ(0);

    width: 100%;
    height: 100%;
  }

  .imgContainer {
    display: inline-block;
    vertical-align: middle;
    
    z-index: 0;
    position: relative;
  }

  .hand {
    position: absolute;
    width: 50%;
    height: 50%;
    left: -2px;
    bottom: -2px;

    transform: translateZ(0);

    background-size: contain;
    background-image: url('../../static/hand.png');
  }
</style>