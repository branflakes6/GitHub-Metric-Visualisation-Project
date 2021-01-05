import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Chartkick from 'vue-chartkick'
import Chart from 'chart.js'

Vue.use(Chartkick.use(Chart))

Vue.config.productionTip = false
console.log(Vue.version);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
