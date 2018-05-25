<template>
  <div class="changeLogObjectChange" v-if="object">
    <ObjectImage :object="object" scaleUpTo="80" :clickable="true" :title="object.name" />

    <div class="attributesFrom">
      <div class="attribute" v-for="attribute in attributes" :key="attribute">
        {{attributeName(attribute)}}:
        {{attributeValue(attribute, "from")}}
      </div>
    </div>

    <div class="arrow">&#9660;</div>

    <div class="attributesTo">
      <div class="attribute" v-for="attribute in attributes" :key="attribute">
        {{attributeName(attribute)}}:
        {{attributeValue(attribute, "to")}}
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: [
    'change',
  ],
  components: {
    ObjectImage
  },
  computed: {
    object() {
      return GameObject.find(this.change.id);
    },
    attributes() {
      return Object.keys(this.change.attributes);
    },
  },
  methods: {
    attributeName(attribute) {
      return attribute.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },
    attributeValue(attribute, key) {
      return this.change.attributes[attribute][key];
    },
  }
}
</script>

<style scoped>
  .changeLogObjectChange {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #333;
    border-radius: 10px;
    padding: 10px;
    margin: 10px;
  }

  .changeLogObjectChange .arrow {
    color: #777;
    font-size: 12px;
    padding: 3px 0;
  }

  .changeLogObjectChange .attribute {
    text-align: center;
  }

  .changeLogObjectChange .imgContainer {
    width: 128px;
    height: 128px;
  }
</style>
