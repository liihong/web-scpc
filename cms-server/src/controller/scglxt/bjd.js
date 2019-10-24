
/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
let bjdModel = 'scglxt_t_ht_bjd'
module.exports = class extends Base {

    /**
     * 成功上传报价单后，将报价单数据入库
     */
    async addBjdAction(){
        try{
            let form = this.post('form')
            // form.map(item=>{
            //     console.log(item.cz)
            // })
            let data =  await this.model(bjdModel).addMany(form,{pk: 'ID'});
            
            return this.success(data)
        }catch(ex){
            return this.fail(ex)
        }
       
    }

};