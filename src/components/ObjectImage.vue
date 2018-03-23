<template>
  <div class="imgContainer" :class="clickable ? '' : 'current'" :title="title" v-tippy>
    <div v-if="hand" class="hand" :style="objectID ? {} : { width: '100%', height: '100%' }" />
    <div v-if="decay" class="decay"><span>{{decay}}</span></div>
    <div v-if="ground" class="ground"></div>
    <a :href="clickable ? objectUrl : undefined">
      <div class="image" v-if="objectID" :style="'background-image: url(' + imageUrl + ');'">
    </div></a>
  </div>
</template>

<script>
import ObjectService from '../services/ObjectService'

export default {
  props: ['objectID', 'clickable', 'hand', 'hover', 'decay', 'ground'],
  computed: {
    objectUrl () {
      return ObjectService.url(this.objectID);
    },
    imageUrl () {
      return this.objectID
        ? `${STATIC_PATH}/sprites/obj_${this.objectID}.png`
        : 'about:blank';
    },
    title () {
      if (!this.hover)
        return '';

      if (this.objectID)
        return ObjectService.baseName(this.objectID);

      if (this.hand)
        return "Empty hands"

      if (this.ground)
        return "Empty ground"

      if (this.decay)
        return this.decay.replace("s", " second").replace("h", " hour") + (parseInt(this.decay) != 1 ? 's' : '');
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

    border-radius: 5px;
    overflow: hidden;
  }

  .hand {
    position: absolute;
    width: 50%;
    height: 50%;
    left: -2px;
    bottom: -2px;

    transform: translateZ(0);

    background-size: contain;
    background-image: url('../assets/hand.png');
  }

  /*.ground {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.4;

    background-size: contain;
    background-image: url('../../static/grass.png');
  }*/

  .decay {
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: -2px;

    background-size: contain;
    background-image: url('../assets/stopwatch.png');

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .decay > span {
    margin-top: 10px;

    color: #111;
    font-weight: bolder;
    background-color: #eaeaeaee;
    border-radius: 10px;
    padding: 0px 3px 0px 3px;
  }
</style>
