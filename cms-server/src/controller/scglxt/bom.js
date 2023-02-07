/**
 * Bom卡操作的接口
 */
import util from '../../../utils/util';
const Base = require('../base.js');
const bomModel = 'scglxt_t_bom';
const gyModel = 'scglxt_t_gygc';

module.exports = class extends Base {
  async indexAction() {
    const data = await this.model(bomModel).select();
    return this.success(data);
  }

  // 删除
  async deleteBOMAction() {
    const id = this.post('id');
    const whereObj = {};
    const complex = {
      _logic: 'or'
    };
    complex['gygcid'] = ['in', `select id from scglxt_t_gygc where bomid='` + id + `'`];
    whereObj._complex = complex;
    await this.model('scglxt_t_jggl').where(
      `gygcid in (select id from scglxt_t_gygc where bomid='` + id + `')`
    ).delete();
    await this.model(gyModel).where({
      bomid: id
    }).delete();

    const deleteData = await this.model('scglxt_t_bom').where({
      id: id
    }).delete();

    return this.success(deleteData);
  }

  // 新增BOM
  async addBomAction() {
    const form = this.post('form');
    // 将订单级别取过来更新到BOM中
    const {
      zddjb,
      endtime
    } = await this.model('scglxt_t_dd').where({
      id: form.ssdd
    }).getField('ddlevel,endtime', true);
    form.zddjb = zddjb;
    form.endtime = endtime;
    const data = await this.model(bomModel).add(form);

    // let zj = this.post('zj')

    // let bzjData = await this.model('scglxt_t_bom_zj').addMany(zj,{pk: 'ID'});

    return this.success(data);
  }
  // 根据报价单批量增加BOM数据
  async addBomManyAction() {
    const form = this.post('form');
    const ssdd = this.post('ssdd');
    const ssht = this.post('ssht');
    const vm = this;
    const pArr = [];
    const ddinfo = await this.model('scglxt_t_dd').where({
      ssht: ssht
    }).field('id,ddlevel,endtime').find();
    for (let i = 0; i < form.length; i++) {
      form[i].zddjb = ddinfo.ddlevel;
      form[i].ssdd = ddinfo.id;
      form[i].endtime = ddinfo.endtime;
      pArr.push(vm.getData(form[i]));
    }
    const data = {};
    Promise.all(pArr).then(async() => {
      // data = await this.model(bomModel).addMany(form, {
      //     pk: 'ID'
      // });
    });
    return vm.success(data);
  }

  // 根据报价单批量增加BOM数据
  async addBomAllAction() {
    // const form = this.post('form');
    const ssdd = this.post('ssdd');
    const ssht = this.post('ssht');
    const vm = this;
    
    const ddinfo = await this.model('scglxt_t_dd').where({
      ssht: ssht
    }).field('id,ddlevel,endtime').find();

    const sql = `insert into scglxt_t_bom (id,zddmc, zddcz,jgsl,bmcl,gs,ddtz,ssdd,zddzt,clzl,cldx,bljs,bjdid,zddjb,endtime,xh)` +
    `SELECT id,ljmc zddmc,cz zddcz,sl jgsl,'' bmcl,0 gs,th ddtz,'` + ddinfo.id + `' ssdd,'0501' zddzt,0 clzl,0 cldx,sl bljs,id bjdid,'` + ddinfo.ddlevel + `' zddjb,'` + ddinfo.endtime + `' endtime,xh from scglxt_t_ht_bjd where ssht='` + ssht + `' and ljmc<>'' order by xh+0 asc`
    
    const data = await this.model().query(sql);

    return vm.success(data);
  }

  getData(item) {
    const vm = this;
    return new Promise(async resolve => {
      await vm.model(bomModel).add(item, {
        pk: 'ID'
      });
      resolve();
    });
  }
  // 编辑BOM
  async editBomAction() {
    const form = this.post('form');
    const primaryKey = this.post('primaryKey');
    const oldData = await this.model(bomModel).where(primaryKey).find();

    const data = await this.model(bomModel).where(primaryKey).update(form);

    await this.model('scglxt_t_gygc').where({
      bomid: primaryKey.id
    }).update({
      ssdd: form.ssdd
    });

    // 编辑BOM时，查询是否有已开始加工的工艺，确认是否修改加工数量，如果有同步更新工艺，如果没有则不处理
    if (oldData.jgsl !== form.jgsl) {
      await this.model('scglxt_t_gygc').where({
        bomid: primaryKey.id,
        kjgjs: ['!=', 0]
      }).update({
        kjgjs: form.jgsl
      });
    }

    return this.success(data);
  }

  // 复制BOM
  async copyBomAction() {
    const form = this.post('form');
    const primaryKey = this.post('primaryKey');

    const {
      zddjb,
      endtime
    } = await this.model('scglxt_t_dd').where({
      id: form.ssdd
    }).getField('ddlevel,endtime', true);
    form.zddjb = zddjb;
    form.zddzt = '0501';
    form.clzt = null;
    form.endtime = endtime;
    form.sjcjsj = util.getNowTime();
    form.blkssj = null;
    form.bljssj = null;
    form.cksj = null;
    form.rksj = null;
    form.id = util.getUUId();

    // 添加BOM
    const data = await this.model(bomModel).add(form);

    const gyList = await this.model('scglxt_t_gygc').where({
      bomid: primaryKey.id
    }).order('serial').select();
    if (gyList.length > 0) {
      gyList.map((item, i) => {
        item.id = util.getUUId();
        item.bomid = form.id;
        item.kjgjs = 0;
        item.yjgjs = 0;
        item.sjjs = 0;
        item.bfjs = 0;
        item.serial = i;
        item.status = null;
        item.sfjy = null;
        item.kssj = null;
        item.jssj = null;
        item.czryid = null;
        item.jyryid = null;
        item.sfwx = null;
        item.ssdd = form.ssdd;
        return item;
      });

      const addgy = await this.model('scglxt_t_gygc').addMany(gyList, {
        pk: 'ID'
      });
    }
    return this.success(data);
  }
  // 根据bomId获取相关组件
  async getZjByBomIdAction() {
    const bomid = this.get('bomid');
    const data = await this.model('scglxt_t_bom_zj').where({
      bomid: bomid
    }).select();

    return this.success(data);
  }
  // 获取需要备料的数据列表
  async getBLlistAction() {
    const clid = this.get('clid');
    // let cldata = await this.model().query("select ID,'' SSDD,'' SSDD_TEXT,ID ZDDCZ,CLMC ZDDCZ_TEXT,'' ZDDMC,'' ZDDJB from scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')")
    // let cldata = await this.model().query("select ID,CLMC,CLDJ,CLSL,MI CLMD from  scglxt_t_cl where id in (select zddcz from scglxt_t_bom where (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='')")
    const blList = await this.model().query("SELECT BLJS,CLDX,CLJE,CGSJ,CLTJ,CLZL,ID,JGSL,SSDD,(SELECT NAME FROM (SELECT id,xmname NAME FROM scglxt_t_dd) tras WHERE tras.id=SSDD) SSDD_TEXT,ZDDCZ,(SELECT NAME FROM (SELECT id,clmc NAME FROM scglxt_t_cl) tras WHERE tras.id=ZDDCZ) ZDDCZ_TEXT,ZDDMC,CKSJ,CLZT,ZDDJB FROM `SCGLXT_T_BOM` WHERE ( (clzt IS NULL or clzt=0 or clzt =2) AND cldx!='' ) And ssdd= '" + clid + "' ORDER BY zddcz,zddjb ");
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

    return this.success(blList);
  }
  // 修改备料状态，备料成功后更新第一条工艺为可加工状态
  async updateBLZTAction() {
    const vm = this;
    const {
      id,
      clzt,
      cgyj,
      cgry
    } = this.post();
    let data = '';
    try {
      let updateSql = '';
      // 如果是同时更新多条
      if (id.indexOf(',') != '-1') {
        data = await this.model(bomModel).where({
          id: ['in', id]
        }).update({
          clzt: clzt,
          bljssj: util.getNowTime(),
          cgsj: cgyj,
          cgry: cgry == undefined ? '' : cgry
        });

        const arrs = id.split(',');
        if (clzt != 0) {
          //     arrs.map(async item => {
          //         updateSql = `UPDATE scglxt_t_gygc gygc SET status=0,kjgjs= (SELECT bom.jgsl FROM  scglxt_t_bom bom  WHERE  bom.id = gygc.bomid)
          // WHERE gygc.bomid = '` + item + `' AND gygc.serial = '0'`
          //         await this.model().execute(updateSql)
          //     })
          let jgjsList = [],
            pArr = [];
          arrs.map(async item => {
            pArr.push(vm.updateBLZTData(jgjsList, item));
          });
          if (pArr.length > 0) {
            await Promise.all(pArr);
          }
        }
      } else {
        const data = await this.model(bomModel).where({
          id: ['in', id]
        }).update({
          clzt: clzt,
          bljssj: util.getNowTime(),
          cgsj: cgyj,
          cgry: cgry == undefined ? '' : cgry
        });

        if (cgyj != undefined && cgyj != null && cgyj != '') {
          return this.success(data);
        } else {
          if (clzt != 0) {
            updateSql = `UPDATE scglxt_t_gygc gygc SET status=0,kjgjs= (SELECT bom.jgsl FROM  scglxt_t_bom bom  WHERE  bom.id = gygc.bomid)
                        WHERE gygc.bomid = '` + id + `' AND gygc.serial = '0'`;
            const updated = await this.model().execute(updateSql);
            return this.success(updated);
          }
        }
      }
      return this.success(data);
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '备料操作',
        error: '批量备料报错',
        operater: this.header('token'),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
      return this.fail({
        errno: 200,
        errmsg: '更新BOM加工数量出错！'
      });
    }
  }
  // 批量更新备料状态并且更新对应BOM的加工件数
  updateBLZTData(jgjsList, bomid) {
    const vm = this;

    return new Promise(async resolve => {
      // const jgsl = await this.model(bomModel).where({
      //   id: bomid
      // }).getField('jgsl');

      jgjsList.push(new Promise(async resolve => {
        // await this.model('scglxt_t_gygc').where({
        //   bomid: bomid,
        //   serial: '0'
        // }).alias('gygc').update({
        //   status: 0,
        //   kjgjs: jgsl[0]
        // });
        const updateSql = `UPDATE scglxt_t_gygc gygc SET status=0,kjgjs= (SELECT bom.jgsl FROM  scglxt_t_bom bom  WHERE  bom.id = gygc.bomid)
        WHERE gygc.bomid = '` + bomid + `' AND gygc.serial = '0'`;
        await this.model().execute(updateSql);
        resolve();
      }));
      resolve();
    });
  }
  // 获取生产情况跟踪数据
  async getGYgslistAction() {
    const ddid = this.post('ddid');

    const sql = `
        select t.*,fun_dqgygc1 (bom.id) ddjd,bom.zddmc,bom.zddcz,jgsl,DATE_FORMAT(starttime,'%Y-%m-%d') starttime,DATE_FORMAT(endtime,'%Y-%m-%d') endtime from (
            SELECT id bomid ,
                sum(CASE gynr WHEN '201609010949574021' THEN sygs ELSE 0 END ) '线切割',
                sum(CASE gynr WHEN '201609010949574022' THEN sygs ELSE 0 END ) '铣',
                sum(CASE gynr WHEN '201609010949574025' THEN sygs ELSE 0 END ) '钳',
                     sum(CASE gynr WHEN '201609010949574023' THEN sygs ELSE 0 END ) '注塑',
                     sum(CASE gynr WHEN '201609010949574024' THEN sygs ELSE 0 END ) '车',
                      sum(CASE gynr WHEN '201609010949574026' THEN sygs ELSE 0 END ) 'CNC',
                         sum(CASE gynr WHEN '201609010949574027' THEN sygs ELSE 0 END ) '电火花',
                     sum(CASE gynr WHEN '201609010949574028' THEN sygs ELSE 0 END ) '磨',
                      sum(CASE gynr WHEN '20170424203552800' THEN sygs ELSE 0 END ) '热处理',
                         sum(CASE gynr WHEN '20170724160856037' THEN sygs ELSE 0 END ) '焊接',
                          sum(CASE gynr WHEN '20170524144646657' THEN sygs ELSE 0 END ) '外协'
            FROM v_scglxt_sygs_bom group by id) t,scglxt_t_bom bom where t.bomid = bom.id and bom.ssdd=` + ddid;
    const data = await this.model().query(sql);
    return this.success(data);
  }

  // BOM单终检通过
  async BOMFinallyCheckAction() {
    const id = this.post('id');

    const data = await this.model(bomModel).where({
      id: ['in', id]
    }).update({
      zddzt: '0504'
    });

    return this.success(data);
  }

  // BOM单入库
  async BOMInStoreAction() {
    const id = this.post('id');

    const data = await this.model(bomModel).where({
      id: ['in', id]
    }).update({
      zddzt: '0505',
      rksj: util.getNowTime()
    });

    return this.success(data);
  }

  // 批量更新BOM出库状态
  getOutData(updateList, ssdd) {
    const vm = this;
    return new Promise(async resolve => {
      const wjData = await this.model(bomModel).where({
        ssdd: ssdd,
        zddzt: ['in', ['0501','0502','0503','0504','0505']]
      }).select();
      if (wjData.length === 0) {
        updateList.push(ssdd);
      }
      resolve();
    });
  }
  // BOM单出库
  async BOMOutStoreAction() {
    const id = this.post('id');
    const _this = this;
    try {
      const data = await this.model(bomModel).where({
        id: ['in', id]
      }).update({
        zddzt: '0506',
        cksj: util.getNowTime()
      });

      const bomData = await this.model(bomModel).where({
        id: ['in', id]
      }).select();

      const pArr = [];
      // 如果是批量操作
      if (bomData.length > 1) {
        const updateList = [];
        bomData.map(async item => {
          pArr.push(_this.getOutData(updateList, item.ssdd));
        });
        if (pArr.length > 0) {
          await Promise.all(pArr).then(async() => {
            if (updateList.length > 0) {
              const sql = `update scglxt_t_dd set ckzt='完成',ckdate=DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') where id in (` + updateList.join(',') + `)`;
              const ddData = await this.model().execute(sql);
            }
          });
        }
      } else {
        const allBom = await this.model(bomModel).where({
          ssdd: bomData[0].ssdd,
          zddzt: ['in', ['0501','0502','0503','0504','0505']]
        }).select();
        console.log('ddd',allBom)
        // 如果该订单下所有BOM都完成了就更新订单状态为完成
        if (allBom.length == 0) {
          const sql = `update scglxt_t_dd set ckzt='完成',ckdate=DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') where id=(select ssdd from scglxt_t_bom where id='` + id + `')`;
          const ddData = await this.model().execute(sql);
        }
      }

      // 出库后，形成出库单记录，可以查看
      const infos = await this.model('scglxt_t_bom').where({
        id: ['in', id]
      }).select();
      const ddinfos = await this.model('scglxt_t_dd').where({
        id: infos[0].ssdd
      }).find();
      const names = [];
      if (infos.length > 0) {
        infos.map(item => {
          names.push(item.zddmc);
        });
      }
      const ckLog = {
        id: util.getUUId(),
        cksj: util.getNowTime(),
        ckr: this.header('token'),
        ssdd: ddinfos.id,
        ddmc: ddinfos.xmname,
        ssht: ddinfos.ssht,
        ckinfo: names.join(',')
      };
      await this.model('scglxt_t_dd_ck').add(ckLog);

      const sql = `SELECT '${ckLog.id}' as 'ckid', bom.id,kh.mc khmc,ht.htbh,dd.xmname ddmc,zddmc ljmc,bom.jgsl ljsl,bjd.dj ljdj,format(bjd.zje,3) ljzj,NOW() cksj FROM scglxt_t_kh kh,scglxt_t_ht ht,scglxt_t_dd dd,scglxt_t_bom bom LEFT JOIN scglxt_t_ht_bjd bjd ON bom.bjdid=bjd.id WHERE kh.id=ht.khid AND ht.id=dd.ssht AND dd.id=bom.ssdd AND bom.id IN (${id})`;

      // 出库详细记录
      const logInfos = await this.model().query(sql);
      await this.model('scglxt_t_dd_ck_log').addMany(logInfos);

      return this.success(data);
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '成品出库失败',
        error: ex,
        infos: JSON.stringify(this.post()),
        operater: this.header('token')
      };
      await this.model('operate_log').add(errorLog);
      return this.fail(ex);
    }
  }

  // bom 进度
  async BOMSpeedProgressAction() {
    const ddid = this.post('ssdd');
    const sql = `SELECT t.id,dd.xmname ddmc,zd2.mc zddztmc,zddmc,zddjb,date_format(dd.endtime,'%Y-%m-%d') ddendtime,zd.mc zddjbmc,clxz,bmcl,t.jgsl,date_format(t.starttime,'%Y-%m-%d') starttime,date_format(t.endtime,'%Y-%m-%d') endtime,gs,fun_dqgygc1 (t.id) ddjd FROM scglxt_t_bom t,scglxt_t_dd dd,scglxt_tyzd zd,scglxt_tyzd zd2 WHERE t.SSDD=dd.id AND t.zddjb=zd.id AND zd.id LIKE '04%' AND t.zddzt=zd2.ID AND zd2.xh LIKE '05__' and dd.id ='` + ddid + `' ORDER BY dd.endtime,zddjb`;
    const data = await this.model().query(sql);
    return this.success(data);
  }

  //* *成品转入备用库存以便下次使用 */
  async BOMInSpareStockAction() {
    const id = this.post('id');
    const kcsl = this.post('kcsl');
    const data = await this.model('scglxt_t_bom').where({
      id: id
    }).find();

    const sjsl = parseInt(data.jgsl) - parseInt(kcsl);
    data.jgsl = kcsl;
    const insert = await this.model('scglxt_t_bom_byk').add(data);
    await this.model('scglxt_t_bom').where({
      id: id
    }).update({
      jgsl: sjsl
    });

    const errorLog = {
      id: util.getUUId(),
      type: '转入备用库',
      infos: JSON.stringify(this.post()),
      operater: this.header('token')
    };
    await this.model('operate_log').add(errorLog);

    return this.success(insert);
  }

  // 修改bom的结束时间
  async uploadBOMEndTimeAction() {
    const list = this.post('list');
    let data = {};
    list.map(async item => {
      data = await this.model('scglxt_t_bom').where({
        id: item.bomid
      }).update({
        endtime: item.endtime
      });
    });

    return this.success(data);
  }

  // 获取BOM零件的备用库存
  async getBOMBykcAction() {
    const name = this.post('name');
    const data = await this.model('scglxt_t_bom_byk').where({
      zddmc: name
    }).select();

    return this.success(data);
  }

  // 关联备用库存

  async setBOMBykcAction() {
    const form = this.post();
    form.id = util.getUUId();
    form.czryid = this.header('token');
    form.sfck = 0;

    const data = await this.model('scglxt_t_bom_byk_log').add(form);

    const jgsl = await this.model('scglxt_t_bom_byk').where({
      id: form.bykcid
    }).getField('jgsl');

    await this.model('scglxt_t_bom_byk').where({
      id: form.bykcid
    }).update({
      jgsl: jgsl - form.sysl
    });

    return this.success(data);
  }

  // 停止加工
  async stopBOMProcessAction() {
    const bomid = this.post('bomid');

    const data = await this.model('scglxt_t_bom').where({id: bomid}).update({
      zddzt: '0508'
    });

    const errorLog = {
      id: util.getUUId(),
      type: '停止加工',
      infos: JSON.stringify(this.post()),
      operater: this.header('token')
    };
    await this.model('operate_log').add(errorLog);

    return this.success(data);
  }

  // 获取所有备用库信息
  async getBykcListAction() {
    const data = await this.model('scglxt_t_bom_byk').field('id,zddmc,jgsl').where('jgsl > 0').select();

    return this.success(data);
  }

  // 通过BOM名称查询最新的bom对应的工艺编排
  async getGyByBzBomMCAction() {
    const bommc = this.get('bommc');
    const id = this.get('id');
    const bom = await this.model('scglxt_t_bom').field('id').where({zddmc: ['like', `%${bommc}%`], id: ['!=', id]}).order('sjcjsj desc').select();
    let data = [];
    if (bom.length > 0) {
      data = await this.model('scglxt_t_gygc').where({bomid: bom[0].id}).join({ table: 'scglxt_t_sblx', as: 'sblx', join: 'left', on: ['sbid', 'id'] }).join({ table: 'scglxt_t_jggy', as: 'jggy', join: 'left', on: ['gynr', 'id'] }).order('serial asc').field('scglxt_t_gygc.id,bomid,gynr,bzgs,edgs,zbgs,serial,sbid,zysx,ssdd,jggy.gymc,sblx.mc sbmc').select();
    }
    return this.success(data);
  }

  // 通过BOM名称查询对应最新的BOM材料信息
  async getInfoByBomMcAction() {
    const bommc = this.get('bommc');
    const id = this.get('id');
    const bom = await this.model('scglxt_t_bom').where({zddmc: ['like', `%${bommc}%`], id: ['!=', id]}).order('sjcjsj desc').select();

    return this.success(bom);
  }
};
