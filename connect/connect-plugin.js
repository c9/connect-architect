var utils = require("connect/lib/utils");
var netutil = require("netutil");
var connect = require("connect");
var http = require("http");

module.exports = function startup(options, imports, register) {
    var globalOptions = options.globals ? merge([options.globals]) : {};

    http.ServerResponse.prototype.setOptions = function(options) {
        this._options = this._options || [];
        this._options.push(options);
    };
    
    http.ServerResponse.prototype.getOptions = function(options) {
        var opts = [globalOptions].concat(this._options || []);
        if (options)
            opts = opts.concat(options);
        
        return merge(opts);
    };
    
    http.ServerResponse.prototype.resetOptions = function() {
        if (this._options)
            this._options.pop();
    };

    var app = connect();

    var hookNames = [
        "Start",
        "Setup",
        "Main"
    ];
    var api = {
        getModule: function() {
            return connect;
        },
        getUtils: function() {
            return utils;
        },
        /**
         * set per request options. Used e.g. for the view rendering
         */ 
        setOptions: function(options) {
            return function(req, res, next) {
                res.setOptions(options);
                next();
            };
        },
        resetOptions: function() {
            return function(req, res, next) {
                res.resetOptions();
                next();
            };
        },
        setGlobalOption: function(key, value) {
            globalOptions[key] = value;
        }

    };
    hookNames.forEach(function(name) {
        var hookServer = connect();
        app.use(hookServer);
        api["use" + name] = hookServer.use.bind(hookServer);
    });

    var connectHook = connectError();
    app.use(connectHook);
    api.useError = connectHook.use.bind(connectHook);

    api.useSetup(connect.cookieParser());
    api.useSetup(connect.bodyParser());

    api.addRoute = app.addRoute;
    api.use = api.useMain;

    api.on = app.on;
    api.emit = app.emit;

    function startListening (port, host) {
        api.getPort = function () {
            return port;
        };
        api.getHost = function () {
            return host;
        };

        var server = http.createServer(app);
        server.listen(port, host, function(err) {
            if (err)
                return register(err);

            console.log("Connect server listening at http://" + host + ":" + port);

            register(null, {
                "onDestruct": function(callback) {
                    app.close();
                    app.on("close", callback);
                },
                "connect": api,
                "http": {
                    getServer: function() {
                        return server;
                    }
                }
            });
        });
        
        if (options.websocket)
            attachWsServer(server, app);
        
        function attachWsServer(server, app) {
            server.on("upgrade", function(req, socket, head) {
                var res = new http.ServerResponse(req);
                req.ws = {
                    socket: socket,
                    head: head
                };
                req.method = "UPGRADE";
                
                res.write = function() {
                    console.log("RES WRITE", arguments);
                };
                res.writeHead = function() {
                    console.log("RES WRITEHEAD", arguments);
                };
                res.end = function() {
                    console.log("RES END", arguments);
                    socket.end();
                    console.trace();
                    console.log(req.headers)
                };
                
                app.handle(req, res, function(err) {
                    if (err) {
                        console.error("Websocket error", err);
                    }
                    
                    socket.end();
                });
            });
        }
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

function merge(objects) {
    var result = {};
    for (var i=0; i<objects.length; i++) {
        var obj = objects[i];
        for (var key in obj) {
            result[key] = obj[key]
        }
    }
    return result;
}