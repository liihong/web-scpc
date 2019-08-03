/**
 * Bom卡操作的接口
 */
const Base = require('../base.js');
let bomModel = 'scglxt_t_bom'
import util from '../../../utils/util'

module.exports = class extends Base {
    async indexAction() {
        let data = await this.model(bomModel).select()
        return this.success(data)
    }
    /**
     * 保存工艺
     * 1.删除原有bom工艺 2.保存新增的工艺 3.修改bom中显示的工艺内容 4.更新第一条记录到备料信息
     * @returns 
     */
    async saveGygxInfoAction() {
        let form = this.post('form')
        let affectedRows = await this.model(gyModel).where({
            bomid: form[0].bomid
        }).delete();
        let data = await this.model(gyModel).addMany(form, {
            pk: 'ID'
        });
        return this.success(data)
    }

    //获取设备类型
    async getSblxListAction() {
        let data = await this.model('scglxt_t_sblx').select()
        return this.success(data)
    }

    // 新增BOM
    async addBomAction() {
        let form = this.post('form')
        //将订单级别取过来更新到BOM中
        let zddjb = await this.model('scglxt_t_dd').where({
            id: form.ssdd
        }).getField('ddlevel', true)
        form.zddjb = zddjb
        let data = await this.model(bomModel).add(form)

        // let zj = this.post('zj')

        // let bzjData = await this.model('scglxt_t_bom_zj').addMany(zj,{pk: 'ID'});


        return this.success(data)
    }
    //根据报价单批量增加BOM数据
    async addBomManyAction() {
        let form = this.post('form')
        let ssdd = this.post('ssdd')
        const vm = this
        let pArr = []
        let zddjb = await this.model('scglxt_t_dd').where({
            id: ssdd
        }).getField('ddlevel', true)
        for (let i = 0; i < form.length; i++) {
            form[i].zddjb = zddjb
            pArr.push(vm.getData(form[i]))
        }
        let data = {}
        Promise.all(pArr).then(async () => {
            data = await this.model(bomModel).addMany(form, {
                pk: 'ID'
            });
        })
        return vm.success(data)
    }
    getData(item) {
        const vm = this
        return new Promise(async resolve => {
            let cz = await vm.model('scglxt_t_cl').where({
                clmc: item.zddcz
            }).getField('id')
            item.zddcz = cz[0]
            resolve()
        })
    }
    // 编辑BOM
    async editBomAction() {
        let form = this.post('form')
        let primaryKey = this.post('primaryKey')
        let data = await this.model(bomModel).where(primaryKey).update(form)

        return this.success(data)
    }

    //复制BOM
    async copyBomAction() {
        let form = this.post('form')
        let primaryKey = this.post('primaryKey')

        let zddjb = await this.model('scglxt_t_dd').where({
            id: form.ssdd
        }).getField('ddlevel', true)
        form.zddjb = zddjb
        form.zddzt = '0501'
        form.clzt = '0'
        form.id = util.getUUId()

        let data = await this.model(bomModel).add(form)

        let gyList = await this.model('scglxt_t_gygc').where({
            bomid: primaryKey.id
        }).select()
        if (gyList.length > 0) {
            gyList.map(item => {
                item.id = util.getUUId()
                item.bomid = form.id
                return item
            })

            let addgy = await this.model('scglxt_t_gygc').addMany(gyList, {
                pk: 'ID'
            });
        }
        return this.success(data)
    }
    // 根据bomId获取相关组件
    async getZjByBomIdAction() {
        let bomid = this.get('bomid')
        let data = await this.model('scglxt_t_bom_zj').where({
            bomid: bomid
        }).select()

        return this.success(data)
    }
    // 获取需要备料的数据列表
    async getBLlistAction() {
        let clid = this.get('clid')
        // let cldata = await this.model().query("select ID,'' SSDD,'' SSDD_TEXT,ID ZDDCZ,CLMC ZDDCZ_TEXT,'' ZDDMC,'' ZDDJB from scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')")
        // let cldata = await this.model().query("select ID,CLMC,CLDJ,CLSL,MI CLMD from  scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')")
        let blList = await this.model().query("SELECT BLJS,CLDX,CLJE,CLTJ,CLZL,ID,JGSL,SSDD,(SELECT NAME FROM (SELECT id,xmname NAME FROM scglxt_t_dd) tras WHERE tras.id=SSDD) SSDD_TEXT,ZDDCZ,(SELECT NAME FROM (SELECT id,clmc NAME FROM scglxt_t_cl) tras WHERE tras.id=ZDDCZ) ZDDCZ_TEXT,ZDDMC,CKSJ,CLZT,ZDDJB FROM `SCGLXT_T_BOM` WHERE ( (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='' ) And ssdd= '" + clid + "' ORDER BY zddcz,zddjb ")
        // cldata.map(item=>{
        //     let children = []
        //     blList.map(el=>{
        //         if(item.ID == el.ZDDCZ){
        //             children.push(el)
        //         }
        //     })
        //     item.children = children
        //     return item
        // })

        return this.success(blList)
    }
    // 修改备料状态，备料成功后更新第一条工艺为可加工状态
    async updateBLZTAction() {
        let {
            id,
            clzt
        } = this.post()
        let data = await this.model(bomModel).where({
            id: ['in', id]
        }).update({
            clzt: clzt,
            bljssj: util.getNowTime()
        })
        let updateSql = `UPDATE scglxt_t_gygc gygc SET kjgjs= (SELECT bom.jgsl FROM  scglxt_t_bom bom  WHERE  bom.id = gygc.bomid)
        WHERE gygc.bomid = '` + id + `' AND gygc.serial = '0'`

        //如果是同时更新多条
        if (id.indexOf(',') != '-1') {
            let arrs = id.split(',')
            arrs.map(async item => {
                updateSql = `UPDATE scglxt_t_gygc gygc SET kjgjs= (SELECT bom.jgsl FROM  scglxt_t_bom bom  WHERE  bom.id = gygc.bomid)
        WHERE gygc.bomid = '` + item + `' AND gygc.serial = '0'`
                await this.model().execute(updateSql)
            })
        } else {
            // let update = await this.model

            await this.model().execute(updateSql)
        }
        return this.success(data)
    }

    // 获取生产情况跟踪数据
    async getGYgslistAction() {
        let ddid = this.post('ddid')

        let sql = `
        select t.*,bom.zddmc,bom.zddcz,jgsl,DATE_FORMAT(starttime,'%Y-%m-%d') starttime,DATE_FORMAT(endtime,'%Y-%m-%d') endtime from (
        SELECT  bomid ,
            sum(CASE gynr WHEN '201609010949574021' THEN (edgs+ ifnull(zbgs,0)) ELSE 0 END ) '线切割',
            sum(CASE gynr WHEN '201609010949574022' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '铣',
            sum(CASE gynr WHEN '201609010949574025' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '钳',
                 sum(CASE gynr WHEN '201609010949574023' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '注塑',
                 sum(CASE gynr WHEN '201609010949574024' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '车',
                  sum(CASE gynr WHEN '201609010949574026' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) 'CNC',
                     sum(CASE gynr WHEN '201609010949574027' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '电火花',
                 sum(CASE gynr WHEN '201609010949574028' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '磨',
                  sum(CASE gynr WHEN '20170424203552800' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '热处理',
                     sum(CASE gynr WHEN '20170724160856037' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '焊接',
                      sum(CASE gynr WHEN '20170524144646657' THEN (edgs+ifnull(zbgs,0)) ELSE 0 END ) '外协'
        FROM scglxt_t_gygc
        GROUP BY bomid) t,scglxt_t_bom bom where t.bomid = bom.id and bom.ssdd=` + ddid

        let data = await this.model().query(sql)
        return this.success(data)
    }

    //BOM单终检通过
    async BOMFinallyCheckAction(){
        let id = this.post('id')

        let data = await this.model(bomModel).where({id: id}).update({
            zddzt: '0504'
        })

        return this.success(data)
    }

    //BOM单入库
    async BOMInStoreAction(){
        let id = this.post('id')

        let data = await this.model(bomModel).where({id: id}).update({
            zddzt: '0505',
            rksj: util.getNowTime()
        })

        return this.success(data)
    }

    //BOM单出库
    async BOMOutStoreAction(){
        let id = this.post('id')

        let data = await this.model(bomModel).where({id: id}).update({
            zddzt: '0506',
            cksj: util.getNowTime()
        })

        let bomData = await this.model(bomModel).where({id: id}).find()


        let allBom = await this.model(bom).where({ssdd: bomData.ssdd,zddzt:['!=', '0506']}).select()
        //如果该订单下所有BOM都完成了就更新订单状态为完成
        if(allBom.length == 0){
            let sql = `update scglxt_t_dd set ckzt='完成',ckdate=DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') where id=(select ssdd from scglxt_t_bom where id='`+id+`')`
            let ddData = await this.model().execute(sql)
        }
       
        return this.success(data)
    }
};