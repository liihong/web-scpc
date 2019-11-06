const Base = require('./base.js');
module.exports = class extends Base {

    // this.socket 为发送消息的客户端对应的 socket 实例， this.io 为Socket.io 的一个实例
    constructor(...arg) {
        super(...arg);
        this.io = this.ctx.req.io;
        this.socket = this.ctx.req.websocket;
    }

    async openAction() {
        this.emit('open', {
            hello: '欢迎链接'
        })
        this.socket.on('getTableData', function (data) {
            console.log(data);
            this.emit('open', {
                hello: '发送成功'
            });
        });
    }
    closeAction() {
        this.socket.disconnect(true);
    }

    async getTableDataAction() {
        // 发送给当前客户端
        this.emit('getTableData', {
            hello: '查询表格数据'
        })
        let sql = `  select dd.id,dd.xmname,dd.starttime,dd.endtime,dd.remark,
        fun_yjggs_gy(id,'201609010949574021') 'xqg',
        fun_yjggs_gy(id,'201609010949574022') 'xi',
        fun_yjggs_gy(id,'201609010949574025') 'qian',
        fun_yjggs_gy(id,'201609010949574023') 'zhusu',
        fun_yjggs_gy(id,'201609010949574024') 'che',
        fun_yjggs_gy(id,'201609010949574026') 'cnc',
       fun_yjggs_gy(id,'201609010949574027') 'dhh',
          fun_yjggs_gy(id,'201609010949574028')  'mo',
           fun_yjggs_gy(id,'20170424203552800')   'rechuli',
           fun_yjggs_gy(id,'20170724160856037')  'hanjie',
           fun_yjggs_gy(id,'20170524144646657') 'waixie'
    FROM  scglxt_t_dd dd where  dd.ckzt is null order by ddlevel,sjcjsj DESC`

        let data = await this.model().query(sql)

        //广播
        this.broadcast('getTableData', this.success(data))
    }

};