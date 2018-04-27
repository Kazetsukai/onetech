<template>
  <div class="biomeImage" :title="name" v-tippy :style="{backgroundImage: `url('${imageUrl}')`}">
  </div>
</template>

<script>
export default {
  props: [
    'biome',
  ],
  computed: {
    imageUrl() {
      return `${STATIC_PATH}/ground/ground_${this.biome}.png`;
    },
    name() {
      const names = ["Grassland", "Swamp", "Prairie", "Rocky", "Snow", "Desert"];
      return names[parseInt(this.biome)];
    }
  }
}
</script>
