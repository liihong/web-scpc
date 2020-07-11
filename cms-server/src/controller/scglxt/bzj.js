/**
 * 组件操作的接口
 */
import util from '../../../utils/util';
const Base = require('../base.js');
const bzjModel = 'scglxt_t_bzj';
module.exports = class extends Base {
  /**
     * 根据标准件名称获取库存
     */
  async getBzjKCByNameAction() {
    const name = this.post('name');
    const data = await this.model(bzjModel).where({ljmc: ['like', '%' + name + '%']}).select();
    return this.success(data);
  }
  /**
     * 标注件入库
     */
  async inStoreBzjAction() {
    const form = this.post('form');
    const rkLog = [];
    const vm = this;
    form.map(item => {
      if (item.rksl && item.rksl !== 0) {
        const log = {
          id: util.getUUId(),
          ljmc: item.ljmc,
          ljsl: item.rksl,
          type: 'in',
          rjr: vm.header('token')
        };
        rkLog.push(log);
      }
    });
    const data = await this.model(bzjModel).updateMany(form);

    await this.model('scglxt_t_bzj_log').addMany(rkLog);
    return this.success(data);
  }

  async outStoreBzjAction() {
    const form = this.post('form');
    const rkLog = [];
    const vm = this;
    form.map(item => {
      if (item.rksl && item.rksl != 0) {
        const log = {
          id: util.getUUId(),
          ljmc: item.ljmc,
          ljsl: item.rksl,
          type: 'out',
          rjr: vm.header('token')
        };
        rkLog.push(log);
      }
    });
    const data = await this.model(bzjModel).updateMany(form);

    await this.model('scglxt_t_bzj_log').addMany(rkLog);
    return this.success(data);
  }
};
