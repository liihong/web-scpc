
/**
 * 报价单操作的接口
 */
import util from '../../../utils/util';
const Base = require('../base.js');
const bjdModel = 'scglxt_t_ht_bjd';
module.exports = class extends Base {
  // 审批合同
  async ht_sptgAction() {
    const htid = this.post('htid');
    const htbh = this.post('htbh');
    const spzt = this.post('spzt');
    const bhly = this.post('bhly');

    const data = await this.model('scglxt_t_ht').where({id: htid}).update({
      spzt: spzt
    });
    console.log(this.post());
    // 增加审批日志
    const logData = {
      id: util.getUUId(),
      htid: this.post('htid'),
      htbh: htbh,
      spzt: spzt,
      spr: this.header('token'),
      spyj: bhly
    };

    await this.model('scglxt_t_ht_splog').add(logData);

    return this.success(data);
  }

  // 根据ID获取某合同驳回理由
  async getHtSpyyAction() {
    const id = this.post('htid');
    const data = await this.model('scglxt_t_ht_splog').where({htid: id}).getField('spyj', true);
    return this.success(data);
  }
  /**
     * 成功上传报价单后，将报价单数据入库
     */
  async addBjdAction() {
    try {
      const form = this.post('form');
      const pArr = [];
      let zdj = 0;
      form.map(item => {
        item.id = util.getUUId();
        pArr.push(this.getCzId(item, item.cz));
        zdj = parseFloat(item.zje) + zdj;
      });
      let data = {};
      Promise.all(pArr).then(async() => {
        data = await this.model(bjdModel).addMany(form, {pk: 'ID'});
        // 更新合同的报价单总价
        await this.model('scglxt_t_ht').where({id: form[0].ssht}).update({bjdzj: zdj});
      });

      return this.success(data);
    } catch (ex) {
      const errorLog = {
        id: util.getUUId(),
        type: '上传报价单',
        error: JSON.stringify(ex),
        infos: JSON.stringify(this.post())
      };
      await this.model('operate_log').add(errorLog);
      return this.fail(ex);
    }
  }

  // 查询材质对应字典
  async getCzId(item, czmc) {
    const vm = this;
    return new Promise(async resolve => {
      const data = await this.model('scglxt_t_cl').where({
        clmc: czmc
      }).select();
      if (data.length > 0) {
        item.cz = data[0].id;
      }
      resolve();
    });
  }
};
