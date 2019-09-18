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
            'zddzt': ['=', '0501']
        }).count()
        data.bomInProcess = await this.model('scglxt_t_bom').where({
            'zddzt': ['in', '0502,0503,0504']
        }).count()
        data.bomIsFinish = await this.model('scglxt_t_bom').where({
            'zddzt': ['=', '0506']
        }).count()
        data.bomTotal = await this.model('scglxt_t_bom').count()
        data.peopleTotal = await this.model('scglxt_t_ry').count()
        return this.success(data)
    }
    // 获取设备类型排产
    async getSblxPcAction() {
        let sql = `SELECT sblx.id,sblx.mc k,ssgy,DATE_FORMAT(TIMESTAMPADD(DAY,ROUND(zgs/bzcn,2),NOW()),'%Y-%m-%d') v,fzbz,ROUND(zgs/bzcn,2) t FROM scglxt_t_sblx sblx,scglxt_t_jggy gy,v_scglxt_pc_sblx t WHERE sblx.ssgy=gy.id AND sblx.id=t.sbid`
        let data = await this.model().query(sql)

        return this.success(data)
    }

    // 获取工艺工序排产
    async getGygxPcAction() {
        let sql = `SELECT gy.id,gy.gymc k,ssgy,fzbz,DATE_FORMAT(TIMESTAMPADD(DAY,ROUND(any_value (zgs)/any_value (bzcn),2),NOW()),'%Y-%m-%d') v,SUM(ROUND(any_value (zgs)/any_value (bzcn),2)) t FROM scglxt_t_sblx sblx,scglxt_t_jggy gy,v_scglxt_pc_gygx t WHERE sblx.ssgy=gy.id AND gy.id=t.gynr GROUP BY gy.id`
        let data = await this.model().query(sql)

        return this.success(data)
    }

    // 获取车间总工时排产
    async getGygsPcAction() {
        let sql = `SELECT gynr,gy.gymc,sum(zbgs+bzgs)/60 zgs FROM scglxt_t_gygc gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id AND bomid IN (
            SELECT id FROM scglxt_t_bom bom WHERE zddzt IN ('0501','0502')) GROUP BY gynr`

        let data = await this.model().query(sql)

        return this.success(data)
    }
};