<template>
  <!-- :style="{ backgroundColor: transition.hand ? 'blue' : (transition.tool ? 'red' : 'inherit') }" -->
  <div class="transitionView">
    <div class="arrow"></div>

    <!-- What object is being used -->
    <ObjectImage class="actor transitionObject"
                v-if="transition.decay"
                hover="true"
                :decay="transition.decay" />

    <ObjectImage class="actor transitionObject"
                v-else-if="transition.actorID || transition.hand"
                hand="true" hover="true"
                :object="actor"
                :uses="transition.actorUses"
                :clickable="transition.actorID && actor != selectedObject" />

    <span class="plus" v-if="transition.actorID || transition.decay || transition.hand">+</span>

    <!-- What object is the target -->
    <ObjectImage class="target transitionObject"
                v-if="transition.targetID"
                hover="true"
                :object="target"
                :uses="transition.targetUses"
                :clickable="transition.targetID && target != selectedObject" />

    <ObjectImage class="target transitionObject"
                v-else-if="transition.targetPlayer"
                hover="true"
                player="true" />

    <ObjectImage class="target transitionObject"
                v-else
                ground="true"
                hover="true" />

    <!-- What does the used object become? -->
    <ObjectImage class="newActor transitionObject"
                v-if="!transition.decay && (!transition.tool || transition.newActorUses)"
                hand="true" hover="true"
                :uses="transition.newActorUses"
                :object="newActor"
                :clickable="newActor && newActor != selectedObject" />

    <!-- What does the target item become? -->
    <ObjectImage class="newTarget transitionObject"
                v-if="transition.newTargetID && (!transition.targetRemains || transition.newTargetUses)"
                hover="true"
                :uses="transition.newTargetUses"
                :object="newTarget"
                :extraObject="newExtraTarget"
                :clickable="newTarget && newTarget != selectedObject" />

    <ObjectImage class="newTarget transitionObject"
                v-else
                ground="true"
                hover="true" />
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: ['transition', 'selectedObject'],
  components: {
    ObjectImage
  },
  computed: {
    actor () {
      return GameObject.find(this.transition.actorID);
    },
    target () {
      return GameObject.find(this.transition.targetID);
    },
    newActor () {
      return GameObject.find(this.transition.newActorID);
    },
    newTarget () {
      return GameObject.find(this.transition.newTargetID);
    },
    newExtraTarget () {
      return GameObject.find(this.transition.newExtraTargetID);
    },
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
