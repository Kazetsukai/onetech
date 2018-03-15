<template>
  <div class="objectInspector">
    <div class="panels">
      <div class="toward transitions">
        <div v-for="trans in objectData.transitionsToward">
          <TransitionView :transition="trans" :selectedObjectID="object.id" />
        </div>
      </div>
      <div class="info">
        <h2>{{object.name.split(' - ')[0]}}</h2>
        <h3>{{object.name.split(' - ')[1]}}</h3>
        <ObjectImage :object="object" />
        <h3 v-if="objectData.loading">Loading...</h3>
        <ul>
          <li v-if="objectData.foodValue > 0">Food: {{objectData.foodValue}}</li>
          <li v-if="objectData.heatValue > 0">Heat: {{objectData.heatValue}}</li>
        </ul>
      </div>
      <div class="away transitions">
        <div v-for="trans in objectData.transitionsAway">
          <TransitionView :transition="trans" :selectedObjectID="object.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import TransitionView from './TransitionView';

export default {
  props: ['object', 'objectData'],
  components: {
    ObjectImage,
    TransitionView
  },
  beforeMount () {
    console.dir(this.object);
  },
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
    margin: 5px 30px 5px 30px;
    font-size: 1.3rem;
    list-style-type: none;
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
