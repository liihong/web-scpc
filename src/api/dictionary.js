import request from '@/utils/request'
let services = {}
// 获取用户列表
services.getList = function() {
  return request({
    url: '/dictionary',
    method: 'get'
  })
}
// 修改资源
services.getSjzdByType = function(type) {
  return request({
    url: '/dictionary/getSjzdByType',
    method: 'get',
    params: { type }
  })
}
// 增加资源
services.addArticle = function(form) {
  return request({
    url: '/dictionary/add',
    method: 'post',
    data: { form }
  })
}

export default services