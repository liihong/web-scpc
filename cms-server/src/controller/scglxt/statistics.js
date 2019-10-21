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

    // 根据时间范围返回工人工时统计
    async getPeopleHourAction(){
        let time = this.post('date')
        let sql = `SELECT any_value(gygc.id) id,
        any_value(gygc.ssdd) ssdd, any_value(xmname) ddmc, any_value(bomid) bomid,
        any_value(zddmc) bommc, any_value(gynr) gynr,any_value(jgsl) jgsl,
        any_value(czryid) czryid, any_value(ry.rymc) rymc, sum( gygc.edgs ) edgs
    FROM scglxt_t_gygc gygc, scglxt_t_dd dd, scglxt_t_bom bom, scglxt_t_ry ry 
    WHERE
        gygc.ssdd = dd.id  AND gygc.bomid = bom.id 
        AND gygc.czryid = ry.id  AND STATUS = 2  AND jssj BETWEEN "`+time.split(' ')[0]+` 00:00:00" 
        AND "`+time.split(' ')[1]+`  23:59:59"    GROUP BY  edgs`
        
        let data = await this.model().query(sql)

        data.map(item=>{
            item[item.rymc] = item.edgs
        })
        return this.success(data)
    }
    // 获取车间总工时排产
    async getGygsPcAction() {
        let sql = `SELECT gynr,gy.gymc,sum(zbgs+bzgs)/60 zgs FROM scglxt_t_gygc gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id AND bomid IN (
            SELECT id FROM scglxt_t_bom bom WHERE zddzt IN ('0501','0502')) GROUP BY gynr`

        let data = await this.model().query(sql)

        return this.success(data)
    }

    // 获取订单动态剩余工时
    async getDDWorkSpeedAction() {
        let sql = `  select dd.id,dd.xmname,dd.starttime,dd.endtime,dd.remark,
        fun_yjggs_gy(id,'201609010949574021') 'xqg',
        fun_yjggs_gy(id,'201609010949574022') 'xi',
        fun_yjggs_gy(id,'201609010949574025') 'qian',
        fun_yjggs_gy(id,'201609010949574023') 'zhusu',
        fun_yjggs_gy(id,'201609010949574024') 'che',
        fun_yjggs_gy(id,'201609010949574026') 'cnc',
       fun_yjggs_gy(id,'201609010949574027') 'dhh',
          fun_yjggs_gy(id,'201609010949574028')  'mo',
           fun_yjggs_gy(id,'20170424203552800')   'rechuli',
           fun_yjggs_gy(id,'20170724160856037')  'hanjie',
           fun_yjggs_gy(id,'20170524144646657') 'waixie'
    FROM  scglxt_t_dd dd where  dd.ckzt is null order by ddlevel`

        let data = await this.model().query(sql)

        return this.success(data)
    }
};