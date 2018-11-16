<template>
  <div class="objectInspector">
    <div class="info">
      <h2>{{object.baseName()}}</h2>
      <h3>{{object.subName()}}</h3>
      <ObjectImage :object="object" scaleUpTo="128" />
      <h3 v-if="!object.data">Loading...</h3>

      <ul v-if="object.data">
        <li v-if="object.data.foodValue">Food: {{object.data.foodValue}}</li>
        <li v-if="object.data.heatValue">Heat: {{object.data.heatValue}}</li>
        <li v-if="object.clothingPart()">Clothing: {{object.clothingPart()}}</li>
        <li v-if="object.hasInsulation()">Insulation: {{object.insulationPercent()}}%</li>
        <li v-if="numUses">Number of uses: {{numUses}}</li>
        <li v-if="object.data.useChance">
          Chance to use:
          {{Math.round(object.data.useChance*100)}}%
        </li>
        <li v-if="estimatedUses">Estimated uses: {{estimatedUses}}</li>
        <li v-if="difficultyText">
          Difficulty: {{difficultyText}}
          <span class="helpTip" v-tippy :title="difficultyTip">?</span>
        </li>
        <li v-if="pickupText">{{pickupText}}</li>
        <li v-if="sizeText">{{sizeText}}</li>
        <li v-if="containerText">{{containerText}}</li>
        <li v-if="object.data.version">
          Added in
          <router-link :to="versionUrl">v{{object.data.version}}</router-link>
        </li>
        <li v-else-if="modName">
          Added in {{modName}}
        </li>
        <li v-else>Unreleased</li>
      </ul>

      <div class="actions" v-if="object.data">
        <router-link :to="object.url('tech-tree')" v-if="object.data.techTree" title="Tech Tree" v-tippy>
          <img src="../assets/techtree.png" width="38" height="36" />
        </router-link>
        <router-link :to="object.url('recipe')" v-if="object.data.recipe" title="Crafting Recipe" v-tippy>
          <img src="../assets/recipe.png" width="41" height="42" />
        </router-link>
        <router-link to="/letters" v-if="isLetterOrSign" title="Letters Recipe" v-tippy>
          <img src="../assets/sign.png" width="40" height="41" />
        </router-link>
      </div>
    </div>
    <div class="transitionsPanels" v-if="object.data">
      <div class="transitionsPanel" v-if="object.data.transitionsToward.length > 0 || object.data.mapChance">
        <h3>Ways to get</h3>
        <div v-if="object.data.mapChance" class="spawn">
          <div class="spawnChance">
            Spawn Chance: {{spawnText}}
          </div>
          <div class="biomes">
            <BiomeImage v-for="biome in object.data.biomes"
              class="biome"
              :biome="biome"
              :key="biome" />
          </div>
        </div>
        <TransitionsList
          limit="3"
          :transitions="object.data.transitionsToward"
          :selectedObject="object" />
      </div>
      <div class="transitionsPanel" v-if="object.data.transitionsTimed.length > 0">
        <h3>Changes over time</h3>
        <TransitionsList
          limit="3"
          :transitions="object.data.transitionsTimed"
          :selectedObject="object" />
      </div>
      <div class="transitionsPanel" v-if="object.data.transitionsAway.length > 0">
        <h3>Ways to use</h3>
        <TransitionsList
          limit="3"
          :transitions="object.data.transitionsAway"
          :selectedObject="object" />
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';
import BiomeImage from './BiomeImage';
import TransitionsList from './TransitionsList';

