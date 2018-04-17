<template>
  <div class="requirements">
    <h4>Requirements</h4>
    <div class="requirementObjects">
      <div class="requirementWrap" v-for="object in objects">
        <ObjectImage class="requirementObject"
              hover="true"
              clickable="true"
              :object="object"
              :uses="requirementUses(object)" />
      </div>
    </div>
  </div>
</template>

<script>
import GameObject from '../models/GameObject';

import ObjectImage from './ObjectImage';

export default {
  props: ['requirements'],
  components: {
    ObjectImage
  },
  computed: {
    objects() {
      const uniqueIDs = this.requirements.filter((id, i) => this.requirements.indexOf(id) == i);
      return uniqueIDs.map(id => GameObject.find(id))
    }
  },
  methods: {
    requirementUses(object) {
      const count = this.requirements.filter(id => id == object.id).length;
      if (count > 1)
        return `x${count}`;
    }
  }
}
</script>

<style scoped>
  .requirements {
    background-color: #3c3c3c;
    margin: 10px;
    border-radius: 5px;
    padding-top: 1px;
    padding-bottom: 10px;
  }

  .requirements h4 {
    text-align: center;
    font-size: 16px;
    margin-top: 5px;
    margin-bottom: 0;
  }

  .requirements .requirementObjects {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    margin-left: 10px;
  }

  .requirements .requirementWrap {
    display: flex;
    align-items: center;
    margin: 5px;
    border: solid 2px #333;
    border-radius: 5px;
  }

  .requirements .requirementObject {
    z-index: 1;
    position: relative;
    display: block;
    border: 1px solid transparent;
    background-color: #555;
    width: 80px;
    height: 80px;
  }
  .requirements .requirementObject:hover {
    border: 1px solid #aaa;
    background-color: #666;
  }
</style>
