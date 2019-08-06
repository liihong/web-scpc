import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      meta: { title: '工作台', icon: 'component' },
      component: () => import('@/views/dashboard/index')
    }
    ,{
      path: '/resMgr/resEdit',
      name: 'resEdit',
      meta: { title: '新增资源', icon: 'component' },
      component: () => import('@/views/resMgr/ResEdit.vue')
    },
    {
      path: '/bjd',
      name: 'bjd',
      meta: { title: '报价单', icon: 'component' },
      component: () => import('@/views/scglxt/xsgl/components/bjdList.vue')
    }
  ]
  },
  // { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
