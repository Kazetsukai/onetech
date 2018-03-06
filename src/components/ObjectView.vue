<template>
  <div class="objectView">
    <h3>{{object.name}}</h3>
    <div class="graphic">
      <img v-for="sprite in object.sprites" :src="'./static/sprites/' + sprite.id + '.png'" :style="'bottom: ' + parseInt(sprite.y) + 'px; left: ' + parseInt(sprite.x) + 'px; margin-top: ' + (-parseInt(sprite.y)/2) + 'px; margin-left: ' + (-parseInt(sprite.x)/2) + 'px;'">
    </div>
  </div>
</template>

<script>

export default {
  props: ['object']
}
</script>

<style scoped>
  .objectView {
    width: 400px;
    height: 400px;
  }

  .graphic {
    position: relative;
    width: 400px;
    height: 350px;
  }

  .graphic img {
    position: absolute;
  }

</style>