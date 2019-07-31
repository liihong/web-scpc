import request from '@/utils/request'
let services = {}
// 获取主页菜单列表
services.getIndexMenuList = function() {
  return request({
    url: '/pageMenu',
    method: 'get'
  })
}
// 删除用户
services.deleteIndexMenu = function(token) {
  return request({
    url: '/pageMenu/delete',
    method: 'get',
    params: { token }
  })
}
// 添加用户
services.addIndexMneu = function(token) {
  return request({
    url: '/pageMenu/add',
    method: 'post',
    params: { token }
  })
}

export default services