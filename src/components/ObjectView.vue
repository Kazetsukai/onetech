<template>
  <a class="nostyle" :href="object.url()">
    <div class="objectView">
      <h3>{{object.name}}</h3>
      <ObjectImage :object="object" scaleUpTo="80" />
    </div>
  </a>
</template>

<script>
import ObjectImage from './ObjectImage';

export default {
  props: ['object'],
  components: {
    ObjectImage
  }
}
</script>

<style scoped>
  .objectView {
    height: 200px;

    display: flex;
    flex-direction: column;
    align-items: center;

    background-color: #333;
    margin: 10px;
    border-radius: 5px;
    border: 1px solid transparent;
  }

  .objectView h3 {
    text-align: center;
  }

  a.nostyle:link {
    text-decoration: inherit;
    color: inherit;
  }

  a.nostyle:visited {
    text-decoration: inherit;
    color: inherit;
  }

  @media only screen and (min-width: 768px) {
    .objectView:hover {
      border: 1px solid #eee;
      background-color: #222;
    }
  }

  @media only screen and (max-width: 768px) {
    .objectView h3 {
      font-size: 16px;
    }
  }
</style>
