<template>
  <router-link v-if="clickable"
      :class="className"
      :title="title" v-tippy
      :to="object.url()"
      @contextmenu.native="handleRightClick">
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
    'click',
    'rightClick',
  ],
  methods: {
    handleRightClick(event) {
      if (this.rightClick) {
        event.preventDefault();
        this.rightClick(this.object);
      }
    }
  }
}
</script>
