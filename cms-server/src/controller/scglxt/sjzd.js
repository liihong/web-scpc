
/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let sjzdModel = 'scglxt_tyzd'
module.exports = class extends Base {
    
    // 获取某一个BOM的工艺
    async getSjzdByIdAction(){
        let data = await this.model(sjzdModel).order('xh asc').where({'id': ['like', `${this.get('id')}%`]}).select()
        return this.success(data)
    }

    async getBzListAction() {
        let data = await this.model('scglxt_t_bz').select()
        return this.success(data)
    }

    async getPeopleByBzAction() {
        let bzid = this.post('bzid')

        let data = await this.model('scglxt_t_ry').where({ssbz: bzid}).select()

        return this.success(data)
    }
};