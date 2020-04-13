<template>
  <div class="biomeInspector">
    <div class="filterSelection">
      <router-link to="/" class="filterSelectionBack">Back</router-link>
      <div class="filterSelectionName">Natural</div>
    </div>
    <div class="biomes">
      <div class="biomesTitle">Biomes</div>
      <BiomeList :selectedBiome="biome" />
    </div>
    <div class="info">
      <h2 class="title">{{biome.name}} Biome</h2>
      <h3 class="subtitle" v-if="!biome.data">Loading...</h3>
      <div class="biomeImgContainer">
        <BiomeImage :biome="biome" />
      </div>
      <ul v-if="biome.data">
        <li>
          Temperature: {{temperatureText}}
          <span class="details">(ground heat: {{biome.data.groundHeat}})</span>
        </li>
      </ul>
      <div class="objects">
        <div class="object" v-for="object in objects">
          <ObjectView :object="object" :spawnChance="biome.spawnChance(object)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';
import Biome from '../models/Biome';

import ObjectView from './ObjectView';
import BiomeImage from './BiomeImage';
import BiomeList from './BiomeList';

export default {
  components: {
    ObjectView,
    BiomeList,
    BiomeImage,
  },
  data() {
    return {
      biome: Biome.findAndLoad(this.$route.params.id),
    };
  },
  created() {
    if (!this.biome)
      this.$router.replace("/not-found");
  },
  watch: {
    '$route' (to, from) {
      this.biome = Biome.findAndLoad(this.$route.params.id);
    }
  },
  computed: {
    objects() {
      return this.biome.objects();
    },
    temperatureText() {
      const heat = this.biome.data.groundHeat;
      if (heat < 0.0) return "Very Cold";
      if (heat < 0.5) return "Cold";
      if (heat < 1.0) return "Cool";
      if (heat < 1.1) return "Mild";
      if (heat < 1.9) return "Warm";
      if (heat < 2.1) return "Hot";
      return "Very Hot"
    }
  },
  metaInfo() {
    return {title: this.biome.name + " Biome"};
  }
}
</script>

<style lang="scss">
.biomeInspector {
  .filterSelection {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
    text-align: center;
    position: relative;
  }

  .filterSelectionBack {
    position: absolute;
    top: 0;
    left: 0;
    padding: 15px 20px;
  }

  .filterSelectionName {
    font-size: 24px;
    font-weight: bold;
  }

  .biomes {
    background-color: #222;
    border-radius: 5px;
    width: 100%;
    padding: 10px;
    margin: 10px 0px;
    box-sizing: border-box;
  }
  .biomesTitle {
    font-weight: bold;
    text-align: center;
  }

  .info {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0px;
  }
  .info .title {
    text-align: center;
    font-weight: bolder;
    margin: 0;
  }
  .info .subtitle {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin: 0;
  }
  .info ul {
    padding: 0;
    margin: 0 30px;
    font-size: 1.2rem;
    list-style-type: none;
  }
  .info li {
    text-align: center;
    padding: 2px 0;
  }
  .info li .details {
    color: #999;
  }

  .info .biomeImgContainer {
    width: 128px;
    height: 128px;
    display: block;
    margin: 5px auto;
  }

  .info .biomeImage {
    border-radius: 12px;
  }

  .info .objects {
    display: flex;
    flex-wrap: wrap;
  }

  .info .object {
    min-width: 200px;
    width: 33.3333%;
  }

  .info .objectView {
    /* TODO: Figure out how to override scoped CSS better */
    height: 220px !important;
  }

  .info .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  @media only screen and (max-width: 768px) {
    .info .object {
      min-width: 150px;
      width: 50%;
    }
  }
}
</style>
