<template>
  <div class="biomeList">
    <router-link v-for="biome in biomes" :to="biome.url()" :title="biome.name" v-tippy class="biome" :key="biome.id" :class="{selected: biome == selectedBiome}">
      <BiomeImage :biome="biome" />
    </router-link>
  </div>
</template>

<script>
import Biome from '../models/Biome';

import BiomeImage from './BiomeImage';

export default {
  components: {
    BiomeImage,
  },
  props: [
    'selectedBiome',
  ],
  computed: {
    biomes() {
      return Biome.biomes();
    }
  }
}
</script>

<style lang="scss">
.biomeList {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  .biome {
    margin: 8px;
    width: 64px;
    height: 64px;
    &.selected .biomeImage {
      border: solid 1px white;
    }
  }

  .biomeImage {
    border-radius: 5px;
    border: solid 1px transparent;
    &:hover {
      border: solid 1px white;
    }
  }
}
</style>
