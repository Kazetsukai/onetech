<template>
  <div class="image" :style="'width: ' + (width || '200px') + '; height: ' + (height || '200px') + '; background-image: url(' + imageUrl + ');'">
  </div>
</template>

<script>
export default {
  props: ['object', 'width', 'height'],
  computed: {
    imageUrl () {
      return this.object.sprites[0]
        ? './static/sprites/' + this.object.sprites[0].id + '.png'
        : 'about:blank'
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
  }
</style>