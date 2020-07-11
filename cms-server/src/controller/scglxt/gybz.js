
/**
 * 加工工艺操作的接口
 */
import util from '../../../utils/util';
const Base = require('../base.js');

const gyModel = 'scglxt_t_gygc_bz';
module.exports = class extends Base {
  // 获取标准列表
  async getGyBzListAction() {
    const data = await this.model('scglxt_t_gybz').select();
    return this.success(data);
  }

  async getGyByBzIdAction() {
    const bzid = this.get('bzid');
    const data = await this.model(gyModel).where({ssbz: bzid}).join({ table: 'scglxt_t_sblx', as: 'sblx', join: 'left', on: ['sbid', 'id'] }).join({ table: 'scglxt_t_jggy', as: 'jggy', join: 'left', on: ['gynr', 'id'] }).order('serial asc').field('scglxt_t_gygc_bz.* ,jggy.gymc, sblx.mc sbmc').select();
    return this.success(data);
  }

  /**
     * 保存工艺
     * 1.
     * @returns
     */
  async addGyBzManyAction() {
    const form = this.post('form');
    let rows = null;
    try {
      const whereObj = {
        ssbz: form[0].ssbz
      };
      rows = await this.model(gyModel).where(whereObj).select();

      await this.model(gyModel).where(whereObj).delete();

      const data = await this.model(gyModel).addMany(form, {pk: 'ID'});
      return this.success(data);
    } catch (ex) {
      await this.model(gyModel).addMany(rows, {pk: 'ID'});

      return this.fail(ex);
    }
  }
  // 删除工艺标准
  async deleteGyBzByIdAction() {
    const id = this.post('id');
    try {
      await this.model(gyModel).where({bzid: id}).delete();
      const data = await this.model('scglxt_t_gybz').where({id: id}).delete();

      return this.success(data);
    } catch (ex) {
      return this.fail(ex);
    }
  }

  // 根据当前BOM的工艺自动生成标准工艺
  async addBzGyByBomIdAction() {
    const bomid = this.post('bomid');
    const bomName = await this.model('scglxt_t_bom').where({id: bomid}).getField('zddmc', true);
    const rows = await this.model('scglxt_t_gygc').where({bomid}).select();
    const bzData = {
      id: util.getUUId(),
      gybzmc: bomName
    };
    const bzgyData = [];
    rows.map(item => {
      bzgyData.push({
        id: util.getUUId(),
        bzgs: 0,
        zbgs: 0,
        ssbz: bzData.id,
        gynr: item.gynr,
        edgs: item.edgs,
        serial: item.serial,
        sbid: item.sbid,
        zysx: item.zysx
      });
    });
    await this.model('scglxt_t_gybz').add(bzData);
    const data = await this.model(gyModel).addMany(bzgyData);
    return this.success(data);
  }
};
