/**
 * 日志封装
 * 懒得用库，随便写个
 * 黄晨尧 2019.4.28
 */
const fs = require('mz/fs');
const Config = require('../config');

function toTwiceNumStr(num) {
    return `0${num}`.slice(-2);
}
function toThreeNumStr(num) {
    return `00${num}`.slice(-3);
}

class Logger {
    constructor(name) {
        this.name = name;
        this.filer = null;
        this.filePath = '';
        this.inited = false;
        this.writing = false;
        this.cacheLogs = [];
        this.cacheAfterLogs = [];
        this.dateChange = false;
        this.nowDate = '';
    }

    async init() {
        if (this.inited) return;
        let time = new Date();
        this.nowDate = `${time.getFullYear()}_${toTwiceNumStr(time.getMonth() + 1)}_${toTwiceNumStr(time.getDate())}`;
        this.filePath = `${Config.logDir}/${this.name}_${this.nowDate}.log`;
        this.filer = fs.createWriteStream(this.filePath, {flags:'a'});
        this.inited = true;
    }

    logTo(log, pre) {
        let time = new Date();
        let year = time.getFullYear();
        let month = toTwiceNumStr(time.getMonth() + 1);
        let date = toTwiceNumStr(time.getDate());
        let nowDate = `${year}_${month}_${date}`;
        let str = `${year}-${month}-${date} ${toTwiceNumStr(time.getHours())}:${toTwiceNumStr(time.getMinutes())}:${toTwiceNumStr(time.getSeconds())}.${toThreeNumStr(time.getMilliseconds())} [${pre}] ${log}`;
        if (nowDate === this.nowDate) {
            this.cacheLogs.push(str);
        } else {
            this.cacheAfterLogs.push(str);
        }
        if (Config.logOpenConsole) {
            let funcName = pre.toLowerCase();
            if (console[funcName]) console[funcName](str);
            else console.log(str);
        }
    }

    debug(log) {
        this.logTo(log, 'DEBUG');
    }

    log(log) {
        this.info(log);
    }

    info(log) {
        this.logTo(log, 'INFO');
    }

    warn(log) {
        this.logTo(log, 'WARN');
    }

    error (log) {
        this.logTo(log, 'ERROR');
    }

    fatal(log) {
        this.logTo(log, 'FATAL');
    }

    async write() {
        if (!this.inited) await this.init();
        if (this.writing) return;
        this.writing = true;
        try {
            while(this.cacheLogs.length) {
                let str = '';
                for (let log of this.cacheLogs) {
                    str += `${log}\n`;
                }
                try {
                    await fs.access(this.filePath);
                } catch(e) {
                    this.filer.close();
                    this.filer.destroy();
                    this.filer = fs.createWriteStream(this.filePath, {flags:'a'});
                }
                
                await this.filer.write(str);
                
                if (this.cacheAfterLogs.length) {
                    this.cacheLogs = this.cacheAfterLogs;
                    this.cacheAfterLogs = [];
                    this.filer.close();
                    this.filer.destroy();
                    this.nowDate = `${time.getFullYear()}_${toTwiceNumStr(time.getMonth() + 1)}_${toTwiceNumStr(time.getDate())}`;
                    this.filePath = `${Config.logDir}/${this.name}_${this.nowDate}.log`;
                    this.filer = fs.createWriteStream(this.filePath, {flags:'a'});
                } else {
                    this.cacheLogs = [];
                }
            }
        } catch (e) {
            console.error(`${new Date().toString()}fatal err write log ${e.stack}`);
        }
        this.writing = false;
    }

    async clear() {
        await this.write();
        this.filer.close();
        this.filer.destroy();
    }
}

module.exports = new class LogManager {
    constructor() {
        this.loggers = new Map();
        this.inited = false;
    }

    async init() {
        if (this.inited) return;
        if (!await fs.exists(Config.logDir)) {
            await fs.mkdir(Config.logDir);
        }
        
        setInterval(() => {
            for (let [_, logger] of this.loggers) {
                logger.write();
            }
        }, Config.logWriteInterval);
        this.inited = true;
    }

    /**
     * 返回日志器
     * @param {string} name 
     * @returns {Logger} 
     */
    async getLogger(name) {
        if (!this.inited) await this.init();
        if (this.loggers.has(name)) return this.loggers.get(name);
        let logger = new Logger(name);
        await logger.init();
        this.loggers.set(name, logger);
        return logger;
    }

    async deleteLogger(name) {
        if (!this.loggers.has(name)) return false;
        let logger = this.loggers.get(name);
        await logger.clear();
        this.loggers.delete(name);
    }
};