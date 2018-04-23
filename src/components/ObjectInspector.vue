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
        <li v-if="object.data.numUses">Number of Uses: {{object.data.numUses}}</li>
        <li v-if="object.data.biomes">Biome: {{object.data.biomes}}</li>
        <li v-if="spawnText">Spawn Chance: {{spawnText}}</li>
        <li v-if="difficultyText">
          Difficulty: {{difficultyText}}
          <span class="helpTip" v-tippy :title="difficultyTip">?</span>
        </li>
        <li v-if="containerText">{{containerText}}</li>
        <li v-if="object.data.version">Added in v{{object.data.version}}</li>
        <li v-if="!object.data.version">Unreleased</li>
      </ul>
      <div class="actions" v-if="object.data">
        <a :href="object.url('tech-tree')" v-if="object.data.techTree" title="Tech Tree" v-tippy>
          <img src="../assets/techtree.png" width="38" height="36" />
        </a>
        <a :href="object.url('recipe')"  v-if="object.data.recipe" title="Crafting Recipe" v-tippy>
          <img src="../assets/recipe.png" width="41" height="42" />
        </a>
      </div>
    </div>
    <div class="transitionsPanels" v-if="object.data">
      <TransitionsPanel
        title="How to get"
        limit="3"
        :transitions="this.object.data.transitionsToward"
        :selectedObject="object" />

      <TransitionsPanel
        title="Changes over time"
        limit="3"
        :transitions="this.object.data.transitionsTimed"
        :selectedObject="object" />

      <TransitionsPanel
        title="How to use"
        limit="3"
        :transitions="this.object.data.transitionsAway"
        :selectedObject="object" />
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import TransitionsPanel from './TransitionsPanel';

export default {
  props: ['object'],
  components: {
    ObjectImage,
    TransitionsPanel
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
      return levels[Math.floor(this.object.data.difficulty*levels.length)];
    },
    difficultyTip() {
      const complexityStr = this.object.data.complexity.toString();
      const complexityWithCommas = complexityStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const stepWord = complexityStr == '1' ? "step" : "steps";
      return `${complexityWithCommas} ${stepWord} to create`;
    },
    containerText() {
      if (!this.object.data.numSlots) return;
      const size = this.object.data.slotSize > 1 ? "large" : "small";
      return `Holds ${this.object.data.numSlots} ${size} items`;
    }
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
    margin-bottom: 10px;
    margin-left: 10px;
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
