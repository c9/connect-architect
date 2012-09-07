
const PATH = require("path");
const STATIC = require("../../connect/middleware/static");

module.exports = function startup(options, imports, register) {

    var connect = imports.connect;
    var sessionStore = imports["session-store"];

    connect.useMain(STATIC(PATH.join(__dirname, "www")));

    register(null, {});
};
