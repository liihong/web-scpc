import { login, logout, getMenu, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    fzgy: '',
    isfzr: '',
    component: null,
    roles: [],
    roleNames: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_FZGY: (state, fzgy) => {
      state.fzgy = fzgy
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ROLENAMES: (state, names) =>{
      state.roleNames = names
    },
    SET_ROUTERS: (state, routers) => {
      state.routers = routers
    },
    SET_ISFZR: (state, data) => {
      state.isfzr = data
    },
    SET_COMPONET: (state, data) => {
      state.component = data
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data.token)
          sessionStorage.setItem('user',JSON.stringify(data))
          commit('SET_TOKEN', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          const data = response.data
          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
            commit('SET_FZGY', data.fzgy)
            commit('SET_ROLENAMES', data.rolesNames)
            commit('SET_ISFZR', data.isfzr)
            commit('SET_COMPONET', data.component)
            
          } else {
            reject('获取权限信息有误!')
          }
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.photo)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    GetMenu({ commit, state }) {
      return new Promise((resolve, reject) => {
        getMenu(state.roles[0]).then(response => {
          commit('SET_ROUTERS', response.data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
