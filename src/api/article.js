import request from '@/utils/request'
let services = {}
// 获取用户列表
services.getList = function(params) {
  return request({
    url: '/article',
    method: 'get',
    params: params
  })
}
services.getNewsById = function(id) {
  return request({
    url: '/article/getNewsById',
    method: 'get',
    params: {id}
  })
}
// 修改资源
services.updateArticle = function(form) {
  return request({
    url: '/article/update',
    method: 'post',
    data: { form }
  })
}
// 增加资源
services.addArticle = function(form) {
  return request({
    url: '/article/add',
    method: 'post',
    data: { form }
  })
}

export default services