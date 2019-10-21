module.exports = class extends think.Controller {
  __before() {
    // if(this.ctx.originalUrl != '/user/login') {
    //   if(this.header('token') == "" || this.header('token') == undefined) {
    //     return this.fail(2000, '登录失效，请重新登录', '')
    //   }
    // }
  }
  _call(){
    let method = this.http.method.toLowerCase();
    if(method === "options"){
      this.setCorsHeader();
      this.end();
      return;
    }
    this.setCorsHeader();
    return super.__call();
  }
  setCorsHeader(){
    this.header("Access-Control-Allow-Origin", "*");
    this.header("Access-Control-Allow-Headers", "x-requested-with,token");
    this.header("Access-Control-Request-Method", "OPTION,GET,POST,PUT,DELETE");
    this.header("Access-Control-Allow-Credentials", "true");
  }
  constructor(ctx){
    super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
    // 其他额外的操作
  }
};
