import { debug } from 'util';

const Base = require('./base.js');
const fs = require('fs');
const path = require('path');

module.exports = class extends Base {
    // 获取资源列表
    async uploadAction() {
        let themefile = this.file('file');
        let filepath = themefile.path;//为防止上传的时候因文件名重复而覆盖同名已上传文件，path是MD5方式产生的随机名称
        let uploadpath = think.ROOT_PATH + '/www/static/upload/';
        // let uploadpath = '/upload/';
        console.log(uploadpath)
        think.mkdir(uploadpath);//创建该目录
        //提取出用 ‘/' 隔开的path的最后一部分。

        let newFileName = path.basename(filepath);
        //将上传的文件（路径为filepath的文件）移动到第二个参数所在的路径，并改为第二个参数的文件名。
        themefile.path = uploadpath +  newFileName;
        console.log(filepath)
        console.log( uploadpath + newFileName)
        fs.rename(filepath, uploadpath + newFileName, function (err) {
            if (err) {
                console.log(err)
            }
        })
        //读取压缩文件信息存数据库

        let zip = new JSZip();

        this.success(themefile);
    }
};