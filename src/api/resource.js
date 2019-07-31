import request from '@/utils/request'
let services = {}
// 获取用户列表
services.getList = function() {
  return request({
    url: '/resource',
    method: 'get'
  })
}
// 修改资源
services.updateRes = function(form) {
  return request({
    url: '/resource/updateResource',
    method: 'post',
    params: { form }
  })
}
// 删除资源
services.addRes = function(form) {
  return request({
    url: '/resource/addResource',
    method: 'post',
    params: { form }
  })
}

export default services