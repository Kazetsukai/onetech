import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Tippy from 'vue-tippy'
import './css/tippy.css'

Vue.use(Tippy, {
  animateFill: false,
  animation: 'scale',
  duration: 100,
  distance: 3,
  hideOnClick: false
});

let v = new Vue({
  el: '#app',
  render: h => h(App)
});
