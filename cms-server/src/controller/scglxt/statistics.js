/**
 * 首页统计需要的接口
 */
const Base = require('../base.js');
let ddModel = 'scglxt_t_dd'
module.exports = class extends Base {
    async indexAction() {
        let data = {
            ddTotal: 0,
            ddNoStart: 0,
            ddIsFinish: 0,
            ddInProcess: 0,
            bomTotal: 0,
            bomNoStart: 0,
            bomIsFinish: 0,
            bomInProcess: 0,
            peopleTotal: 0

        }
        data.ddTotal = await this.model(ddModel).count()
        data.ddIsFinish = await this.model(ddModel).where({
            'ckzt': '完成'
        }).count()
        data.ddNoStart = await this.model(ddModel).where({
            'ckzt': null
        }).count()
        data.bomNoStart = await this.model('scglxt_t_bom').where({
            'zddzt': ['=','0501']
        }).count()
        data.bomInProcess = await this.model('scglxt_t_bom').where({
            'zddzt': ['in','0502,0503,0504']
        }).count()
        data.bomIsFinish = await this.model('scglxt_t_bom').where({
            'zddzt': ['=','0506']
        }).count()
        data.bomTotal = await this.model('scglxt_t_bom').count()
        data.peopleTotal = await this.model('scglxt_t_ry').count()
        return this.success(data)
    }
};