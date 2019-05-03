const Base = require('../lib/base.controller');

module.exports = class Login extends Base {
    constructor() {
        super();
    }
    
    index() {
        return '<h1>login</h1>'
    }
};