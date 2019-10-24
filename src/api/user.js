import request from '@/utils/request'
let services = {}
// 获取用户列表
services.getUserList = function() {
  return request({
    url: '/user',
    method: 'get'
  })
}
// 删除用户
services.deleteUser = function(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}
// 添加用户
services.addUser = function(token) {
  return request({
    url: '/user/logout',
    method: 'post',
    params: { token }
  })
}

  // 修改密码
services.updatePwd = function(params) {
  return request({
    url: '/user/updatePwd',
    method: 'post',
    params:  params
  })
}

export default services