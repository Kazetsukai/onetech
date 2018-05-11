<template>
  <router-link v-if="clickable"
      :class="className"
      :title="title" v-tippy
      :to="object.url()">
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
  ]
}
</script>
