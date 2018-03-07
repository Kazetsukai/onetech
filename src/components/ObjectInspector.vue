<template>
  <div class="objectInspector">
    <h3>{{object.name}}</h3>
    <div class="panels">
      <div class="fromItems">
        <div v-for="trans in object.transitionsTo">
          <ObjectView v-if="trans.target" :object="trans.target" />
        </div>
      </div>
      <ObjectImage :object="object" />
      <div class="toItems">
        <div v-for="trans in object.transitionsFrom">
          <ObjectView v-if="trans.newTarget" :object="trans.newTarget" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';
import ObjectView from './ObjectView';

export default {
  props: ['object'],
  components: {
    ObjectImage,
    ObjectView
  },
  beforeMount () {
    console.dir(this.object);
  },
}
</script>

<style scoped>
  .objectInspector {
    width: 100%;
    height: 600px;

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
    align-content: stretch;

    padding: 10px;
  }

  .panels > div {
    flex-grow: 1;
    margin: 10px;
    background-color: #222;
  }
</style>