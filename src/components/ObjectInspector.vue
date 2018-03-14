<template>
  <div class="objectInspector">
    <div class="panels">
      <div class="from transitions">
        <div v-for="trans in object.transitionsTo">
          <TransitionView :transition="trans" :selectedObject="object" />
        </div>
      </div>
      <div class="info">
        <h2>{{object.name.split(' - ')[0]}}</h2>
        <h3>{{object.name.split(' - ')[1]}}</h3>
        <ObjectImage :object="object" />
        <ul>
          <li v-if="object.foodValue > 0">Food: {{object.foodValue}}</li>
          <li v-if="object.heatValue > 0">Heat: {{object.heatValue}}</li>
        </ul>
        <div class="techTree" v-if="object.transitionsTo.length > 0">
          <div class="button" @click="goToTechTree()">Tech Tree</div>
        </div>
      </div>
      <div class="to transitions">
        <div v-for="trans in object.transitionsFrom">
          <TransitionView :transition="trans" :selectedObject="object" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import TransitionView from './TransitionView';
import EventBus from '../services/EventBus';

export default {
  props: ['object'],
  components: {
    ObjectImage,
    TransitionView
  },
  beforeMount () {
    console.dir(this.object);
  },
  methods: {
    goToTechTree () {
      EventBus.$emit('visit-tech-tree', this.object);
    }
  }
}
</script>

<style scoped>
  .objectInspector {
    width: 100%;

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
    margin-top: 10px;
    text-align: center;
  }

  .info .button {
    padding: 3px 10px;
    background-color: #505050;
    border-radius: 5px;
    display: inline;
    font-size: 1.2rem;
  }
  .info .button:hover {
    border: 1px solid #eee;
    background-color: #666;
    cursor: pointer;
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
</style>
