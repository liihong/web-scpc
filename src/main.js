import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import '@/styles/element-ui.scss'
import '@/styles/index.scss' // global css
import '@/styles/reset.css' // global cs

import message from '@/utils/message'
import * as util from '@/utils'

import '@/icons' // icon
import '@/permission' // permission control
import api from '@/api/index'
import ajax from '@/utils/request'
// 国际化
import VueI18n from 'vue-i18n'
// 引用三种语言
import zhCN from './lang/zh'
import en from './lang/en'

import VueSocketio from 'vue-socket.io';

Vue.use(new VueSocketio({
  debug: true,
  connection: 'http://127.0.0.1:8360' //地址+端口，由后端提供
}));
// eslint-disable-next-line
Vue.prototype.$socket = io.connect('http://localhost:8360')
Vue.use(VueI18n)
Vue.use(ElementUI, { size: 'mini' });
Vue.config.productionTip = false

// 注册公共组件
import ResList from './views/resMgr/ResList.vue'
Vue.component('ResList',ResList)
import ResEdit from './views/resMgr/ResEdit.vue'
Vue.component('ResEdit',ResEdit)

Vue.prototype.$api = api
Vue.prototype.$ajax = ajax
Vue.prototype.$message = message
Vue.prototype.$util = util

const i18n = new VueI18n({
  locale: 'zh',  // 语言标识
  messages: {
      'zh': zhCN,
      'en': en
  }
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
