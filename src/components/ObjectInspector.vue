<template>
  <div class="objectInspector">
    <div class="panels">
      <div class="toward transitions" v-if="object.data">
        <div v-for="transition in object.data.transitionsToward">
          <TransitionView :transition="transition" :selectedObject="object" />
        </div>
      </div>
      <div class="info">
        <h2>{{object.baseName()}}</h2>
        <h3>{{object.subName()}}</h3>
        <ObjectImage :object="object" />
        <h3 v-if="!object.data">Loading...</h3>
        <ul v-if="object.data">
          <li v-if="object.data.foodValue">Food: {{object.data.foodValue}}</li>
          <li v-if="object.data.heatValue">Heat: {{object.data.heatValue}}</li>
          <li v-if="object.clothingPart()">Clothing: {{object.clothingPart()}}</li>
          <li v-if="object.hasInsulation()">Insulation: {{object.insulationPercent()}}%</li>
          <li v-if="object.data.numUses">Number of Uses: {{object.data.numUses}}</li>
          <li v-if="object.data.version">Added in v{{object.data.version}}</li>
          <!-- <li v-if="object.data.complexity > 0">Complexity: {{object.data.complexity}}</li> -->
        </ul>
        <div class="actions" v-if="object.data">
          <a :href="object.url('tech-tree')" v-if="object.data.techTree" title="Tech Tree" v-tippy>
            <img src="../assets/techtree.png" width="38" height="36" />
          </a>
          <a :href="object.url('steps')"  v-if="object.data.steps" title="Crafting Steps" v-tippy>
            <img src="../assets/steps.png" width="41" height="42" />
          </a>
        </div>
      </div>
      <div class="away transitions" v-if="object.data">
        <div v-for="transition in object.data.transitionsAway">
          <TransitionView :transition="transition" :selectedObject="object" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import TransitionView from './TransitionView';

export default {
  props: ['object'],
  components: {
    ObjectImage,
    TransitionView
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

  .info .actions {
    display: flex;
    justify-content: center;
  }

  .info .actions a {
    display: block;
    margin: 20px 10px;
  }

  .info .actions a {
    padding: 8px 10px;
    background-color: #505050;
    border: 1px solid transparent;
    border-radius: 5px;
    display: flex;
    align-items: center;
  }
  .info .actions a:hover {
    border: 1px solid #eee;
    background-color: #666;
  }
  .info .actions a img {
    display: block;
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
