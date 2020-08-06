import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
Vue.prototype.$http = axios

// 配置请求的根路径
axios.defaults.baseURL = 'http://193.112.208.128:8888/api/private/v1/'
// 设置拦截器 .request是请求的拦截器  通过函数挂载一个回调函数  config是一个请求对象
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config  固定写法
  return config
})
Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
