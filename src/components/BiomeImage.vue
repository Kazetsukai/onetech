<template>
  <div class="biomeImage" :style="{backgroundImage: `url('${imageUrl}')`}">
  </div>
</template>

<script>
export default {
  props: [
    'biome',
  ],
  computed: {
    imageUrl() {
      return `${global.staticPath}/ground/ground_${this.biome.id}.png`;
    }
  }
}
</script>

<style scoped>
  .biomeImage {
    width: 100%;
    height: 100%;
  }
</style>
