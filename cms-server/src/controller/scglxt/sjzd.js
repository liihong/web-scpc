
/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
const sjzdModel = 'scglxt_tyzd';
module.exports = class extends Base {
  // 获取某一个BOM的工艺
  async getSjzdByIdAction() {
    const data = await this.model(sjzdModel).order('xh asc').where({'id': ['like', `${this.get('id')}__`]}).select();
    return this.success(data);
  }

  // 获取班组列表
  async getBzListAction() {
    const data = await this.model('scglxt_t_bz').select();
    return this.success(data);
  }

  // 获取某一个班组下所有的人员信息
  async getPeopleByBzAction() {
    const bzid = this.post('bzid');

    const data = await this.model('scglxt_t_ry').where({ssbz: bzid}).select();

    return this.success(data);
  }

  // 获取设备类型列表数据
  async getSBLXListAction() {
    const data = await this.model('scglxt_t_sblx').join({
      table: 'scglxt_t_jggy',
      join: 'left',
      on: ['ssgy', 'id']}).field('t.id,mc,ssgy,scglxt_t_jggy.gymc,bzcn').alias('t').order('ssgy').select();

    return this.success(data);
  }

  // 批量修改设备类型
  async updateSblxInfoAction() {
    const info = this.post();

    await this.model('scglxt_t_sblx').delete();
    const data = await this.model('scglxt_t_sblx').addMany(info);

    return this.success(data);
  }

  // 获取外协厂家
  async getAllWxCjAction() {
    const data = await this.model('scglxt_t_wxcj').select();

    return this.success(data);
  }
};
