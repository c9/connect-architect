var utils = require("connect/lib/utils");
var netutil = require("netutil");
var connect = require("connect");

module.exports = function startup(options, imports, register) {
    var server = connect();

    var hookNames = [
        "Start",
        "Setup",
        "Main",
        "Session",
        "Auth"
    ];
    var api = {
        getModule: function() {
            return connect;
        },
        getUtils: function() {
            return utils;
        }
    };
    hookNames.forEach(function(name) {
        var hookServer = connect();
        server.use(hookServer);
        api["use" + name] = hookServer.use.bind(hookServer);
    });

    var connectHook = connectError();
    server.use(connectHook);
    api.useError = connectHook.use.bind(connectHook);

    
    api.useSetup(connect.cookieParser());
    api.useSetup(connect.bodyParser());

    api.addRoute = server.addRoute;
    api.use = api.useStart;

    api.on = server.on;
    api.emit = server.emit;

    function startListening (port, host) {
        api.getPort = function () {
            return port;
        };
        api.getHost = function () {
            return host;
        };

        server.listen(port, host, function(err) {
            if (err)
                return register(err);

            console.log("Connect server listening at http://" + host + ":" + port);

            register(null, {
                "onDestruct": function(callback) {
                    server.close();
                    server.on("close", callback);
                },
                "connect": api,
                "http": {
                    getServer: function() {
                        return server;
                    }
                }
            });
        });
    }

    if (options.port instanceof Array) {
        netutil.findFreePort(options.port[0], options.port[1], options.host, function(err, port) {
            if (err)
                return register(err);

            startListening(port, options.host || "localhost");
        });
    } else {
        startListening(options.port, options.host || "localhost");
    }
    
    function connectError() {
        var filters = [];
    
        function handle(err, req, res, out) {
            var rest = filters.concat();
    
            function next(err) {
                var filter = rest.shift();
                if (!filter)
                    return out(err);
    
                filter(err, req, res, next);
            }
            next(err);
        }
    
        handle.use = function(middleware) {
            filters.push(middleware);
        };
        
        return handle;
    }
};