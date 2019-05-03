const Base = require('../lib/base.controller');

module.exports = class Home extends Base {
    constructor() {
        super();
    }

    index() {
        return this.render('index.html');
    }
};