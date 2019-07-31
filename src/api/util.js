import request from '@/utils/request'
let services = {}
// 获取用户列表
services.uploadFile = function(file) {
  return request({
    url: '/util/upload',
    method: 'post',
    params: file
  })
}

export default services