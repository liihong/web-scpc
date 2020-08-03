/**
 * 加工工艺操作的接口
 */
import util from '../../../utils/util';
const Base = require('../base.js');
const gyModel = 'scglxt_t_gygc';

module.exports = class extends Base {
  async getJggyListAction() {
    const data = await this.model('scglxt_t_jggy').join({
      table: 'v_scglxt_pc_gygx',
      as: 'gs',
      join: 'left',
      on: ['id', 'gynr']
    }).select();
    return this.success(data);
  }
  // 获取某一个BOM的工艺
  async getJggxByBOMIdAction() {
    const data = await this.model(gyModel).join({
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
    }).select();
    return this.success(data);
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
    const form = this.post('form');
    const ssdd = this.post('ssdd');
    if (form.length == 0) {
      return this.fail(1000, '没有数据');
    }
    const rows = await this.model(gyModel).where({
      bomid: form[0].bomid
    }).select();
    const bomgxgx = await this.model('scglxt_t_bom').field('gxnr').where({
      id: form[0].bomid
    });
    try {
      let gynr = [],
        gs = 0,
        data = '';
      // 如果是编辑
      const vm = this;
      if (bomgxgx && bomgxgx != '') {
        const pArr = [];
        form.forEach(item => {
          pArr.push(vm.updateGygxOrAdd(item));
        });
        Promise.all(pArr).then(async() => {
          const newData = await this.model(gyModel).join({
            table: 'scglxt_t_jggy',
            join: 'left',
            on: ['gynr', 'id']
          }).field('gynr,gymc,bzgs,zbgs').where({
            bomid: form[0].bomid
          }).order('serial').select();
          newData.forEach(item => {
            gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
            gs += parseInt(item.zbgs + item.bzgs);
          });
          // 修改bom显示的工艺内容

          const bomUpdate = {
            gxnr: gynr.join('-'),
            gs: gs
          };
          console.log(form[form.length - 1]);
          if (form[form.length - 1].gynr == '20170424203607219') {
            bomUpdate.bmcl = form[form.length - 1].zysx;
          }

          await this.model('scglxt_t_bom').where({
            id: form[0].bomid
          }).update(bomUpdate);

          // 更新订单总工时
          const zgs = await this.model('scglxt_t_bom').where({
            ssdd: ssdd
          }).sum('gs');

          await this.model('scglxt_t_dd').where({
            id: ssdd
          }).update({
            zgs: zgs
          });
        });
      } else {
        data = await this.model(gyModel).addMany(form, {
          pk: 'ID'
        });
        const newData = await this.model(gyModel).join({
          table: 'scglxt_t_jggy',
          join: 'left',
          on: ['gynr', 'id']
        }).field('gynr,gymc,bzgs,zbgs').where({
          bomid: form[0].bomid
        }).order('serial').select();
        newData.forEach(item => {
          gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
          gs += parseInt(item.zbgs + item.bzgs);
        });
        // 修改bom显示的工艺内容

        // 如果最后一道工序是表面处理则自动更新BOM的表面处理字段

        const bomUpdate = {
          gxnr: gynr.join('-'),
          gs: gs
        };
        if (form[form.length - 1].gynr === '20170424203607219') {
          bomUpdate.bmcl = form[form.length - 1].zysx;
        }
        await this.model('scglxt_t_bom').where({
          id: form[0].bomid
        }).update(bomUpdate);

        // 更新订单总工时
        const zgs = await this.model('scglxt_t_bom').where({
          ssdd: ssdd
        }).sum('gs');

        await this.model('scglxt_t_dd').where({
          id: ssdd
        }).update({
          zgs: zgs
        });
      }

      // 新增日志
      const errorLog = {
        id: util.getUUId(),
        operate_type: 'bom',
        operater_id: this.header('token'),
        content: form[0].bomid,
        tablename: 'SCGLXT_T_GYGC',
        old_value: JSON.stringify(rows),
        new_value: JSON.stringify(this.post())
      };
      await this.model('resource_log').add(errorLog);

      return this.success(data);
    } catch (ex) {
      // 如果上面流程执行失败，则恢复原有数据
      await this.model(gyModel).addMany(rows, {
        pk: 'ID'
      });
      const errorLog = {
        id: util.getUUId(),
        type: '工艺编排',
        error: JSON.stringify(ex),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
      return this.fail(ex);
    }
  }
  // 判断当前工艺是新增还是修改
  async updateGygxOrAdd(item) {
    return new Promise(async resolve => {
      const isData = await this.model(gyModel).where({
        id: item.id
      }).select();
      if (isData.length > 0) // 已存在
      {
        await this.model(gyModel).where({
          id: item.id
        }).update(item);
      } else { // 不存在新增
        await this.model(gyModel).where({
          id: item.id
        }).add(item);
      }
      resolve();
    });
  }

  // 删除,删除时，如果已经开始加工，则更新删除的下一条工艺可加工件数
  async deleteGygxAction() {
    const id = this.post('id');
    const bomid = this.post('bomid');
    const ssdd = this.post('ssdd');
    const jgglData = await this.model('scglxt_t_jggl').where({
      gygcid: id
    }).select();
    let data = {};
    // 如果已经在加工中
    if (jgglData.length > 0) {
      return this.fail(200, '已经加工无法删除,只能修改');
    } else {
      // 判断是否有下一条工艺
      const nowData = await this.model('scglxt_t_gygc').where({
        id: id
      }).find();
      const nextData = await this.model('scglxt_t_gygc').where({
        bomid: bomid,
        serial: parseInt(nowData.serial) + 1
      }).select();
      // 如果有下一条工艺则应更新删除后所有数据的serial
      if (nextData.length > 0) {
        await this.model(gyModel).execute('update scglxt_t_gygc set serial=serial-1 where bomid=' + bomid + ' and serial>' + nowData.serial);
      }
      if (nowData.kjgjs != 0 && nextData.length > 0) { // 如果有下一条工艺，并且删除的这一条的可加工件数不为0
        data = await this.model(gyModel).where({
          id: nextData[0].id
        }).update({
          kjgjs: nowData.kjgjs
        });
      }
      data = await this.model(gyModel).where({
        id: id
      }).delete();
    }
    let gynr = [],
      gs = 0;
    const newData = await this.model(gyModel).join({
      table: 'scglxt_t_jggy',
      join: 'left',
      on: ['gynr', 'id']
    }).field('gynr,gymc,bzgs,zbgs').where({
      bomid: bomid
    }).order('serial').select();
    newData.forEach(item => {
      gynr.push(item.gymc + '(' + parseInt(item.zbgs + item.bzgs) + ')');
      gs += parseInt(item.zbgs + item.bzgs);
    });
    // 修改bom显示的工艺内容

    await this.model('scglxt_t_bom').where({
      id: bomid
    }).update({
      gxnr: gynr.join('-'),
      gs: gs
    });

    // 更新订单总工时
    const zgs = await this.model('scglxt_t_bom').where({
      ssdd: ssdd
    }).sum('gs');

    await this.model('scglxt_t_dd').where({
      id: ssdd
    }).update({
      zgs: zgs
    });

    return this.success(data);
  }
  // 获取设备类型
  async getSblxListAction() {
    const data = await this.model('scglxt_t_sblx').select();
    return this.success(data);
  }

  // 获取设备列表
  async getSbListAction() {
    const token = this.header('token');

    const BzId = await this.model('cms_user').where({
      token: token
    }).getField('roles', true);

    const data = await this.model('scglxt_t_sb').where({
      BZID: BzId
    }).select();
    return this.success(data);
  }

  // 工作人员开始工作
  // 1.更新工序操作人员 2.新增操作记录 3.如果是第一条工序讲BOM改为进行中状态
  async beginWorkAction() {
    const worker = this.post('worker');
    const gyid = this.post('gyid');
    const gyData = await this.model('scglxt_t_gygc').where({
      id: gyid
    }).find();

    try {
      if (gyData.czryid && gyData.czryid !== '') {
        return this.fail(500, '正在加工，请先结束！');
      }
      await this.model('scglxt_t_gygc').where({
        id: gyid
      }).update({
        czryid: worker,
        status: 1,
        kssj: util.getNowTime()
      });
      if (gyData.serial == 0) {
        await this.model('scglxt_t_bom').where({
          id: gyData.bomid
        }).update({
          zddzt: '0502'
        });
      }

      const jgjlData = {
        id: util.getUUId(),
        jgryid: worker,
        jgkssj: util.getNowTime(),
        gygcid: gyid
      };

      const data = await this.model('scglxt_t_jggl').add(jgjlData);

      return this.success(data);
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '加工报错',
        error: JSON.stringify(ex),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
    }
  }

  // 结束加工
  // 1.更新工序已加工件数，更新使用设备，
  // 2.更新操作记录表
  // 3.更新送检件数
  async overWorkAction() {
    const {
      gyid,
      sbid,
      jgjs,
      ddjs,
      worker,
      gynr
    } = this.post();

    const jgjlData = {
      jgjssj: util.getNowTime(),
      jgjs: jgjs,
      sbid: sbid
    };

    try {
      await this.model('scglxt_t_jggl').where({
        gygcid: gyid,
        jgryid: worker,
        jgjssj: null
      }).update(jgjlData);

      const oldSjjs = await this.model('scglxt_t_gygc').where({
        id: gyid
      }).getField('sjjs');
      const bomData = await this.model('scglxt_t_gygc').where({
        id: gyid
      }).update({
        sjjs: parseFloat(jgjs) + parseFloat(oldSjjs)
      });

      const gygcData = await this.model('scglxt_t_gygc').where({
        id: gyid
      }).find();
      // 如果加工未完成自动再开始一条加工记录
      if (ddjs !== (gygcData.yjgjs + gygcData.sjjs)) {
        await this.model('scglxt_t_gygc').where({
          id: gyid
        }).update({
          czryid: null
        });
      } else {
        const updateInfo = {
          status: 2,
          jssj: util.getNowTime(),
          sfjy: 0
        };
        // 容错处理，如果已加工件数+送检件数大于可加工件数，则默认将已加工件数更新为订单件数

        if (gygcData.kjgjs < (gygcData.yjgjs + gygcData.sjjs)) {
          updateInfo.yjgjs = ddjs;
        }
        await this.model('scglxt_t_gygc').where({
          id: gyid
        }).update(updateInfo);
      }

      // 操作完成后判断该工序是否是最后一道工序，并且免检
      const nextData = await this.model('scglxt_t_gygc').where({bomid: gygcData.bomid, serial: gygcData.serial + 1}).select();
      if (nextData.length === 0) {
        const gyInfo = await this.model('scglxt_t_jggy').where({id: gynr}).find();
        if (gyInfo.gxsx !== '' && gyInfo.gxsx != null) {
          await this.model('scglxt_t_bom').where({id: gygcData.bomid}).update({
            zddzt: gyInfo.gxsx
          });
        }
      }

      return this.success(bomData, '操作成功');
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '结束加工出错',
        error: JSON.stringify(ex),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
      return this.fail('加工出错，请稍后重试');
    }
  }

  // 获取检验人员检验列表数据
  async getCheckListAction() {
    const pageNumber = this.post('pageNumber');
    const pageSize = this.post('pageSize');
    const queryKey = this.post('queryKey');
    const curPage = (pageNumber - 1) * pageSize;
    const gynr = this.post('gynr');
    let where = '1=1';

    if (queryKey) {
      where = "SSDD_TEXT like '%" + queryKey + "%' or BOMID_TEXT like '%" + queryKey + "%' or CZRYID_TEXT like '%" + queryKey + "%'";
    }
    if (gynr && gynr !== '') {
      where += ` and  gynr = '${gynr}'`;
    }
    const sql = `SELECT * from (SELECT jggl.ID, dd.xmname SSDD_TEXT,gygc.ZYSX,gygc.KSSJ,gygc.JSSJ,fun_dqgygc1 (gygc.BOMID) DQJD,
        bom.zddmc BOMID_TEXT, bom.zddjb ZDDJB, bom.bmcl BMCL,gygc.gynr, jggy.gymc GYNR_TEXT,bom.jgsl KJGJS,gygc.YJGJS,
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
        bom.ssdd,gygc.bomid,dd.DDLEVEL) t where (` + where + `)  limit ` + curPage + `,` + pageSize + `;`;

    const countSql = `SELECT count(*) count  FROM (select gygc.id,dd.xmname SSDD_TEXT,gygc.gynr, bom.zddmc BOMID_TEXT,ry.rymc CZRYID_TEXT from 
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
                    jgkssj ) t where (` + where + `)`;
    const data = await this.model().query(sql);
    const count = await this.model().query(countSql);
    const info = {
      count: count[0].count,
      currentPage: pageNumber,
      data: data,
      pageSize: pageSize,
      totalPages: (count[0].count + pageSize - 1) / pageSize
    };
    return this.success(info);
  }
  async gygxCheckPass(id, bomid, gygcid, serial, bfjs) {
    const jyryid = this.header('token');

    const updateJggl = {
      jysj: util.getNowTime(),
      sfjy: '1',
      jyryid: jyryid,
      bfjs: bfjs,
      fgjs: bfjs
    };
    // 更新该条加工信息的检验信息
    await this.model('scglxt_t_jggl').where({
      id: id
    }).update(updateJggl);

    const updateSql = `
            update scglxt_t_gygc a set jyryid='` + jyryid + `',sfjy=1,yjgjs =  yjgjs+(select c.jgjs from scglxt_t_jggl c where c.id = '` + id + `' ) ,bfjs=0,sjjs=0 where id = '` + gygcid + `'`;

    // 更新工艺的已加工件数
    const data = await this.model().execute(updateSql);

    const {
      yjgjs,
      kjgjs
    } = await this.model('scglxt_t_gygc').where({
      id: gygcid
    }).getField('yjgjs,kjgjs', true);

    // //如果订单件数全部完成
    // if(yjgjs == kjgjs) {
    //     await this.model('scglxt_t_gygc').update({sfjy: 1}).where({id: gygcid})
    // }

    // 容错处理，如果已加工件数+送检件数大于可加工件数，则默认将已加工件数更新为可加工件数
    if (yjgjs > kjgjs) {
      await this.model('scglxt_t_gygc').where({
        id: gygcid
      }).update({
        yjgjs: kjgjs
      });
    }

    const nextJGgy = await this.model('scglxt_t_gygc').where({
      bomid,
      serial: serial + 1
    }).select();
    // 更新下一道工序
    // 如果有下一到工序则更新开始下一道工序的可加工数量
    if (nextJGgy.length == 1) {
      await this.model('scglxt_t_gygc').where({
        bomid: bomid,
        serial: parseInt(serial) + 1
      }).update({
        kjgjs: yjgjs
      });
    } else {
      // 如果已加工件数+报废件数=第一条工艺的可加工件数，说明整个流程加工完成，则修改订单状态
      const bfjs = await this.model('scglxt_t_gygc').where({
        bomid: bomid
      }).sum('bfjs');
      const kjgjsFirst = await this.model('scglxt_t_gygc').where({
        bomid: bomid,
        serial: 0
      }).getField('kjgjs', true);
      const yjgjsLast = await this.model('scglxt_t_gygc').where({
        bomid: bomid,
        serial: serial
      }).getField('yjgjs', true);

      if (kjgjsFirst == (bfjs + yjgjsLast)) {
        await this.model('scglxt_t_bom').where({
          id: bomid
        }).update({
          zddzt: '0503'
        });
      }
    }

    return data;
  }
  // 质检全部通过
  // 如果是最后一道工序则更新BOM的状态
  async gygxCheckPassAllAction() {
    const {
      id,
      gygcid,
      jgryid,
      bomid,
      bfjs,
      serial
    } = this.post();

    try {
      const data = this.gygxCheckPass(id, bomid, gygcid, serial, bfjs);
      return this.success(data);
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '质检检验',
        error: JSON.stringify(ex),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
    }
  }

  // 检验部分通过
  async gygxCheckPassPartAction() {
    const {
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
    } = this.post();

    const jgglUpdate = {
      sfjy: '1',
      jysj: util.getNowTime(),
      jyryid: jyryid
    };
    const gygcUpdate = {
      yjgjs: jgjs - dhjs,
      sfjy: '1',
      jyryid: this.header('token'),
      status: 2,
      fgcs: 1,
      sjjs: 0
    };
    const jgglData = await this.model('scglxt_t_jggl').where({
      id: id
    }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find();

    // 生成打回记录
    const tmpLogData = jgglData;
    tmpLogData.id = util.getUUId();
    tmpLogData.sjzt = sjzt;
    tmpLogData.dhjs = dhjs;
    tmpLogData.dhyy = dhyy;
    tmpLogData.jyryid = jyryid;
    tmpLogData.jysj = util.getNowTime();

    await this.model('scglxt_t_jggl_tmp').add(tmpLogData);
    const bomData = await this.model('scglxt_t_bom').where({
      id: bomid
    }).find();
    let data = {};
    // 返工
    if (sjzt == '2201') {
      await this.model('scglxt_t_gygc').where({
        id: gygcid
      }).update(gygcUpdate);

      gygcUpdate.fgcs = "(select count(*) from scglxt_t_jggl_tmp where jgglid='" + id + " and sjzt='2201')+1";
      data = await this.model('scglxt_t_jggl').where({
        id: id
      }).update(jgglUpdate);
    } else { // 报废，重新生成BOM从头开始加工
      gygcUpdate.bfjs = dhjs;
      await this.model('scglxt_t_gygc').where({
        id: gygcid
      }).update(gygcUpdate);

      const newbomid = util.getUUId();

      data = await this.model('scglxt_t_bom').where({
        id: bomid
      }).update({
        bfjs: dhjs
      });
      bomData.id = newbomid;
      bomData.zddmc = bomData.zddmc + '_报废重做';
      bomData.zddzt = '0501';
      bomData.jgsl = dhjs;
      bomData.clzt = '3';
      bomData.rksj = null;
      bomData.cksj = null;
      bomData.blkssj = null;
      bomData.bljssj = null;
      bomData.sjcjsj = util.getNowTime();

      await this.model('scglxt_t_bom').add(bomData);

      const gygxDatas = await this.model('scglxt_t_gygc').where({
        bomid: bomid
      }).select();

      if (gygxDatas.length > 0) {
        gygxDatas.map(item => {
          item.id = util.getUUId();
          item.bomid = newbomid;
          item.kjgjs = 0;
          item.yjgjs = 0;
          item.sjjs = 0;
          item.bfjs = 0;
          item.sfjy = null;
          item.czryid = null;
          item.kssj = null;
          item.jssj = null;
          item.status = null;
          item.jyryid = null;
          item.fgcs = null;
          item.sjcjsj = util.getNowTime();
          return item;
        });
        data = await this.model('scglxt_t_gygc').addMany(gygxDatas);

        // 如果报废件数=订单件数则该零件直接出库，如果报废件数少于订单件数则剩余件数继续走下一道工序
        if (jgjs == dhjs) {
          await this.model('scglxt_t_bom').where({
            id: bomid
          }).update({
            zddzt: '0506'
          });
        } else {
          const nextJGgy = await this.model('scglxt_t_gygc').where({
            bomid,
            serial: parseInt(serial) + 1
          }).select();
          // 更新下一道工序
          // 如果有下一到工序则更新开始下一道工序的可加工数量
          if (nextJGgy.length == 1) {
            await this.model('scglxt_t_gygc').where({
              bomid: bomid,
              serial: parseInt(serial) + 1
            }).update({
              kjgjs: jgjs - dhjs
            });
          } else {
            // 如果已加工件数+报废件数=第一条工艺的可加工件数，说明整个流程加工完成，则修改订单状态
            const bfjs = await this.model('scglxt_t_gygc').where({
              bomid: bomid
            }).sum('bfjs');
            const kjgjsFirst = await this.model('scglxt_t_gygc').where({
              bomid: bomid,
              serial: 0
            }).getField('kjgjs', true);
            const yjgjsLast = await this.model('scglxt_t_gygc').where({
              bomid: bomid,
              serial: serial
            }).getField('yjgjs', true);

            if (kjgjsFirst == (bfjs + yjgjsLast)) {
              await this.model('scglxt_t_bom').where({
                id: bomid
              }).update({
                zddzt: '0503'
              });
            }
          }
        }
      }

      const errorLog = {
        id: util.getUUId(),
        type: '质检报废成功',
        infos: JSON.stringify(this.post()),
        operater: this.header('token')
      };
      await this.model('operate_log').add(errorLog);
    }

    const updateJggl = {
      jysj: util.getNowTime(),
      sfjy: '1',
      jyryid: jyryid,
      bfjs: dhjs
    };
    // 更新该条加工信息的检验信息
    await this.model('scglxt_t_jggl').where({
      id: id
    }).update(updateJggl);

    return this.success(data);
  }

  // 检验全部打回
  // 打回第一步：先生成打回记录
  // 打回第三步：修改加工工艺的返工次数
  // 打回第二步：删掉已加工的加工记录
  async gygxCheckNoPassAction() {
    const {
      id,
      gygcid,
      jyryid,
      dhjs,
      dhyy,
      jgjs,
      yjgjs
    } = this.post();

    const jgglData = await this.model('scglxt_t_jggl').where({
      id: id
    }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find();

    // 生成打回记录
    const tmpLogData = jgglData;
    tmpLogData.id = util.getUUId();
    tmpLogData.sjzt = '2201';
    tmpLogData.dhjs = dhjs;
    tmpLogData.dhyy = dhyy;
    tmpLogData.jyryid = jyryid;
    tmpLogData.jysj = util.getNowTime();

    await this.model('scglxt_t_jggl_tmp').add(tmpLogData);

    const count = await this.model('scglxt_t_jggl_tmp').where({
      jgglId: id
    }).count();

    const gygcUpdate = {
      sjjs: 0,
      fgcs: count,
      czryid: null,
      yjgjs: 0,
      status: 1,
      kssj: null,
      jssj: null,
      jyryid: null
    };

    await this.model('scglxt_t_gygc').where({
      id: gygcid
    }).update(gygcUpdate);

    const data = await this.model('scglxt_t_jggl').where({
      id: id
    }).delete();

    const errorLog = {
      id: util.getUUId(),
      type: '删除加工记录成功',
      operater: this.header('token'),
      infos: JSON.stringify(this.post())
    };
    await this.model('operate_log').add(errorLog);

    return this.success(data);
  }

  // 质检让步接收
  // 先通过质检再生成让步接收日志
  async gygxCheckRBJSAction() {
    const {
      id,
      bomid,
      gygcid,
      serial,
      bfjs,
      dhjs,
      dhyy,
      sjzt
    } = this.post();
    const data = this.gygxCheckPass(id, bomid, gygcid, serial, bfjs);

    if (data) {
      const jgglData = await this.model('scglxt_t_jggl').where({
        id: id
      }).field('jgryid,jgjs,jyryid,jgkssj,jgjssj,jysj,sbid,gygcid,id jgglid').find();

      // 生成打回记录
      const tmpLogData = jgglData;
      tmpLogData.id = util.getUUId();
      tmpLogData.sjzt = sjzt;
      tmpLogData.dhjs = dhjs;
      tmpLogData.dhyy = dhyy;
      tmpLogData.jyryid = this.header('token');
      tmpLogData.jysj = util.getNowTime();

      await this.model('scglxt_t_jggl_tmp').add(tmpLogData);
    }
    return this.success(data);
  }
  // 工艺排序
  async orderTopAction() {
    const row = this.post('row');
  }

  // 人工手动调整加工记录表，如若出现错误，可手动调整
  async updateJGJLAction() {
    const id = this.post('id');
    const form = this.post('form');
    const data = await this.model('scglxt_t_jggl').where({id: id}).update(form);

    const errorLog = {
      id: util.getUUId(),
      type: '加工记录修正',
      operater: this.header('token'),
      infos: JSON.stringify(this.post())
    };
    await this.model('operate_log').add(errorLog);

    return this.success(data);
  }

  // 手工删除加工记录
  async deleteJGJLAction() {
    const id = this.post('id');

    const data = await this.model('scglxt_t_jggl').where({id: id}).delete();

    const errorLog = {
      id: util.getUUId(),
      type: '删除加工记录',
      operater: this.header('token'),
      infos: JSON.stringify(this.post())
    };
    await this.model('operate_log').add(errorLog);

    return this.success(data);
  }

  // 手工增加报废日志，删除工时
  async sureManualScrapAction() {
    const jgglData = util.lowerJSONKey(this.post('jggl'));
    const bomid = this.post('bomid');
    const dhjs = this.post('dhjs');
    const dhyy = this.post('dhyy');
    const isAdd = this.post('isAdd');

    const bomData = await this.model('scglxt_t_bom').where({
      id: bomid
    }).find();

    // 第一步：更新bom的报废数量，第二步：增加报废操作记录，第三步：删除已操作的加工记录，第四步
    await this.model('scglxt_t_bom').where({id: bomid}).update({
      bfjs: dhjs
    });
    const oldJgglID = jgglData.id;

    const tmpLogData = jgglData;
    tmpLogData.id = util.getUUId();
    tmpLogData.jgglid = oldJgglID;
    tmpLogData.sjzt = '2202';
    tmpLogData.dhjs = dhjs;
    tmpLogData.dhyy = dhyy;

    await this.model('scglxt_t_jggl_tmp').add(tmpLogData);

    // 修改
    await this.model('scglxt_t_gygc').where({
      id: jgglData.gygcid
    }).decrement('yjgjs', dhjs);

    await this.model('scglxt_t_gygc').where({
      id: jgglData.gygcid
    }).update({
      bfjs: dhjs
    });

    const ids = await this.model('scglxt_t_gygc').where({
      bomid,
      serial: ['>', parseInt(jgglData.serial)]
    }).getField('id');

    // 如果报废件数=订单件数则该零件直接出库，删除该工序以后所有的加工工序
    if (bomData.jgjs == dhjs) {
      if (ids.length > 0) {
        // 修改
        await this.model('scglxt_t_gygc').where({
          id: ['in', ids],
          status: ['in', '1,2']
        }).decrement('kjgjs', dhjs);

        await this.model('scglxt_t_gygc').where({
          bomid,
          serial: ['>', parseInt(jgglData.serial)],
          status: ['in', '1,2']
        }).decrement('yjgjs', dhjs);
      }

      // 修改加工记录数据
      await this.model('scglxt_t_jggl').where({
        id: oldJgglID
      }).delete();
      await this.model('scglxt_t_jggl').where({
        gygcid: ['in', ids]
      }).delete();
    } else {
      if (ids.length > 0) {
        // 修改
        await this.model('scglxt_t_gygc').where({
          id: ['in', ids]
        }).decrement('kjgjs', dhjs);

        await this.model('scglxt_t_gygc').where({
          bomid,
          serial: ['>', parseInt(jgglData.serial)],
          status: '2'
        }).decrement('yjgjs', dhjs);
      }

      // 修改加工记录数据
      await this.model('scglxt_t_jggl').where({
        id: oldJgglID
      }).decrement('jgjs', dhjs);
      await this.model('scglxt_t_jggl').where({
        id: oldJgglID
      }).update({
        bfjs: dhjs
      });
      await this.model('scglxt_t_jggl').where({
        gygcid: ['in', ids]
      }).decrement('jgjs', dhjs);
    }

    // 如果需要生成新的加工单，则自动录入数据
    if (isAdd === 1) {
      const newbomid = util.getUUId();

      bomData.id = newbomid;
      bomData.zddmc = bomData.zddmc + '_报废重做';
      bomData.zddzt = '0501';
      bomData.jgsl = dhjs;
      bomData.clzt = '3';
      bomData.rksj = null;
      bomData.cksj = null;
      bomData.blkssj = null;
      bomData.bljssj = null;
      bomData.sjcjsj = util.getNowTime();

      await this.model('scglxt_t_bom').add(bomData);

      const gygxDatas = await this.model('scglxt_t_gygc').where({
        bomid: bomid
      }).select();

      if (gygxDatas.length > 0) {
        gygxDatas.map(item => {
          item.id = util.getUUId();
          item.bomid = newbomid;
          item.kjgjs = 0;
          item.yjgjs = 0;
          item.sjjs = 0;
          item.bfjs = 0;
          item.sfjy = null;
          item.czryid = null;
          item.kssj = null;
          item.jssj = null;
          item.status = null;
          item.jyryid = null;
          item.fgcs = null;
          item.sjcjsj = util.getNowTime();
          return item;
        });
        await this.model('scglxt_t_gygc').addMany(gygxDatas);
      }
    }

    // 生成操作日志
    const errorLog = {
      id: util.getUUId(),
      type: '手工报废成功',
      infos: JSON.stringify(this.post()),
      operater: this.header('token')
    };
    const sData = await this.model('operate_log').add(errorLog);

    return this.success(sData);
  }

  // 车间工艺剩余工时列表
  async getSygsListAction() {
    const data = await this.model('v_scglxt_sygs').group('gynr').field('gynr,sum(sygs) AS sum').select();

    return this.success(data);
  }
};
