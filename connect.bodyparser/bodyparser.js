"use strict";

module.exports = function(options, imports, register) {
    imports.connect.useSetup(imports.connect.getModule().bodyParser());
    register(null, {
        "connect.bodyparser": {}
    });
};
