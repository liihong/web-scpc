import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
import {
  Message
} from 'element-ui'
import {
  getToken
} from '@/utils/auth' // 验权
import format from '@/utils/format'

const whiteList = ['/login'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({
        path: '/'
      })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          let role = res.data.roles
          if (role && role.length > 0) { // 如果有角色权限，则去读取该角色的权限并动态增加到router中渲染出菜单来
            store.dispatch('GetMenu', {
              token: role[0]
            }).then((menu) => {
              let roles = format.menuRouterData(menu.data)
              router.options.routes = router.options.routes.concat(roles)
              router.addRoutes(roles)
              next({ ...to})
            })
          } else {
            next({
              path: '/login'
            })
          }
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({
              path: '/'
            })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})