/**
 * 只用于继承，不应实例化
 * hcy12321 2019.4.29
 * 
 */
const nunjucks = require('./view_manager').get();
const logMgr = require('./log_manager');

module.exports = class BaseController {
    constructor(loggerName = 'controller') {
        this.configMap = {};
        this.loggerName = loggerName;
        this.logger = null;
    }

    async init() {
        this.logger = await logMgr.getLogger(this.loggerName);
    }
    
    render(file, options = {}) {
        return nunjucks.render(file, options);
    }

    /**
     * 组织json返回对象
     * @param {number} code 返回类型 0成功 1失败
     * @param {string} msg 附带消息
     * @param {Object} data 附带数据
     */
    jsonRes(code, msg = '', data = {}) {
        return {
            code,
            msg,
            data
        };
    }

    jsonResSuccess(data = {}) {
        return this.jsonRes(0, '', data);
    }

    jsonResErr(msg = '') {
        return this.jsonRes(1, msg);
    }
};