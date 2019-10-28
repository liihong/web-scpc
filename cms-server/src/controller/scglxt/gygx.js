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
        }).order('serial asc').alias('t').field('t.id,t.bomid,t.gynr,t.edgs,t.zbgs,t.serial,t.sbid,t.zysx,t.bzgs,t.ssdd,jggy.gymc, sblx.mc sbmc').where({
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

    // 获取设备列表
    async getSbListAction() {
        let token = this.header('token')
        
        let BzId = await this.model('cms_user').where({
            token: token
        }).getField('roles', true);

        let data = await this.model('scglxt_t_sb').where({
            BZID: BzId
        }).select()
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
            czryid: worker,
            status: 1,
            kssj: util.getNowTime()
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
            gyid,
            sbid,
            jgjs,
            ddjs,
            kjgjs,
            worker
        } = this.post()

        // let worker = this.header('token')
        let jgjlData = {
            jgjssj: util.getNowTime(),
            jgjs: jgjs,
            sbid: sbid
        }

        let updateData = await this.model('scglxt_t_jggl').where({
            gygcid: gyid,
            jgryid: worker,
            jgjssj: null
        }).update(jgjlData)

        let oldSjjs = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).getField('sjjs')
        let bomData = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).update({
            sjjs: parseInt(jgjs) + parseInt(oldSjjs),
            // czryid: null
        })

        let gygcData = await this.model('scglxt_t_gygc').where({
            id: gyid
        }).find()
        if (gygcData.kjgjs != (gygcData.yjgjs + gygcData.sjjs)) // 如果加工未完成自动再开始一条加工记录 
        {
            await this.model('scglxt_t_gygc').where({
                id: gyid
            }).update({
                czryid: null
            })

            // let jgjlData = {
            //     id: util.getUUId(),
            //     jgryid: worker,
            //     jgkssj: util.getNowTime(),
            //     gygcid: gyid
            // }

            // await this.model('scglxt_t_jggl').add(jgjlData)
            
        }
         else {
            await this.model('scglxt_t_gygc').where({
                id: gyid
            }).update({
                status: 2,
                jssj:util.getNowTime(),
                sfjy: 0
            })
        }


        return this.success(bomData, "操作成功")
    }

    //获取检验人员检验列表数据
    async getCheckListAction() {
        let pageNumber = this.post('pageNumber')
        let pageSize = this.post('pageSize')
        let queryKey = this.post('queryKey')
        let curPage = (pageNumber - 1) * pageSize
        let where = '1=1'

        if (!!queryKey) {
            where = "SSDD_TEXT like '%" + queryKey + "%' or BOMID_TEXT like '%" + queryKey + "%' or CZRYID_TEXT like '%" + queryKey + "%'"
        }
        let sql = `SELECT * from (SELECT jggl.ID, dd.xmname SSDD_TEXT,gygc.ZYSX,
        bom.zddmc BOMID_TEXT, bom.zddjb ZDDJB, bom.bmcl BMCL, tz.tzlx, tz.url tzurl, jggy.gymc GYNR_TEXT,bom.jgsl KJGJS,gygc.YJGJS,
        ry.rymc CZRYID_TEXT,jggl.JGRYID, sb.sbmc SBID_TEXT, jggl.jgjs SJJS, gygc.BOMID,gygc.id gygcid, date_format( dd.endtime, '%Y-%m-%d' ) ddjssj,
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
        bom.ssdd,gygc.bomid,dd.DDLEVEL) t where (` + where + `)  limit ` + curPage + `,` + pageSize + `;`

        let countSql = `SELECT count(*) count  FROM (select gygc.id,dd.xmname SSDD_TEXT, bom.zddmc BOMID_TEXT,ry.rymc CZRYID_TEXT from 
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
                    jgkssj ) t where (` + where + `)`
        let data = await this.model().query(sql)
        let count = await this.model().query(countSql)
        let info = {
            count: count[0].count,
            currentPage: pageNumber,
            data: data,
            pageSize: pageSize,
            totalPages: (count[0].count + pageSize - 1) / pageSize
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
            bomid,
            bfjs,
            serial
        } = this.post()

        let jyryid = this.header('token');

        let updateJggl = {
            jysj: util.getNowTime(),
            sfjy: '1',
            jyryid: jyryid,
            bfjs: bfjs,
            fgjs: bfjs
        }
        //更新该条加工信息的检验信息
        await this.model('scglxt_t_jggl').where({
            id:id
        }).update(updateJggl)

        let updateSql = `
        update scglxt_t_gygc a set jyryid='`+jyryid+`',sfjy=1,yjgjs =  yjgjs+(select c.jgjs from scglxt_t_jggl c where c.id = '` + id + `' ) ,bfjs=0,sjjs=0 where id = '` + gygcid + `'`

        
        //更新工艺的已加工件数
        let data = await this.model().execute(updateSql)

        let {yjgjs,kjgjs} = await this.model('scglxt_t_gygc').where({
            id: gygcid
        }).getField('yjgjs,kjgjs', true)

        // //如果订单件数全部完成
        // if(yjgjs == kjgjs) {
        //     await this.model('scglxt_t_gygc').update({sfjy: 1}).where({id: gygcid})
        // }

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
            bomid,
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
            jysj: util.getNowTime(),
            jyryid: jyryid
        }
        let gygcUpdate = {
            yjgjs: yjgjs - dhjs + jgjs,
            bfjs: dhjs
        }
        let jgglData = await this.model('scglxt_t_jggl').where({
            id: id
        }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find()

        await this.model('scglxt_t_gygc').where({
            id: gygcid
        }).update(gygcUpdate)

        //生成打回记录
        let tmpLogData = jgglData
        tmpLogData.id = util.getUUId()
        tmpLogData.sjzt = sjzt
        tmpLogData.dhjs = dhjs
        tmpLogData.dhyy = dhyy
        tmpLogData.jyryid = jyryid
        tmpLogData.jysj = util.getNowTime()

        await this.model('scglxt_t_jggl_tmp').add(tmpLogData)

        let data = {}
        //返工
        if (sjzt == '2201') {
            gygcUpdate.fgcs = "(select count(*) from scglxt_t_jggl_tmp where jgglid='" + id + " and sjzt='2201')+1"
            data = await this.model('scglxt_t_jggl').where({
                id: id
            }).update(jgglUpdate)

        } else { //报废，重新生成BOM从头开始加工
            let bomid = util.getUUId()
            let bomData = await this.model('scglxt_t_bom').where({
                id: bomid
            }).find()
            bomData.id = bomid
            bomData.zddmc = bomData.zddmc + '_报废单'
            bomData.zddzt = '0501'
            bomData.jgsl = dhjs
            bomData.clzt = null
            bomData.rksj = null
            bomData.cksj = null
            bomData.blkssj = null
            bomData.bljssj = null

            await this.model('scglxt_t_bom').add(bomData)

            let gygxDatas = await this.model('scglxt_t_gygc').where({
                bomid: bomid
            }).select()

            if (gygxDatas.length > 0) {
                gygxDatas.map(item => {
                    item.id = util.getUUId()
                    item.bomid = bomid
                    item.kjgjs = 0
                    item.yjgjs = 0
                    item.sjjs = 0
                    return item
                })
                data = await this.model('scglxt_t_gygc').addMany(gygxDatas)
            }
        }

        return this.success(data)
    }

    //检验全部打回
    //打回第一步：先生成打回记录
    //打回第三步：修改加工工艺的返工次数
    //打回第二步：删掉已加工的加工记录
    async gygxCheckNoPassAction() {
        let {
            id,
            gygcid,
            jyryid,
            dhjs,
            dhyy,
            jgjs,
            yjgjs
        } = this.post()

        let jgglData = await this.model('scglxt_t_jggl').where({
            id: id
        }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find()

        //生成打回记录
        let tmpLogData = jgglData
        tmpLogData.id = util.getUUId()
        tmpLogData.sjzt = '2201'
        tmpLogData.dhjs = dhjs
        tmpLogData.dhyy = dhyy
        tmpLogData.jyryid = jyryid
        tmpLogData.jysj = util.getNowTime()

        await this.model('scglxt_t_jggl_tmp').add(tmpLogData)

        let count = await this.model('scglxt_t_jggl_tmp').where({
            jgglId: id
        }).count()

        let gygcUpdate = {
            bfjs: dhjs,
            sjjs: 0,
            fgcs: count
        }

        await this.model('scglxt_t_gygc').where({
            id: gygcid
        }).update(gygcUpdate)

        let data = await this.model('scglxt_t_jggl').where({
            id: id
        }).delete()

        return this.success(data)
    }
};