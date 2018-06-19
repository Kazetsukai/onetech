<template>
  <router-link class="nostyle" :to="object.url()">
    <div class="objectView">
      <h3>{{object.name}}</h3>
      <div class="badges">
        <div class="badge" v-tippy :title="badgeText(badge)" v-for="badge in object.badges()">
          <img :src="badgeImage(badge)" />
          <span v-if="badge.value" class="badgeValue">{{badge.value}}</span>
        </div>
      </div>
      <ObjectImage :object="object" scaleUpTo="80" />
    </div>
  </router-link>
</template>

<script>
import ObjectImage from './ObjectImage';

export default {
  props: ['object'],
  components: {
    ObjectImage
  },
  methods: {
    badgeImage(badge) {
      switch (badge.key) {
        case "clothing":  return require("../assets/badges/clothing.svg");
        case "food":      return require("../assets/badges/food.svg");
        case "tool":      return require("../assets/badges/tool.svg");
        case "container": return require("../assets/badges/container.svg");
        case "heat":      return require("../assets/badges/heat.svg");
        case "water":     return require("../assets/badges/water.svg");
        case "natural":   return require("../assets/badges/natural.svg");
        default:          throw `Unknown badge key: ${badge.key}`;
      }
    },
    badgeText(badge) {
      switch (badge.key) {
        case "clothing":  return `${badge.value} insulation`;
        case "food":      return this.foodBadgeText(badge.value);
        case "tool":      return `Tool with ${badge.value || "infinite"} uses`;
        case "container": return `Holds ${badge.value} items`;
        case "heat":      return `Emits ${badge.value} heat`;
        case "water":     return `${badge.value} water uses`;
        case "natural":   return "Spawns naturally";
        default:          throw `Unknown badge key: ${badge.key}`;
      }
    },
    foodBadgeText(value) {
      const parts = value.toString().split(" x ");
      parts[0] += " food value";
      if (parts[1])
        parts[1] += " uses";
      return parts.join(", ");
    }
  }
}
</script>

<style scoped>
  .objectView {
    height: 200px;

    position: relative;
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
    margin-bottom: 8px;
  }

  a.nostyle:link {
    text-decoration: inherit;
    color: inherit;
  }

  a.nostyle:visited {
    text-decoration: inherit;
    color: inherit;
  }

  .objectView .badges {
    position: absolute;
    right: 16px;
    bottom: 12px;
    display: flex;
  }

  .objectView .badge {
    margin-left: 16px;
    font-size: 15px;
  }

  .objectView .badge img {
    vertical-align: -2px;
  }

  .objectView .badgeValue {
    margin-left: 3px;
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
