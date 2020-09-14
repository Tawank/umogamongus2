import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  created () {
    const config = {
      apiKey: 'AIzaSyBkPQadhQgPG08OZagaAc57RoFuB8xlSbU',
      authDomain: 'umogamongus2.firebaseapp.com',
      databaseURL: 'https://umogamongus2.firebaseio.com',
      projectId: 'umogamongus2',
      storageBucket: 'umogamongus2.appspot.com',
      messagingSenderId: '1011471486552',
      appId: '1:1011471486552:web:acf2ab890ba21b8f62442d',
      measurementId: 'G-KN3158V5HD'
    }
    firebase.initializeApp(config)
  }
}).$mount('#app')
