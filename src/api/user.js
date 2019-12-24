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
services.deleteUser = function(params) {
  return request({
    url: '/user/delete',
    method: 'post',
    data: params
  })
}
// 添加用户
services.addUser = function(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data: {data:data}
  })
}

// 修改用户
services.editUser = function(params) {
  return request({
    url: '/user/eidt',
    method: 'post',
    data: params
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