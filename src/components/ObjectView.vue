<template>
  <div class="objectView">
    <h3>{{object.name}}</h3>
    <div class="graphic">
      <img v-if="object.sprites[0]" :src="'./static/sprites/' + object.sprites[0].id + '.png'">
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
    width: 300px;
    height: 200px;
  }

  .objectView h3 {
    text-align: center;
  }

  .graphic {
    position: relative;
    display: flex;
    box-pack: center;
    justify-content: center;
    width: 300px;
    height: 150px;
  }

  .graphic img {
    flex-shrink: 0;
  }

</style>