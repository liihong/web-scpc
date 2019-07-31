import request from '@/utils/request'

// 登录
export function login(username, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}
// 获取登录用户详细信息
export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}
// 登出
export function logout(token) {
  return request({
    url: '/user/logout',
    method: 'post',
    params: { token }
  })
}
// 获取菜单
export function getMenu(token) {
  return request({
    url: '/user/menu',
    method: 'get',
    params: { token }
  })
}