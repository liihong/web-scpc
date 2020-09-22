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
    });
    this.socket.on('getTableData', function(data) {
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
    });

    // 广播
    this.broadcast('getTableData', 'refresh');
  }
};
