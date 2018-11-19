<template>
  <div class="biomeInspector">
    <h2>{{biome.name}} Biome</h2>
    <h3 v-if="!biome.data">Loading...</h3>
    <div class="biomeImgContainer">
      <BiomeImage :biome="biome" />
    </div>
    <div class="objects">
      <div class="object" v-for="object in objects">
        <ObjectView :object="object" :spawnInfo="true" />
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';
import Biome from '../models/Biome';

import ObjectView from './ObjectView';
import BiomeImage from './BiomeImage';

export default {
  components: {
    ObjectView,
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
    }
  },
  metaInfo() {
    return {title: this.biome.name + " Biome"};
  }
}
</script>

<style>
  .biomeInspector {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0px;
  }
  .biomeInspector > h2 {
    text-align: center;
    font-weight: bolder;
    margin: 0;
  }
  .biomeInspector > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin: 0;
  }
  .biomeInspector > ul {
    padding: 0;
    margin: 0 30px;
    font-size: 1.2rem;
    list-style-type: none;
  }
  .biomeInspector li {
    text-align: center;
    padding: 2px 0;
  }

  .biomeInspector .biomeImgContainer {
    width: 128px;
    height: 128px;
    display: block;
    margin: 5px auto;
  }

  .biomeInspector .biomeImage {
    border-radius: 12px;
  }

  .biomeInspector .objects {
    display: flex;
    flex-wrap: wrap;
  }

  .biomeInspector .object {
    min-width: 200px;
    width: 33.3333%;
  }

  .biomeInspector .objectView {
    /* TODO: Figure out how to override scoped CSS better */
    height: 220px !important;
  }

  .biomeInspector .objectView .imgContainer {
    width: 128px;
    height: 128px;
  }

  @media only screen and (max-width: 768px) {
    .biomeInspector .object {
      min-width: 150px;
      width: 50%;
    }
  }
</style>
