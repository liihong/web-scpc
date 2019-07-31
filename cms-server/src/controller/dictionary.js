const Base = require('./base.js');
let sjzdModel = 'system_dictionaries'
module.exports = class extends Base {
    // 获取资源列表
    async indexAction() {
        let data = await this.model(sjzdModel).select()
        return this.success(data)
    }
    async getSjzdByTypeAction() {
        let data = await this.model(sjzdModel).where({type: this.get('type')}).select()
        return this.success(data)
    }
    // 新增资源
    async addSJZDAction() {
        let resource = this.post('form')
        let id = util.getUUId()
        resource.id = id
        console.log(resource)
        
        try {
            let result = await this.model(sjzdModel).add(resource);
            return this.success(result);
        } catch (ex) {
            return this.fail(ex)
        }
    }

    async updateSJZDAction() {
        let resource = this.post('form')
        console.log(resource)
    }
};