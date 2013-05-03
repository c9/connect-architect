"use strict";

var flash = require('connect-flash');

module.exports = function(options, imports, register) {
    imports.connect.useSession(flash());
    register(null, {
        "connect.flash": {}
    });
};
