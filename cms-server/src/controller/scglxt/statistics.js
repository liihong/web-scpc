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

        let bomSql =`SELECT bom.id,ssdd,dd.xmname ddmc,bom.jgsl,zddmc bommc FROM scglxt_t_bom bom,scglxt_t_dd dd WHERE  bom.ssdd=dd.id and bom.id IN (
            SELECT bomid FROM scglxt_t_gygc WHERE STATUS=2 AND jssj BETWEEN "`+time.split(' ')[0]+` 00:00:00" AND "`+time.split(' ')[1]+`  23:59:59") order by bom.endtime`

        let bomData  = await this.model().query(bomSql)
        let sql = `SELECT any_value(gygc.id) id,
        any_value(gygc.ssdd) ssdd, any_value(xmname) ddmc, any_value(bomid) bomid,
        any_value(zddmc) bommc, any_value(gynr) gynr,any_value(jgsl) jgsl,
        any_value(czryid) czryid, any_value(ry.rymc) rymc, (gygc.edgs*jgsl) edgs
    FROM scglxt_t_gygc gygc, scglxt_t_dd dd, scglxt_t_bom bom, scglxt_t_ry ry 
    WHERE
        gygc.ssdd = dd.id  AND gygc.bomid = bom.id 
        AND gygc.czryid = ry.id  AND STATUS = 2  AND jssj BETWEEN "`+time.split(' ')[0]+` 00:00:00" 
        AND "`+time.split(' ')[1]+`  23:59:59"   order by ddmc,bomid`
        
        let data = await this.model().query(sql)

        bomData.map(item=>{
            data.map(el=>{
                if(item.id == el.bomid){
                    item[el.rymc] = el.edgs
                }
            })
        })
        return this.success(bomData)
    }
    // 获取车间总工时排产
    async getGygsPcAction() {
        // let sql = `SELECT gynr,gy.gymc,sum(zbgs+bzgs)/60 zgs FROM scglxt_t_gygc gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id AND bomid IN (
        //     SELECT id FROM scglxt_t_bom bom WHERE zddzt IN ('0501','0502')) GROUP BY gynr`

        let sql=`SELECT gynr,gy.gymc,TRUNCATE(zgs/60,2) zgs from v_scglxt_pc_gygx gc,scglxt_t_jggy gy WHERE gc.gynr=gy.id`
        
        let data = await this.model().query(sql)

        return this.success(data)
    }

    // 获取订单动态剩余工时
    async getDDWorkSpeedAction() {
        let query = this.post()
        let whereObj = '1=1'
        if(query.xmname && query.xmname != ''){
            whereObj = `1=1 and dd.xmname like '%`+query.xmname+`%'`
        }
        if(query.ddid && query.ddid != ''){
            whereObj = `1=1 and dd.id='`+query.ddid+`'`
        }
        let sql = `  
        SELECT
            dd.id,
            dd.xmname,
            dd.starttime,
            dd.endtime,
            dd.remark,
            dd.mark,
             MAX(CASE gynr WHEN '201609010949574021' THEN sygs ELSE 0 END ) 'xqg',
             MAX(CASE gynr WHEN '201609010949574022' THEN sygs ELSE 0 END ) 'xi',
            MAX(CASE gynr WHEN '201609010949574025' THEN sygs ELSE 0 END ) 'qian',
            MAX(CASE gynr WHEN '201609010949574023' THEN sygs ELSE 0 END ) 'zhusu',
            MAX(CASE gynr WHEN '201609010949574024' THEN sygs ELSE 0 END ) 'che',
            MAX(CASE gynr WHEN '201609010949574026' THEN sygs ELSE 0 END ) 'cnc',
            MAX(CASE gynr WHEN '201609010949574027' THEN sygs ELSE 0 END ) 'dhh',
            MAX(CASE gynr WHEN '201609010949574028' THEN sygs ELSE 0 END ) 'mo',
            MAX(CASE gynr WHEN '20170424203552800'  THEN sygs ELSE 0 END ) 'rechuli',
            MAX(CASE gynr WHEN '20170724160856037'  THEN sygs ELSE 0 END ) 'hanjie',
            MAX(CASE gynr WHEN '20170524144646657'  THEN sygs ELSE 0 END ) 'waixie' ,
            sum(sygs) sygs
        FROM
            scglxt_t_dd dd ,v_scglxt_sygs sygs where sygs<>0 and dd.id =sygs.ddid and dd.ckzt is null and `+whereObj+` group by ddid`

        let data = await this.model().query(sql)

        return this.success(data)
    }
};