const Base = require('../base.js');
const util = require('../../../utils/util')
let userModel = 'cms_user'
module.exports = class extends Base {
    
    // 任务列表
    async getTaskListAction() {
        try {
            
        } catch (ex) {
            return this.fail(ex)
        }
    }
    // 任务详情
    async getTaskDetailAction() {
        try {
            let gygcId = this.get('id')
            let bomId = this.get('bomId')
            let gygcData = await this.model('scglxt_t_gygc').where({bomid: bomId}).order('serial').select()

            return this.success(gygcData)
        } catch (ex) {
            return this.fail(ex)
        }
    }
};