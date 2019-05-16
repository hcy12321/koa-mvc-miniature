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
};