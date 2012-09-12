
var port = parseInt(process.env.PORT || 8080, 10);

module.exports = [{
    packagePath: "../../connect",
    port: port
}, {
    packagePath: "../../connect.session",
    key: "connect.architect." + port,
    secret: "1234"
}, {
    packagePath: "../../connect.session.memory"
}, {
    packagePath: "architect/plugins/architect.log"
}, {
    packagePath: "../plugin"
}];
