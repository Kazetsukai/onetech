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
          <li v-if="object.data.foodValue > 0">Food: {{object.data.foodValue}}</li>
          <li v-if="object.data.heatValue > 0">Heat: {{object.data.heatValue}}</li>
          <li v-if="object.clothingPart()">Clothing: {{object.clothingPart()}}</li>
          <li v-if="object.hasInsulation()">Insulation: {{object.insulationPercent()}}%</li>
          <li v-if="object.data.numUses > 1">Number of Uses: {{object.data.numUses}}</li>
          <!-- <li v-if="object.data.complexity > 0">Complexity: {{object.data.complexity}}</li> -->
        </ul>
        <div class="techTree" v-if="object.data && object.data.techTree">
          <a :href="object.url('tech-tree')">
          <img src="../assets/techtree.png" width="38" height="36" title="Tech Tree" v-tippy /></a>
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
