<template>
  <ObjectImageWrapper
      className="imgContainer"
      :clickable="clickable && !legacy"
      :title="title"
      :object="object"
      :rightClick="rightClick">
    <div v-if="hand" class="hand" :style="object ? {} : { width: '100%', height: '100%' }" />
    <div v-if="legacy" class="removed" />
    <div v-if="player" class="player" />
    <div v-if="wildcard" class="wildcard"></div>
    <div v-if="uses" class="uses">{{uses}}</div>
    <div v-if="weight" class="weight">{{weightPercent}}%</div>
    <div v-if="decay" class="decay"><span>{{decay}}</span></div>
    <div v-if="move" class="move">move</div>
    <div v-if="ground" class="ground"></div>
    <div v-if="object && !legacy" class="image">
      <img :id="imageID" :src="imageUrl" :alt="title" />
    </div>
  </ObjectImageWrapper>
</template>

<script>
import ObjectImageWrapper from './ObjectImageWrapper'

export default {
  props: [
    'object',
    'extraObject',
    'clickable',
    'rightClick',
    'hand',
    'hover',
    'decay',
    'ground',
    'uses',
    'player',
    'wildcard',
    'scaleUpTo',
    'weight',
    'move'
  ],
  components: {
    ObjectImageWrapper,
  },
  mounted() { // Enlarge small images up to a certain amount
    if (!this.scaleUpTo) return;
    const img = document.getElementById(this.imageID);
    if (!img) return;
    img.onload = () => {
      let multiplier = this.scaleUpTo/Math.max(img.naturalWidth, img.naturalHeight);
      if (multiplier < 1.0) {
        img.style.cssText = "object-fit: scale-down; width: 100%; height: 100%";
        return;
      }
      if (multiplier > 1.8)
        multiplier = 1.8;
      const width = Math.round(img.naturalWidth*multiplier);
      const height = Math.round(img.naturalHeight*multiplier);
      img.style.cssText = `object-fit: initial; width: ${width}px; height: ${height}px`;
    };
  },
  computed: {
    imageUrl () {
      if (!this.object) return "about:blank";
      const suffix = this.uses == "last" && !this.object.category ? "_last" : "";
      return `${global.staticPath}/sprites/obj_${this.object.id}${suffix}.png`;
    },
    imageID () {
      return ["image", this.object.id, Math.random().toString(36).substr(2, 7)].join("-");
    },
    legacy () {
      return this.object && this.object.legacy;
    },
    title () {
      if (!this.hover)
        return '';

      if (this.object) {
        if (this.extraObject)
          return `${this.object.name} with ${this.extraObject.name}`;
        return this.object.name;
      }

      if (this.player)
        return "Player"

      if (this.wildcard)
        return "Wildcard Object"

      if (this.hand)
        return "Empty hands"

      if (this.ground)
        return "Empty ground"

      if (this.decay)
        return this.decay.replace("s", " second").replace("m", " minute").replace("h", " hour") + (parseInt(this.decay) != 1 ? 's' : '');
    },
    weightPercent () {
      return Math.round(this.weight*1000)/10.0;
    },
  }
}
</script>

<style scoped>
  .imgContainer {
    display: inline-block;
    vertical-align: middle;

    z-index: 0;

    border-radius: 5px;
    overflow: hidden;
  }

  .imgContainer .image {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image img {
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;

    transform: translateZ(0);

    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }

  .hand {
    position: absolute;
    width: 50%;
    height: 50%;
    left: -2px;
    bottom: -2px;

    z-index: 2;

    background-size: contain;
    background-image: url('../assets/hand.png');
  }

  .player {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../assets/player.png');
  }

  .removed {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../assets/removed.png');
  }

  .wildcard {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: url('../assets/wildcard.png');
  }

  .uses, .weight, .move {
    position: absolute;
    color: black;
    font-weight: bold;
    font-size: 12px;
    padding: 1px 4px;
    background-color: rgba(180, 180, 180, 0.75);
    border-radius: 3px;
    z-index: 2;
  }

  .uses {
    right: 4px;
    bottom: 4px;
  }

  .weight {
    left: 4px;
    bottom: 4px;
  }

  .move {
    left: 4px;
    top: 4px;
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
