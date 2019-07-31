/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let gyModel = 'scglxt_t_gygc'
import util from '../../../utils/util'

module.exports = class extends Base {
    async getJggyListAction() {
        let data = await this.model('scglxt_t_jggy').select()
        return this.success(data)
    }
    // 获取某一个BOM的工艺
    async getJggxByBOMIdAction() {
        let data = await this.model(gyModel).join({
            table: 'scglxt_t_sblx',
            as: 'sblx',
            join: 'left',
            on: ['sbid', 'id']
        }).join({
            table: 'scglxt_t_jggy',
            as: 'jggy',
            join: 'left',
            on: ['gynr', 'id']
        }).order('serial asc').field('scglxt_t_gygc.* ,jggy.gymc, sblx.mc sbmc').where({
            'bomid': this.get('bomid')
        }).select()
        return this.success(data)
    }


    /**
     * 保存工艺
     * 1.删除原有bom工艺 2.保存新增的工艺 3.修改bom中显示的工艺内容 4.更新DD的工时
     * @returns 
     */
    async saveGygxInfoAction() {
        let form = this.post('form')
        let ssdd = this.post('ssdd')
        let rows = await this.model(gyModel).where({
            bomid: form[0].bomid
        }).select();
        try {
            let affectedRows = await this.model(gyModel).where({
                bomid: form[0].bomid
            }).delete();
            let gynr = [],
                gs = 0
            let data = await this.model(gyModel).addMany(form, {
                pk: 'ID'
            });
            form.forEach(item => {
                gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
                gs += parseInt(item.zbgs + item.bzgs);
            })
            //修改bom显示的工艺内容

            await this.model('scglxt_t_bom').where({
                id: form[0].bomid
            }).update({
                gxnr: gynr.join('-'),
                gs: gs
            });

            // 更新订单总工时
            let zgs = await this.model('scglxt_t_bom').where({
                ssdd: ssdd
            }).sum('gs');

            await this.model('scglxt_t_dd').where({
                id: ssdd
            }).update({
                zgs: zgs
            });

            return this.success(data)
        } catch (ex) {
            // 如果上面流程执行失败，则恢复原有数据
            await this.model(gyModel).addMany(rows, {
                pk: 'ID'
            });
            return this.fail(ex)
        }

    }

    //获取设备类型
    async getSblxListAction() {
        let data = await this.model('scglxt_t_sblx').select()
        return this.success(data)
    }

    async getSbListAction() {
        let data = await this.model('scglxt_t_sb').select()
        return this.success(data)
    }

    //工作人员开始工作
    //1.更新工序操作人员 2.新增操作记录 3.如果是第一条工序讲BOM改为进行中状态
    async beginWorkAction() {
        let worker = this.post('worker')
        let gyid = this.post('gyid')
        let gyData = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).find()

        let upData = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).update({
            czryid: worker
        })
        if (gyData.serial == 0) {
            let updateData = await this.model('scglxt_t_bom').where({
                id: gyData.bomid
            }).update({
                zddzt: '0502'
            })
        }

        let jgjlData = {
            id: util.getUUId(),
            jgryid: worker,
            jgkssj: util.getNowTime(),
            gygcid: gyid
        }

        let data = await this.model('scglxt_t_jggl').add(jgjlData)

        return this.success(data)
    }

    //结束加工
    // 1.更新工序已加工件数，更新使用设备，2.更新操作记录表 3.更新送检件数
    async overWorkAction() {
        let {
            worker,
            gyid,
            sbid,
            jgjs
        } = this.post()

        let jgjlData = {
            jgjssj: util.getNowTime(),
            jgjs: jgjs,
            sbid: sbid
        }
        let updateData = await this.model('scglxt_t_jggl').where({
            gygcid: gyid,
            jgryid: worker
        }).update(jgjlData)

        let bomData = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).update({
            sjjs: jgjs,
            czryid: ''
        })

        return this.success(bomData)
    }

    //获取检验人员检验列表数据
    async getCheckListAction() {
        let sql = `SELECT jggl.id, dd.xmname ddmc,
        bom.zddmc BOMID, bom.zddjb, bom.bmcl, tz.tzlx, tz.url tzurl, jggy.gymc GYNR,
        ry.rymc CZRY,jggl.jgryid, sb.sbmc SBID, jggl.jgjs SJJS, gygc.bomid,gygc.id gygcid, date_format( dd.endtime, '%Y-%m-%d' ) ddjssj,
        gygc.serial 
    FROM
        scglxt_t_gygc gygc,
        scglxt_t_bom bom
        LEFT JOIN scglxt_t_dd_tz tz ON bom.ddtz LIKE CONCAT( tz.tzmc, "%" ),
        scglxt_t_jggy jggy,
        scglxt_t_jggl jggl
        LEFT JOIN scglxt_t_sb sb ON sb.id = jggl.sbid,
        scglxt_t_ry ry,
        scglxt_t_dd dd 
    WHERE
        bom.ssdd = dd.id 
        AND gygc.bomid = bom.id 
        AND jggy.id = gygc.gynr 
        AND jggl.gygcid = gygc.id 
        AND ry.id = jggl.jgryid 
        AND jggl.sfjy = '0' 
        AND jggl.jgjs IS NOT NULL 
    ORDER BY
        jgkssj`

        let data = await this.model().query(sql) 

        return this.success(data)
    }

    //质检全部通过
    //如果是最后一道工序则更新BOM的状态
    async gygxCheckPassAllAction(){
        let {id, gygcid, jgryid, jyryid} = this.post()
        
        let updateJggl = {
            jysj: util.getNowTime(),
            sfjy: '1',
            jyryid: jyryid,
            bfjs: 0,
            fgjs: 0
        }

        await this.model('scglxt_t_jggl').where({jyryid: jyryid, gygcid: gygcid}).update(updateJggl)
        let jgglData = await this.model('scglxt_t_jggl').where({id}).find()
        console.log(jgglData)
        // let gygcData = {
        //     yjgjs: jgglData.yjgjs,
        //     bfjs: 0,
        //     fgjs: 0
        // }
    }
};