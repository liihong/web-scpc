/**
 * 组件操作的接口
 */
const Base = require('../base.js');
let bzjModel = 'scglxt_t_bzj'
import util from '../../../utils/util'
module.exports = class extends Base {

    /**
     * 根据标准件名称获取库存
     */
    async getBzjKCByNameAction(){
        let name = this.post('name')
        let data = await this.model(bzjModel).where({ljmc:['like', '%'+name+'%']}).select()
        return this.success(data)
    }
    /**
     * 标注件入库
     */
    async inStoreBzjAction(){
        let form = this.post('form')
        let rkLog = []
        let vm = this
        form.map(item=>{
            if(item.rksl && item.rksl!=0){
                let log = {
                    id:util.getUUId(),
                    ljmc:item.ljmc,
                    ljsl:item.rksl,
                    type:'in',
                    rjr:vm.header('token')
                }
                rkLog.push(log)
            }
        })
        let data = await this.model(bzjModel).updateMany(form)
        
        await this.model('scglxt_t_bzj_log').addMany(rkLog)
        return this.success(data)
    }

    async outStoreBzjAction(){
        let form = this.post('form')
        let rkLog = []
        let vm = this
        form.map(item=>{
            if(item.rksl && item.rksl!=0){
                let log = {
                    id:util.getUUId(),
                    ljmc:item.ljmc,
                    ljsl:item.rksl,
                    type:'out',
                    rjr:vm.header('token')
                }
                rkLog.push(log)
            }
        })
        let data = await this.model(bzjModel).updateMany(form)
        
        await this.model('scglxt_t_bzj_log').addMany(rkLog)
        return this.success(data)
    }
};