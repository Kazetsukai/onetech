<template>
  <div class="objectSearch">
    <VueAwesomplete></VueAwesomplete>
  </div>
</template>

<script>
import VueAwesomplete from 'vue-awesomplete'

export default {
  props: ['objects'],
  components: {
    VueAwesomplete
  }
}
</script>

<style scoped>

</style>