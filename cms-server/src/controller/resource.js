const Base = require('./base.js');
const util = require('../../utils/util')
module.exports = class extends Base {
    async indexAction() {
        let data = await this.model('cms_resource').select()
        return this.success(data)
    }

    async getTreeListAction() {
        let data = await this.model('cms_resource').select()
        
        return this.success(data)
    }

    async getResByRoleIdAction() {
        let id = this.get('id')
        let data = await this.model('cms_role_resource').field('resId').where({roleId: id}).select()

        return this.success(data)
    }

    async saveRoleResAction(){
        let roleId = this.post('roleId')
        let res = this.post('res')
        let arr = []
        res.map(item=>{
            arr.push({
                id: util.getUUId(),
                resId: item,
                roleId: roleId
            })
        })

        let deleteData = await this.model('cms_role_resource').where({roleId: roleId}).delete()

        let addRes = await this.model('cms_role_resource').addMany(arr)

        return this.success(addRes)
    }
};