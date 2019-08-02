const
    XLSX = require('xlsx-style'),
    {
        utils
    } = XLSX;
const path = require('path')
const xlsxUtils = require('./xlsxUtils')
var _exports = {};
module.exports = _exports;

_exports.exportXls = function (data, list, res) {
    let models = new Buffer(255);
    // 打开文件
    let PUBLIC_PATH = path.resolve(__dirname, 'zjModel.xlsx');

    const workbook2 = XLSX.readFile(PUBLIC_PATH, {
        cellStyles: true
    })
    const wsname = workbook2.SheetNames[0] //取第一张表
    const header = workbook2.Sheets[wsname] //生成json表格内容

    header.A1.v = header.A1.v + data.xmname
    header.A1.h = header.A1.h + data.xmname
    header.C2.v = data.htbh
    header.C3.v = data.htbh
    header.C4.v = data.starttime
    header.C4.v = data.starttime
    header.H4.v = data.endtime
    header.C5.v = data.ddlevel
    header.A1.s = {
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        font: {
            name: '宋体',
            sz: 26,
            bold: true,
            color: {
                rgb: "FF0000"
            }
        }
    }; //<====设置xlsx单元格样式

    var keyMap = ["xh", "ljmc", "ljcz", "ljgg", "jgsl", "ljlx", "sccj", "jhrq", "yjdhrq", "sjdhrq", "bz"];

    var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); //偏移8行按keyMap顺序转换
    var dataKeys = Object.keys(dataList);
    for (var k in header) dataList[k] = header[k]; //追加列头
    var wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, "A1:" + dataKeys[dataKeys.length - 1]);

    // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
    const result = XLSX.write(wb, {
        bookType: 'xlsx', // 输出的文件类型
        type: 'buffer', // 输出的数据类型
        compression: true // 开启zip压缩
    });


    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    res.setHeader("Content-Disposition", "filename="+data.xmname+".xlsx");
    res.end(result, 'buffer');
};

_exports.exportBOMXls = function (data, list, res) {
    let models = new Buffer(255);
    // 打开文件
    let PUBLIC_PATH = path.resolve(__dirname, 'bomModel.xlsx');

    const workbook2 = XLSX.readFile(PUBLIC_PATH, {
        cellStyles: true
    })
    const wsname = workbook2.SheetNames[0] //取第一张表
    const header = workbook2.Sheets[wsname] //生成json表格内容

    header.A1.v = header.A1.v + data.xmname
    header.A1.h = header.A1.h + data.xmname
    header.C2.v = data.htbh
    header.C3.v = data.htbh
    header.C4.v = data.starttime
    header.C4.v = data.starttime
    header.H4.v = data.endtime
    header.C5.v = data.ddlevel
    header.A1.s = {
        alignment: {
            horizontal: "center",
            vertical: "center"
        },
        font: {
            name: '宋体',
            sz: 26,
            bold: true,
            color: {
                rgb: "FF0000"
            }
        }
    }; //<====设置xlsx单元格样式
    header.A2.s = {
        fgColor: {
            rgb: "FFFFFF"
        }
    }
    var keyMap = ["rownum", "zddmc", "clmc", "cldx", "jgsl", "gxnr", "bmcl", "bz", "endtime"];

    var dataList = xlsxUtils.format2Sheet(list, 0, 7, keyMap); //偏移8行按keyMap顺序转换
    var dataKeys = Object.keys(dataList);
    for (var k in header) dataList[k] = header[k]; //追加列头
    var wb = xlsxUtils.format2WB(dataList, data.xmname, undefined, "A1:" + dataKeys[dataKeys.length - 1]);

    // 浏览器端和node共有的API,实际上node可以直接使用xlsx.writeFile来写入文件,但是浏览器没有该API
    const result = XLSX.write(wb, {
        bookType: 'xlsx', // 输出的文件类型
        type: 'buffer', // 输出的数据类型
        compression: true // 开启zip压缩
    });


    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
    res.setHeader("Content-Disposition", "filename="+data.xmname+".xlsx");
    res.end(result, 'buffer');
};