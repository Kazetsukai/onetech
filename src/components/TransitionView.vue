<template>
  <div class="transitionView">
    <ObjectImage class="actor transitionObject" 
                :class="{ current: transition.actor == selectedObject }" 
                v-if="transition.actor" 
                :object="transition.actor"
                :clickable="transition.actor != selectedObject" />
    <span class="plus">+</span>
    <ObjectImage class="target transitionObject" 
                :class="{ current: transition.target == selectedObject }" 
                v-if="transition.target" 
                :object="transition.target" 
                :clickable="transition.target != selectedObject" />
    <ObjectImage class="newTarget transitionObject" 
                :class="{ current: transition.newTarget == selectedObject }" 
                v-if="transition.newTarget" 
                :object="transition.newTarget" 
                :clickable="transition.newTarget != selectedObject" />
    <ObjectImage class="newActor transitionObject" 
                :class="{ current: transition.newActor == selectedObject }" 
                v-if="transition.newActor" 
                :object="transition.newActor"
                :clickable="transition.newActor != selectedObject" />
  </div>
</template>

<script>
import ObjectImage from './ObjectImage';

export default {
  props: ['transition', 'selectedObject'],
  components: {
    ObjectImage
  }
}
</script>

<style scoped>
  .transitionView {
    width: 200px;
    height: 200px;

    position: relative;

    background-color: #333;
    margin: 10px;
    border-radius: 5px;
  }

  .transitionObject {
    position: absolute;
    border: 1px solid transparent;
    background-color: #444;
    width: 64px;
    height: 64px;
    border-radius: 5px;
  }
  .transitionObject:hover {
    border: 1px solid #aaa;
    background-color: #494949;
  }

  .transitionObject.current {
    background-color: #393939;
  }
  .transitionObject.current:hover {
    border: 1px solid transparent;
  }

  .plus {
    position: absolute;
    font-size: 16pt;
    left: calc(50% - 0.3em);
    top: calc(25% - 0.5em);
  }
  .actor{
    left: calc(30% - 32px);
    top: calc(25% - 32px);
  }
  .target{
    left: calc(70% - 32px);
    top: calc(25% - 32px);
  }
  .newActor{
    left: calc(30% - 32px);
    top: calc(75% - 32px);
  }
  .newTarget{
    left: calc(70% - 32px);
    top: calc(75% - 32px);
  }

</style>