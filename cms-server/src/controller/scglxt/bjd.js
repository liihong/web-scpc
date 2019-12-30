
/**
 * 加工工艺操作的接口
 */
const Base = require('../base.js');
import util from '../../../utils/util'
let bjdModel = 'scglxt_t_ht_bjd'
module.exports = class extends Base {

    /**
     * 成功上传报价单后，将报价单数据入库
     */
    async addBjdAction(){
        try{
            let form = this.post('form')
            let pArr  = []
            let zdj = 0
            form.map(item=>{
               item.id= util.getUUId()
               pArr.push(this.getCzId(item,item.cz))
               zdj = parseFloat(item.zje) + zdj
            })
            let data = {}
            Promise.all(pArr).then(async () => {
                data = await this.model(bjdModel).addMany(form,{pk: 'ID'});
                //更新合同的报价单总价
                await this.model('scglxt_t_ht').where({id:form[0].ssht}).update({bjdzj:zdj})
            })
            
            return this.success(data)
        }catch(ex){
            let errorLog = {
                id: util.getUUId(),
                type: '上传报价单',
                error: JSON.stringify(ex),
                infos: JSON.stringify(this.post())
            }
            await this.model('operate_log').add(errorLog)
            return this.fail(ex)
        }
       
    }

    //查询材质对应字典
    async getCzId(item,czmc){
        const vm = this
        return new Promise(async resolve => {
            let data = await this.model('scglxt_t_cl').where({
                clmc: czmc
            }).select()
            if(data.length >0){
                item.cz = data[0].id
            }
            resolve()
        })
    }

};