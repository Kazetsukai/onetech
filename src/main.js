import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
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

Vue.use(VueRouter);
Vue.use(VueMeta);

const router = new VueRouter({
  mode: 'history',
  routes: App.routes,
  scrollBehavior (to, from, savedPosition) {
    return savedPosition || {x: 0, y: 0};
  }
});

let v = new Vue({
  router: router,
  el: '#app',
  render: h => h(App)
});
