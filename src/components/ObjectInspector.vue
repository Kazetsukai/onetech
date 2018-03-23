<template>
  <div class="objectInspector">
    <div class="panels">
      <div class="toward transitions">
        <div v-for="transition in object.transitionsToward">
          <TransitionView :transition="transition" :selectedObjectID="objectID" />
        </div>
      </div>
      <div class="info">
        <h2>{{baseName}}</h2>
        <h3>{{subName}}</h3>
        <ObjectImage :objectID="objectID" />
        <h3 v-if="object.loading">Loading...</h3>
        <ul>
          <li v-if="object.foodValue > 0">Food: {{object.foodValue}}</li>
          <li v-if="object.heatValue > 0">Heat: {{object.heatValue}}</li>
          <li v-if="clothingPart()">Clothing: {{clothingPart()}}</li>
          <li v-if="!isNaN(object.insulation)">Insulation: {{object.insulation.toFixed(4)*100}}%</li>
          <!-- <li v-if="object.complexity > 0">Complexity: {{object.complexity}}</li> -->
        </ul>
        <div class="techTree" v-if="object.techTree">
          <a :href="techTreeUrl">
          <img src="../assets/techtree.png" width="38" height="36" title="Tech Tree" v-tippy /></a>
        </div>
      </div>
      <div class="away transitions">
        <div v-for="transition in object.transitionsAway">
          <TransitionView :transition="transition" :selectedObjectID="objectID" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectService from '../services/ObjectService'

import ObjectImage from './ObjectImage';
import TransitionView from './TransitionView';

export default {
  props: ['objectID'],
  components: {
    ObjectImage,
    TransitionView
  },
  data () {
    return {
      object: null,
    }
  },
  beforeMount () {
    this.loadObject();
  },
  computed: {
    baseName () {
      return ObjectService.baseName(this.objectID);
    },
    subName () {
      return ObjectService.subName(this.objectID);
    },
    techTreeUrl () {
      return ObjectService.url(this.objectID, 'tech-tree');
    },
  },
  watch: {
    objectID () { this.loadObject(); }
  },
  methods: {
    loadObject () {
      this.object = {loading: true};
      ObjectService.fetchObject(this.objectID, obj => this.object = obj);
    },
    clothingPart () {
      var parts = {'h': "Head", 't': "Chest", 'b': "Bottom", 's': "Foot", 'p': "Back"};
      return parts[this.object.clothing];
    }
  }
}
</script>

<style scoped>
  .objectInspector {
    display: flex;
    flex-direction: column;
    align-content: center;

    background-color: #222;
    margin-top: 10px;
    border-radius: 5px;
  }

  .objectInspector > h3 {
    text-align: center;
  }

  .info {
    flex: 1 1 0;
    min-width: 220px;

    background-color: #333;
    margin: 10px;
    border-radius: 5px;

    padding-bottom: 30px;
  }
  .info > h2 {
    text-align: center;
    font-weight: bolder;
    margin-bottom: 0px;
  }
  .info > h3 {
    text-align: center;
    font-weight: lighter;
    font-style: italic;
    margin-top: 0px;
  }
  .info > .imgContainer {
    width: 100%;
    height: 256px;
  }
  .info > ul {
    padding: 0;
    margin: 5px 30px;
    font-size: 1.3rem;
    list-style-type: none;
  }
  .info li {
    text-align: center;
  }

  .info .techTree {
    margin-top: 20px;
    text-align: center;
  }

  .info .techTree img {
    padding: 8px 10px;
    background-color: #505050;
    border: 1px solid transparent;
    border-radius: 5px;
  }
  .info .techTree img:hover {
    border: 1px solid #eee;
    background-color: #666;
  }

  .panels {
    display: flex;
    flex-direction: row;

    padding: 10px;
  }
  .panels > .transitions {
    width: 220px;

    display: flex;
    flex-direction: column;
    align-content: center;
  }
  .panels > .transitions > div {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  @media only screen and (max-width: 768px) {
    .panels {
      flex-direction: column;
    }
    .panels .transitions {
      width: 100%;
    }

    .info {
      order: -1;
    }
  }
</style>
