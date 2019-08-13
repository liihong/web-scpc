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
        let pageNumber = this.post('pageNumber')
        let pageSize = this.post('pageSize')
        let curPage = (pageNumber - 1) * pageSize
        let sql = `SELECT jggl.id, dd.xmname DDMC,
        bom.zddmc BOMID, bom.zddjb ZDDJB, bom.bmcl BMCL, tz.tzlx, tz.url tzurl, jggy.gymc GYNR,gygc.kjgjs KJGJS,gygc.YJGJS,
        ry.rymc CZRY,jggl.jgryid, sb.sbmc SBID, jggl.jgjs SJJS, gygc.bomid,gygc.id gygcid, date_format( dd.endtime, '%Y-%m-%d' ) ddjssj,
        gygc.serial  FROM
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
        jgkssj  limit ` + curPage + `,` + pageSize + `;`

        let countSql = `SELECT count(*) count  FROM
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
                    jgkssj `
        let data = await this.model().query(sql)
        let count = await this.model().query(countSql)
        let info = {
            count: count[0].count,
            currentPage: pageNumber,
            data: data,
            pageSize: pageSize,
            totalPages: (count[0].count +pageSize - 1) / pageSize
        }
        return this.success(info)
    }

    //质检全部通过
    //如果是最后一道工序则更新BOM的状态
    async gygxCheckPassAllAction() {
        let {
            id,
            gygcid,
            jgryid,
            jyryid,
            bomid,
            bfjs,
            serial
        } = this.post()

        let updateJggl = {
            jysj: util.getNowTime(),
            sfjy: '1',
            jyryid: jyryid,
            bfjs: bfjs,
            fgjs: bfjs
        }
        //更新该条加工信息的检验信息
        await this.model('scglxt_t_jggl').where({
            id: id
        }).update(updateJggl)

        let updateSql = `
        update scglxt_t_gygc a set yjgjs =  yjgjs+(select c.jgjs from scglxt_t_jggl c where c.id = '` + id + `') ,bfjs=0,sjjs=0 where id = '` + gygcid + `'`

        //更新工艺的已加工件数
        let data = await this.model().execute(updateSql)

        let yjgjs = await this.model('scglxt_t_gygc').where({
            id: gygcid
        }).getField('yjgjs', true)

        let nextJGgy = await this.model('scglxt_t_gygc').where({
            bomid,
            serial: serial + 1
        }).select()
        //更新下一道工序
        //如果有下一到工序则更新开始下一道工序的可加工数量
        if (nextJGgy.length == 1) {
            await this.model('scglxt_t_gygc').where({
                bomid: bomid,
                serial: serial + 1
            }).update({
                kjgjs: yjgjs
            })
        } else {
            //如果已加工件数+报废件数=第一条工艺的可加工件数，说明整个流程加工完成，则修改订单状态
            let bfjs = await this.model('scglxt_t_gygc').where({
                bomid: bomid
            }).sum('bfjs')
            let kjgjsFirst = await this.model('scglxt_t_gygc').where({
                bomid: bomid,
                serial: 0
            }).getField('kjgjs', true)
            let yjgjsLast = await this.model('scglxt_t_gygc').where({
                bomid: bomid,
                serial: serial
            }).getField('yjgjs', true)

            if (kjgjsFirst == (bfjs + yjgjsLast)) {
                await this.model('scglxt_t_bom').where({
                    id: bomid
                }).update({
                    zddzt: '0503'
                })
            }
        }

        return this.success(data)
    }

    // 检验部分通过
    async gygxCheckPassPartAction() {
        let {
            id,
            gygcid,
            jyryid,
            sjzt,
            dhjs,
            dhyy,
            jgjs,
            yjgjs
        } = this.post()

        let jgglUpdate = {
            sfjy: '1',
            jysj: 'now()',
            jyryid: jyryid
        }
        let gygcUpdate = {
            yjgjs: yjgjs - bfjs + jgjs,
            bfjs: bfjs
        }
        let jgglData = await this.model('scglxt_t_jggl').where({
            id: id
        }).field('jgryid,jgsl jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find()

        await this.model('scglxt_t_gygc').where({
            gygcid: gygcid
        }).update(gygcUpdate)

        //生成打回记录
        let tmpLogData = jgglData
        tmpLogData.id = util.getUUId()
        tmpLogData.sjzt = sjzt
        tmpLogData.dhjs = dhjs
        tmpLogData.dhyy = dhyy

        await this.model('scglxt_t_jggl_tmp').add(tmpLogData)

        //返工
        if (sjzt == '2201') {
            gygcUpdate.fgcs = "(select count(*) from scglxt_t_jggl_tmp where jgglid='" + jgglId + " and sjzt='2201')+1"
            await this.model('scglxt_t_jggl').where({
                id: id
            }).update(jgglUpdate)

        } else { //报废
        }
    }
};