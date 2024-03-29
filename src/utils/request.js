import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://152.136.159.195:8360',
  // baseURL: 'http://127.0.0.1:8360',
  // timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.errno !== 0) {
      Message({
        message: res.errmsg,
        type: 'error',
        duration: 5 * 1000
      })

      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      if (res.errno === 50008 || res.errno === 50012 || res.errno === 50014) {
        MessageBox.confirm(
          '你已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
      }
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: '操作失败，请联系管理员',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

service.get = function get(url, param) {
  return new Promise((resolve, reject) => {
    service({
      method: 'get',
      url,
      params: param
    }).then(res => {
        resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

service.post = function post(url, param) {
  return new Promise((resolve, reject) => {
    service({
      method: 'post',
      url,
      data: param
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}
service.getBolb = function(url, param) {
  return new Promise((resolve, reject) => {
    return axios({
      url: url,
      method: 'GET',
      params: param,
      responseType: 'blob',
      headers:{
        token: getToken()
      }
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}
service.postBolb = function(url, param) {
  return new Promise((resolve, reject) => {
    return axios({
      url: url,
      method: 'POST',
      params: param,
      headers:{
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}
export default service
