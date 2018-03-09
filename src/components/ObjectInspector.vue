<template>
  <div class="objectInspector">
    <h3>{{object.name}}</h3>
    <div class="panels">
      <div class="fromItems">
        <div v-for="trans in object.transitionsTo">
          <TransitionView :transition="trans" :selectedObject="object" />
        </div>
      </div>
      <ObjectImage :object="object" />
      <div class="toItems">
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

export default {
  props: ['object'],
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

  .panels {
    display: flex;
    flex-direction: row;

    padding: 10px;
  }

  .panels > div {
    display: flex;
    flex-direction: column;
    align-content: center;
    flex: 1 1 0;
    margin: 10px;
    background-color: #222;
  }

  .panels > div > div {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
</style>