/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let gyModel = 'scglxt_t_gygc'
import util from '../../../utils/util'

module.exports = class extends Base {
    async getJggyListAction() {
        let data = await this.model('scglxt_t_jggy').join({
            table: 'v_scglxt_pc_gygx',
            as: 'gs',
            join: 'left',
            on: ['id', 'gynr']
        }).select()
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
        }).order('serial asc').alias('t').field('t.id,t.bomid,t.gynr,t.edgs,t.zbgs,t.serial,t.sbid,t.zysx,t.bzgs,t.ssdd,jggy.gymc, sblx.mc sbmc,t.sfwx').where({
            'bomid': this.get('bomid')
        }).select()
        return this.success(data)
    }


    /**
     * 保存工艺
     * 1.先判断是否已存在工艺
     * 2.如果没有直接新增，
     * 3.如果已有是修改，则只修改即可
     * 4.修改bom中显示的工艺内容 
     * 5.更新DD的工时
     * @returns 
     */
    async saveGygxInfoAction() {
        let form = this.post('form')
        let ssdd = this.post('ssdd')
        if (form.length == 0) {
            return this.fail(1000, '没有数据')
        }
        let rows = await this.model(gyModel).where({
            bomid: form[0].bomid
        }).select();
        let bomgxgx = await this.model('scglxt_t_bom').field('gxnr').where({
            id: form[0].bomid
        })
        try {
            let gynr = [],
                gs = 0,
                data = ''
            //如果是编辑
            const vm = this
            if (bomgxgx && bomgxgx != '') {
                let pArr = []
                form.forEach(item => {
                    pArr.push(vm.updateGygxOrAdd(item))
                })
                Promise.all(pArr).then(async () => {
                    let newData = await this.model(gyModel).join({
                        table: 'scglxt_t_jggy',
                        join: 'left',
                        on: ['gynr', 'id']
                    }).field("gynr,gymc,bzgs,zbgs").where({
                        bomid: form[0].bomid
                    }).order('serial').select();
                    newData.forEach(item => {
                        gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
                        gs += parseInt(item.zbgs + item.bzgs);
                    })
                    //修改bom显示的工艺内容

                    let bomUpdate = {
                        gxnr: gynr.join('-'),
                        gs: gs
                    }
                    console.log(form[form.length-1])
                    if(form[form.length-1].gynr=='20170424203607219'){
                        bomUpdate.bmcl = form[form.length-1].zysx
                    }

                    await this.model('scglxt_t_bom').where({
                        id: form[0].bomid
                    }).update(bomUpdate);

                    // 更新订单总工时
                    let zgs = await this.model('scglxt_t_bom').where({
                        ssdd: ssdd
                    }).sum('gs');

                    await this.model('scglxt_t_dd').where({
                        id: ssdd
                    }).update({
                        zgs: zgs
                    });
                })
            } else {
                data = await this.model(gyModel).addMany(form, {
                    pk: 'ID'
                });
                let newData = await this.model(gyModel).join({
                    table: 'scglxt_t_jggy',
                    join: 'left',
                    on: ['gynr', 'id']
                }).field("gynr,gymc,bzgs,zbgs").where({
                    bomid: form[0].bomid
                }).order('serial').select();
                newData.forEach(item => {
                    gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
                    gs += parseInt(item.zbgs + item.bzgs);
                })
                //修改bom显示的工艺内容

                //如果最后一道工序是表面处理则自动更新BOM的表面处理字段
                
                let bomUpdate = {
                    gxnr: gynr.join('-'),
                    gs: gs
                }
                if(form[form.length-1].gynr=='20170424203607219'){
                    bomUpdate.bmcl = form[form.length-1].zysx
                }
                await this.model('scglxt_t_bom').where({
                    id: form[0].bomid
                }).update(bomUpdate);

                // 更新订单总工时
                let zgs = await this.model('scglxt_t_bom').where({
                    ssdd: ssdd
                }).sum('gs');

                await this.model('scglxt_t_dd').where({
                    id: ssdd
                }).update({
                    zgs: zgs
                });

            }

            // 新增日志
            let errorLog = {
                id: util.getUUId(),
                operate_type: 'bom',
                operater_id: this.header('token'),
                content: form[0].bomid,
                tablename: 'SCGLXT_T_GYGC',
                old_value: JSON.stringify(rows),
                new_value: JSON.stringify(this.post())
            }
            await this.model('resource_log').add(errorLog)

            return this.success(data)
        } catch (ex) {
            // 如果上面流程执行失败，则恢复原有数据
            await this.model(gyModel).addMany(rows, {
                pk: 'ID'
            });
            let errorLog = {
                id: util.getUUId(),
                type: '工艺编排',
                error: JSON.stringify(ex),
                infos: JSON.stringify(this.post())
            }
            await this.model('operate_log').add(errorLog)
            return this.fail(ex)
        }

    }
    //判断当前工艺是新增还是修改
    async updateGygxOrAdd(item) {
        return new Promise(async resolve => {
            let isData = await this.model(gyModel).where({
                id: item.id
            }).select()
            if (isData.length > 0) //已存在
            {
                await this.model(gyModel).where({
                    id: item.id
                }).update(item)
            } else { //不存在新增
                await this.model(gyModel).where({
                    id: item.id
                }).add(item)
            }
            resolve()
        })
    }

    //删除,删除时，如果已经开始加工，则更新删除的下一条工艺可加工件数
    async deleteGygxAction() {
        let id = this.post('id')
        let bomid = this.post('bomid')
        let ssdd = this.post('ssdd')
        let jgglData = await this.model('scglxt_t_jggl').where({
            gygcid: id
        }).select()
        let data = {}
        //如果已经在加工中
        if (jgglData.length > 0) {
            return this.fail(200, '已经加工无法删除,只能修改')
        } else {
            //判断是否有下一条工艺
            let nowData = await this.model('scglxt_t_gygc').where({
                id: id
            }).find()
            let nextData = await this.model('scglxt_t_gygc').where({
                bomid: bomid,
                serial: parseInt(nowData.serial) + 1
            }).select()
            //如果有下一条工艺则应更新删除后所有数据的serial
            if (nextData.length > 0) {
                await this.model(gyModel).execute('update scglxt_t_gygc set serial=serial-1 where bomid=' + bomid + ' and serial>' + nowData.serial)
            }
            if (nowData.kjgjs != 0 && nextData.length > 0) { //如果有下一条工艺，并且删除的这一条的可加工件数不为0
                data = await this.model(gyModel).where({
                    id: nextData[0].id
                }).update({
                    kjgjs: nowData.kjgjs
                })
            }
            data = await this.model(gyModel).where({
                id: id
            }).delete()
        }
        let gynr = [],
            gs = 0
        let newData = await this.model(gyModel).join({
            table: 'scglxt_t_jggy',
            join: 'left',
            on: ['gynr', 'id']
        }).field("gynr,gymc,bzgs,zbgs").where({
            bomid: bomid
        }).order('serial').select();
        newData.forEach(item => {
            gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
            gs += parseInt(item.zbgs + item.bzgs);
        })
        //修改bom显示的工艺内容

        await this.model('scglxt_t_bom').where({
            id: bomid
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

        try {
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
        } catch (ex) {
            let errorLog = {
                id: util.getUUId(),
                type: '开始加工',
                error: JSON.stringify(ex),
                infos: JSON.stringify(this.post())
            }
            await this.model('operate_log').add(errorLog)
        }

    }

    //结束加工
    // 1.更新工序已加工件数，更新使用设备，
    //2.更新操作记录表 
    //3.更新送检件数
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

        try {
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
                sjjs: parseFloat(jgjs) + parseFloat(oldSjjs),
                // czryid: null
            })

            let gygcData = await this.model('scglxt_t_gygc').where({
                id: gyid
            }).find()


            if (ddjs != (gygcData.yjgjs + gygcData.sjjs)) // 如果加工未完成自动再开始一条加工记录 
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

            } else {
                let updateInfo = {
                    status: 2,
                    jssj: util.getNowTime(),
                    sfjy: 0
                }
                //容错处理，如果已加工件数+送检件数大于可加工件数，则默认将已加工件数更新为订单件数

                if (gygcData.kjgjs < (gygcData.yjgjs + gygcData.sjjs)) {
                    updateInfo.yjgjs = ddjs
                }
                await this.model('scglxt_t_gygc').where({
                    id: gyid
                }).update(updateInfo)
            }


            return this.success(bomData, "操作成功")
        } catch (ex) {
            let errorLog = {
                id: util.getUUId(),
                type: '结束加工',
                error: JSON.stringify(ex),
                infos: JSON.stringify(this.post())
            }
            await this.model('operate_log').add(errorLog)
        }
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
        let sql = `SELECT * from (SELECT jggl.ID, dd.xmname SSDD_TEXT,gygc.ZYSX,gygc.KSSJ,gygc.JSSJ,fun_dqgygc1 (gygc.BOMID) DQJD,
        bom.zddmc BOMID_TEXT, bom.zddjb ZDDJB, bom.bmcl BMCL, jggy.gymc GYNR_TEXT,bom.jgsl KJGJS,gygc.YJGJS,
        ry.rymc CZRYID_TEXT,jggl.JGRYID, sb.sbmc SBID_TEXT, jggl.jgjs SJJS, gygc.BOMID,gygc.id gygcid, date_format( dd.endtime, '%Y-%m-%d' ) ddjssj,
        gygc.serial  FROM
            scglxt_t_gygc gygc,
            scglxt_t_bom bom,
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
                        scglxt_t_bom bom,
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
    async gygxCheckPass(id,bomid,gygcid,serial,bfjs){
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
                id: id
            }).update(updateJggl)

            let updateSql = `
            update scglxt_t_gygc a set jyryid='` + jyryid + `',sfjy=1,yjgjs =  yjgjs+(select c.jgjs from scglxt_t_jggl c where c.id = '` + id + `' ) ,bfjs=0,sjjs=0 where id = '` + gygcid + `'`


            //更新工艺的已加工件数
            let data = await this.model().execute(updateSql)

            let {
                yjgjs,
                kjgjs
            } = await this.model('scglxt_t_gygc').where({
                id: gygcid
            }).getField('yjgjs,kjgjs', true)

            // //如果订单件数全部完成
            // if(yjgjs == kjgjs) {
            //     await this.model('scglxt_t_gygc').update({sfjy: 1}).where({id: gygcid})
            // }

            //容错处理，如果已加工件数+送检件数大于可加工件数，则默认将已加工件数更新为可加工件数
            if (yjgjs > kjgjs) {
                await this.model('scglxt_t_gygc').where({
                    id: gygcid
                }).update({
                    yjgjs: kjgjs
                })
            }

            let nextJGgy = await this.model('scglxt_t_gygc').where({
                bomid,
                serial: serial + 1
            }).select()
            //更新下一道工序
            //如果有下一到工序则更新开始下一道工序的可加工数量
            if (nextJGgy.length == 1) {
                await this.model('scglxt_t_gygc').where({
                    bomid: bomid,
                    serial: parseInt(serial) + 1
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

            return data
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

        try {
            let data = this.gygxCheckPass(id,bomid,gygcid,serial,bfjs)
            return this.success(data)
        } catch (ex) {
            let errorLog = {
                id: util.getUUId(),
                type: '质检检验',
                error: JSON.stringify(ex),
                infos: JSON.stringify(this.post())
            }
            await this.model('operate_log').add(errorLog)
        }

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
            yjgjs,
            serial
        } = this.post()

        let jgglUpdate = {
            sfjy: '1',
            jysj: util.getNowTime(),
            jyryid: jyryid
        }
        let gygcUpdate = {
            yjgjs: jgjs - dhjs,
            sfjy: '1',
            jyryid: this.header('token'),
            status: 2,
            fgcs: 1,
            sjjs: 0
        }
        let jgglData = await this.model('scglxt_t_jggl').where({
            id: id
        }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find()

      

        //生成打回记录
        let tmpLogData = jgglData
        tmpLogData.id = util.getUUId()
        tmpLogData.sjzt = sjzt
        tmpLogData.dhjs = dhjs
        tmpLogData.dhyy = dhyy
        tmpLogData.jyryid = jyryid
        tmpLogData.jysj = util.getNowTime()

        await this.model('scglxt_t_jggl_tmp').add(tmpLogData)
        let bomData = await this.model('scglxt_t_bom').where({
            id: bomid
        }).find()
        let data = {}
        //返工
        if (sjzt == '2201') {

            await this.model('scglxt_t_gygc').where({
                id: gygcid
            }).update(gygcUpdate)

            gygcUpdate.fgcs = "(select count(*) from scglxt_t_jggl_tmp where jgglid='" + id + " and sjzt='2201')+1"
            data = await this.model('scglxt_t_jggl').where({
                id: id
            }).update(jgglUpdate)

        } else { //报废，重新生成BOM从头开始加工
            gygcUpdate.bfjs = dhjs
            await this.model('scglxt_t_gygc').where({
                id: gygcid
            }).update(gygcUpdate)

            let newbomid = util.getUUId()

            data = await this.model('scglxt_t_bom').where({
                id: bomid
            }).update({
                bfjs: dhjs
            })
            bomData.id = newbomid
            bomData.zddmc = bomData.zddmc + '_报废重做'
            bomData.zddzt = '0501'
            bomData.jgsl = dhjs
            bomData.clzt = '3'
            bomData.rksj = null
            bomData.cksj = null
            bomData.blkssj = null
            bomData.bljssj = null
            bomData.sjcjsj = util.getNowTime()

            await this.model('scglxt_t_bom').add(bomData)

            let gygxDatas = await this.model('scglxt_t_gygc').where({
                bomid: bomid
            }).select()

            if (gygxDatas.length > 0) {
                gygxDatas.map(item => {
                    item.id = util.getUUId()
                    item.bomid = newbomid
                    item.kjgjs = 0
                    item.yjgjs = 0
                    item.sjjs = 0
                    item.bfjs = 0
                    item.sfjy = null
                    item.czryid = null
                    item.kssj = null
                    item.jssj = null
                    item.status = null
                    item.jyryid = null
                    item.fgcs = null
                    item.sjcjsj = util.getNowTime()
                    return item
                })
                data = await this.model('scglxt_t_gygc').addMany(gygxDatas)

                //如果报废件数=订单件数则该零件直接出库，如果报废件数少于订单件数则剩余件数继续走下一道工序
                if (jgjs == dhjs) {
                    await this.model('scglxt_t_bom').where({
                        id: bomid
                    }).update({
                        zddzt: '0506'
                    })
                } else {
                    let nextJGgy = await this.model('scglxt_t_gygc').where({
                        bomid,
                        serial: parseInt(serial) + 1
                    }).select()
                    //更新下一道工序
                    //如果有下一到工序则更新开始下一道工序的可加工数量
                    if (nextJGgy.length == 1) {
                        await this.model('scglxt_t_gygc').where({
                            bomid: bomid,
                            serial: parseInt(serial) + 1
                        }).update({
                            kjgjs: jgjs-dhjs,
                            bfjs:dhjs
                        })
                    }else{
                        await this.model('scglxt_t_bom').where({
                            id: bomid
                        }).update({
                            zddzt: '0503'
                        })
                    }
                }
            }

            let errorLog = {
                id: util.getUUId(),
                type: '质检报废成功',
                infos: JSON.stringify(this.post()),
                operater: this.header('token')
            }
            await this.model('operate_log').add(errorLog)

        }

        let updateJggl = {
            jysj: util.getNowTime(),
            sfjy: '1',
            jyryid: jyryid,
            bfjs: dhjs
        }
        //更新该条加工信息的检验信息
        await this.model('scglxt_t_jggl').where({
            id: id
        }).update(updateJggl)

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
            sjjs: 0,
            fgcs: count,
            czryid: null,
            yjgjs: 0,
            status: 1,
            kssj: null,
            jssj: null,
            jyryid: null
        }

        await this.model('scglxt_t_gygc').where({
            id: gygcid
        }).update(gygcUpdate)

        let data = await this.model('scglxt_t_jggl').where({
            id: id
        }).delete()

        let errorLog = {
            id: util.getUUId(),
            type: '删除加工记录成功',
            operater: this.header('token'),
            infos: JSON.stringify(this.post())
        }
        await this.model('operate_log').add(errorLog)

        return this.success(data)
    }

    //质检让步接收
    //先通过质检再生成让步接收日志
    async gygxCheckRBJSAction(){
        let {
            id,
            bomid,
            gygcid,
            serial,
            bfjs,
            dhjs,
            dhyy,
            sjzt
        } = this.post()
        let data = this.gygxCheckPass(id,bomid,gygcid,serial,bfjs)
        
        if(data){
            let jgglData = await this.model('scglxt_t_jggl').where({
                id: id
            }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find()
    
            //生成打回记录
            let tmpLogData = jgglData
            tmpLogData.id = util.getUUId()
            tmpLogData.sjzt = sjzt
            tmpLogData.dhjs = dhjs
            tmpLogData.dhyy = dhyy
            tmpLogData.jyryid = this.header('token')
            tmpLogData.jysj = util.getNowTime()
    
            await this.model('scglxt_t_jggl_tmp').add(tmpLogData)
        }
        return this.success(data)
    }
    // 工艺排序
    async orderTopAction() {
        let row = this.post('row')

    }

    //人工手动调整加工记录表，如若出现错误，可手动调整
    async updateJGJLAction(){
        let id = this.post('id')
        let form = this.post('form')
        let data = await this.model('scglxt_t_jggl').where({id:id}).update(form)
        
        let errorLog = {
            id: util.getUUId(),
            type: '加工记录修正',
            operater: this.header('token'),
            infos: JSON.stringify(this.post())
        }
        await this.model('operate_log').add(errorLog)


        return this.success(data)
    }

    async deleteJGJLAction(){
        let id = this.post('id')

        let data = await this.model('scglxt_t_jggl').where({id:id}).delete()

        let errorLog = {
            id: util.getUUId(),
            type: '删除加工记录',
            operater: this.header('token'),
            infos: JSON.stringify(this.post())
        }
        await this.model('operate_log').add(errorLog)

        return this.success(data)
    }
};