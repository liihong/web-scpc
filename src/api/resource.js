import request from '@/utils/request'
let services = {}
// 获取资源树型数据
services.getTreeList = function() {
  return request({
    url: '/resource/getTreeList',
    method: 'get'
  })
}
services.getResByRoleId = function(form) {
  return request({
    url: '/resource/getResByRoleId',
    method: 'get',
    params: form 
  })
}

services.saveRoleRes = function(form) {
  return request.post('/resource/saveRoleRes',form)
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