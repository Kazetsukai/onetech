import Vue from 'vue'
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

Vue.mixin({
	methods: {
		urlTo: (object, techTree) => {
			if (!object) return '#';

			return '#' + 
				   object.id + 
				   '/' + 
				   encodeURIComponent(object.name.split(' ').join('-')) +
				   (techTree ? '/tech-tree' : '');
		},
		navigateTo: (object, techTree) => {
			window.location = v.urlTo(object, techTree);
		}
	}
})

let v = new Vue({
  el: '#app',
  render: h => h(App)
});