import {
    debug
} from 'util';
import util from '../../utils/util'
const Base = require('./base.js');
const fs = require('fs');
const path = require('path');

module.exports = class extends Base {
    // 获取资源列表
    async uploadAction() {
        let themefile = this.file('file');
        let filepath = themefile.path; //为防止上传的时候因文件名重复而覆盖同名已上传文件，path是MD5方式产生的随机名称
        let uploadpath = think.ROOT_PATH + '/www/static/upload/';
        // let uploadpath = '/upload/';

        think.mkdir(uploadpath); //创建该目录
        //提取出用 ‘/' 隔开的path的最后一部分。

        let newFileName = path.basename(filepath);
        //将上传的文件（路径为filepath的文件）移动到第二个参数所在的路径，并改为第二个参数的文件名。
        themefile.path = uploadpath + newFileName;

        fs.rename(filepath, uploadpath + newFileName, function (err) {
            if (err) {
                console.log(err)
            }
        })
        //读取压缩文件信息存数据库

        let zip = new JSZip();

        this.success(themefile);
    }

    // 上传附件
    async uploadFileAction() {
        let type = this.post('type');
        let query = this.post('query');
        let tableId = this.post('tableId')
        let column_name = this.post('column_name')

        let columnData = await this.model('resource_table_column').where({
            table_id: tableId,
            column_name: column_name
        }).find()

        if (!think.isEmpty(this.file('file'))) {
            //进行压缩等处理
            let file = think.extend({}, this.file('file'));

            //保存文件的路径
            let savepath = think.ROOT_PATH + '/../upload/' + type + '/' + query + '/';
            think.mkdir(savepath); //创建该目录
            let filepath = file.path; //文件路径
            let filename = file.name; //文件名
            let suffix = filename.substr(filename.lastIndexOf('.') + 1); //文件后缀

            //读文件
            let datas = fs.readFileSync(filepath);
            //写文件
            fs.writeFileSync(savepath + filename, datas);
            let newpath = savepath + filename;
            file.path = newpath

            let tzData = {
                id: util.getUUId(),
                fjlx: suffix,
                name: filename,
                fjdz: file.path,
                url: 'upload/' + type + '/' + query + '/' + filename
            }
            tzData[columnData.FOREIGNKEY_TABLE_COLUMN] = query
            let data = await this.model(columnData.FOREIGNKEY_TABLENAME).add(tzData)
            return this.success(file)
        }
    }

    //删除上传图纸信息
    async deleteFileAction() {
        let ssdd = this.post('ssdd')
        let id = this.post('id')

        let data = this.model('scglxt_t_dd_tz').where({
            id: id
        }).delete()

        return this.success(data)
    }


};