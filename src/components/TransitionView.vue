<template>
  <!-- :style="{ backgroundColor: transition.hand ? 'blue' : (transition.tool ? 'red' : 'inherit') }" -->
  <div class="transitionView">
    <div class="arrow"></div>

    <!-- What is being used on what -->
    <ObjectImage class="actor transitionObject"
                v-if="transition.decay"
                hover="true"
                :decay="transition.decay" />

    <ObjectImage class="actor transitionObject"
                v-if="transition.actor || transition.hand" 
                hand="true" hover="true"
                :object="transition.actor"
                :clickable="transition.actor && transition.actor != selectedObject" />
    <span class="plus" v-if="transition.actor || transition.decay || transition.hand">+</span>
    <ObjectImage class="target transitionObject"
                v-if="transition.target" 
                hover="true"
                :object="transition.target" 
                :clickable="transition.target != selectedObject" />

    <ObjectImage class="target transitionObject"
                v-if="!transition.target" 
                ground="true"
                hover="true" />

    <!-- What does the item used become? -->
    <ObjectImage class="newActor transitionObject"
                v-if="!transition.tool && !transition.decay" 
                hand="true" hover="true"
                :object="transition.newActor"
                :clickable="transition.newActor && transition.newActor != selectedObject" />

    <!-- What does the target item become? -->
    <ObjectImage class="newTarget transitionObject"
                v-if="transition.newTarget && (!transition.targetRemains || transition.target.numUses > 0)" 
                hover="true" :usedUp="!transition.newTarget"
                :object="transition.newTarget" 
                :clickable="transition.newTarget != selectedObject" />
    <ObjectImage class="newTarget transitionObject"
                v-if="!transition.targetRemains && !transition.newTarget" 
                ground="true"
                hover="true"  />
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
  .arrow {
    position: absolute;
    width: 100%;
    height: 100%;
    

    background-color: #2b2b2b;

    z-index: 0;

    transform: translateY(-57%) rotateX(100deg) scale(5) rotateZ(45deg);
  }

  .transitionView {
    width: 200px;
    height: 200px;

    position: relative;
    overflow: hidden;

    background-color: #333733;
    margin: 10px;
    border-radius: 5px;
  }

  .transitionObject {
    position: absolute;
    border: 1px solid transparent;
    background-color: #555;
    width: 64px;
    height: 64px;
  }
  .transitionObject:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }

  .transitionObject.current {
    background-color: #444;
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