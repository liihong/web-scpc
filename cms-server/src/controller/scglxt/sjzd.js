
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

    // 获取班组列表
    async getBzListAction() {
        let data = await this.model('scglxt_t_bz').select()
        return this.success(data)
    }

    //获取某一个班组下所有的人员信息
    async getPeopleByBzAction() {
        let bzid = this.post('bzid')

        let data = await this.model('scglxt_t_ry').where({ssbz: bzid}).select()

        return this.success(data)
    }

    // 获取设备类型列表数据
    async getSBLXListAction(){
        let data = await this.model('scglxt_t_sblx').join({
            table: 'scglxt_t_jggy',
            join: 'left',
            on: ['ssgy', 'id']}).field("t.id,mc,ssgy,scglxt_t_jggy.gymc,bzcn").alias('t').order('ssgy').select()

        return this.success(data)
    }
};