<template>
  <div v-if="leftClick"
      :class="className"
      :title="title" v-tippy
      @contextmenu.native="handleRightClick"
      @click="handleLeftClick">
    <slot />
  </div>
  <router-link v-else-if="clickable"
      :class="className"
      :title="title" v-tippy
      :to="object.url()"
      @contextmenu.native="handleRightClick"
      @click="handleLeftClick">
    <slot />
  </router-link>
  <div v-else
      :class="[className, 'current']"
      :title="title" v-tippy>
    <slot />
  </div>
</template>

<script>
export default {
  props: [
    'className',
    'clickable',
    'title',
    'object',
    'leftClick',
    'rightClick',
  ],
  methods: {
    handleLeftClick(event) {
      if (this.leftClick) {
        event.preventDefault();
        this.leftClick(this.object);
      }
    },
    handleRightClick(event) {
      if (this.rightClick) {
        event.preventDefault();
        this.rightClick(this.object);
      }
    }
  }
}
</script>