export default {
  components: {
    ObjectImage,
    BiomeImage,
    TransitionsList,
  },
  data() {
    return {
      object: GameObject.findAndLoad(this.$route.params.id),
    };
  },
  created() {
    if (!this.object)
      this.$router.replace("/not-found");
  },
  watch: {
    '$route' (to, from) {
      this.object = GameObject.findAndLoad(this.$route.params.id);
    }
  },
  computed: {
    spawnText() {
      if (!this.object.data || !this.object.data.mapChance) return;
      const level = Math.ceil(parseFloat(this.object.data.mapChance)*15)-1;
      if (level == 0) return "Very Rare";
      if (level < 3) return "Rare";
      if (level < 7) return "Uncommon";
      return "Common";
    },
    difficultyText() {
      if (!this.object.data || typeof this.object.data.difficulty == 'undefined') return;
      const levels = [
        "Extremely Easy",
        "Very Easy",
        "Easy",
        "Moderately Easy",
        "Moderate",
        "Moderately Hard",
        "Hard",
        "Very Hard",
        "Extremely Hard",
      ];
      return levels[this.object.data.difficulty];
    },
    difficultyTip() {
      const stepWord = this.object.data.depth == 1 ? "step" : "steps";
      return `${this.object.data.depth} ${stepWord} to create`;
    },
    numUses() {
      if (!this.object.data.numUses) return;
      // Subtract one if there is a use chance since last use doesn't count
      if (this.object.data.useChance)
        return this.object.data.numUses - 1;
      return this.object.data.numUses;
    },
    estimatedUses() {
      if (!this.object.data.useChance) return;
      return this.numUses * (1/this.object.data.useChance);
    },
    sizeText() {
      if (!this.object.data.size) {
        if (!this.object.data.minPickupAge) return;
        return "Cannot be placed in container";
      }
      return `Item size: ${this.object.size()}`;
    },
    containerText() {
      if (!this.object.data.numSlots) return;
      return `Holds ${this.object.data.numSlots} ${this.object.slotSize()} items`;
    },
    pickupText() {
      if (!this.object.data.minPickupAge) return;
      return `Pickup at Age: ${this.object.data.minPickupAge}`;
    },
    isLetterOrSign() {
      return this.object.name.includes("Letter") || this.object.name.includes("Sign");
    },
    versionUrl() {
      return "/versions/" + this.object.data.version;
    },
    modName() {
      return process.env.ONETECH_MOD_NAME;
    }
  },
  metaInfo() {
    return {title: this.object.name};
  }
}
</script>

<style scoped>
  .objectInspector {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }

  .objectInspector .info {
    flex: 1 1 0;

    background-color: #2b2b2b;
    margin: 10px 0;
    border-radius: 5px;

    padding-bottom: 30px;
  }
  .objectInspector .info > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }
  .objectInspector .info > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
  .objectInspector .info > .imgContainer {
    width: 100%;
    height: 256px;
  }
  .objectInspector .info > ul {
    padding: 0;
    margin: 5px 30px;
    font-size: 1.3rem;
    list-style-type: none;
  }
  .objectInspector .info li {
    text-align: center;
  }

  .objectInspector .info .actions {
    display: flex;
    justify-content: center;
  }
  .objectInspector .info .actions a {
    display: block;
    margin: 20px 10px;
  }
  .objectInspector .info .actions a {
    padding: 8px 10px;
    background-color: #505050;
    border: 1px solid transparent;
    border-radius: 5px;
    display: flex;
    align-items: center;
  }
  .objectInspector .info .actions a:hover {
    border: 1px solid #eee;
    background-color: #666;
  }
  .objectInspector .info .actions a img {
    display: block;
  }

  .objectInspector .info .helpTip {
    display: inline-block;
    width: 1.18rem;
    height: 1.18rem;
    font-size: 0.9rem;
    border: 1px solid #999;
    border-radius: 0.6rem;
    background-color: #222;
    vertical-align: 0.15rem;
    margin-left: 3px;
  }
  .objectInspector .info .helpTip:hover {
    background-color: #555;
    cursor: default;
  }

  .objectInspector .transitionsPanel {
    background-color: #222;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
  }

  .objectInspector .transitionsPanel > h3 {
    font-size: 18px;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .objectInspector .spawn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: #2b2b2b;
    border-radius: 5px;
    margin-top: 10px;
  }

  .objectInspector .spawnChance {
    margin-bottom: 10px;
  }

  .objectInspector .biomes {
    display: flex;
    flex-wrap: wrap;
  }

  .objectInspector .biome {
    width: 64px;
    height: 64px;
    border-radius: 5px;
    margin: 0 5px;
  }

  @media only screen and (max-width: 768px) {
    .objectInspector {
      flex-direction: column;
      align-items: center;
    }

    .objectInspector .info {
      width: 100%;
    }

    .objectInspector .info > ul {
      font-size: 1.1rem;
    }

    .objectInspector .transitionsPanel {
      margin-left: 0;
    }
  }
</style>
