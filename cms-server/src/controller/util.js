import util from '../../utils/util';
const Base = require('./base.js');
const fs = require('fs');
const path = require('path');

module.exports = class extends Base {
  // 获取资源列表
  async uploadAction() {
    const themefile = this.file('file');
    const filepath = themefile.path; // 为防止上传的时候因文件名重复而覆盖同名已上传文件，path是MD5方式产生的随机名称
    const uploadpath = think.ROOT_PATH + '/www/static/upload/';
    // let uploadpath = '/upload/';

    think.mkdir(uploadpath); // 创建该目录
    // 提取出用 ‘/' 隔开的path的最后一部分。

    const newFileName = path.basename(filepath);
    // 将上传的文件（路径为filepath的文件）移动到第二个参数所在的路径，并改为第二个参数的文件名。
    themefile.path = uploadpath + newFileName;

    fs.rename(filepath, uploadpath + newFileName, function(err) {
      if (err) {
        console.log(err);
      }
    });
    // 读取压缩文件信息存数据库

    const zip = new JSZip();

    this.success(themefile);
  }

  // 上传附件
  async uploadFileAction() {
    const type = this.post('type');
    const query = this.post('query');
    const tableId = this.post('tableId');
    const column_name = this.post('column_name');

    const columnData = await this.model('resource_table_column').where({
      table_id: tableId,
      column_name: column_name
    }).find();

    if (!think.isEmpty(this.file('file'))) {
      // 进行压缩等处理
      const file = think.extend({}, this.file('file'));

      // 保存文件的路径
      const savepath = think.ROOT_PATH + '/../upload/' + type + '/' + query + '/';
      think.mkdir(savepath); // 创建该目录
      const filepath = file.path; // 文件路径
      const filename = file.name; // 文件名
      const suffix = filename.substr(filename.lastIndexOf('.') + 1); // 文件后缀

      // 读文件
      const datas = fs.readFileSync(filepath);
      // 写文件
      fs.writeFileSync(savepath + filename, datas);
      const newpath = savepath + filename;
      file.path = newpath;

      const tzData = {
        id: util.getUUId(),
        fjlx: suffix,
        name: filename,
        fjdz: file.path,
        url: '/upload/' + type + '/' + query + '/' + filename
      };
      tzData[columnData.FOREIGNKEY_TABLE_COLUMN] = query;
      const data = await this.model(columnData.FOREIGNKEY_TABLENAME).add(tzData);
      return this.success(file);
    }
  }

  // 删除上传图纸信息
  async deleteFileAction() {
    const ssdd = this.post('ssdd');
    const id = this.post('id');

    const data = this.model('scglxt_t_dd_tz').where({
      id: id
    }).delete();

    return this.success(data);
  }
};
