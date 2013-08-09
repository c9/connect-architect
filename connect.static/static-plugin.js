module.exports = function startup(options, imports, register) {

    var rjs = {
        "paths": {},
        "packages": []
    };
    var prefix = options.prefix || "/static";
    var workerPrefix = options.workerPrefix || "/static";

    var connect = imports.connect.getModule();    
    var staticServer = connect.createServer();
    imports.connect.useMain(options.bindPrefix || prefix, staticServer);

    imports.connect.setGlobalOption("staticPrefix", prefix);
    imports.connect.setGlobalOption("workerPrefix", workerPrefix);
    imports.connect.setGlobalOption("requirejsConfig", {
        baseUrl: prefix,
        paths: rjs.paths,
        packages: rjs.packages
    });

    register(null, {
        "connect.static": {
            addStatics: function(statics) {
                statics.forEach(function(s) {
                    if (s.router) {
                        var server = connect.static(s.path);
                        staticServer.use(s.mount, function(req, res, next) {
                            s.router(req, res);
                            server(req, res, next);
                        });
                    } else {
                        staticServer.use(s.mount, connect.static(s.path));
                    }

                    var libs = s.rjs || {};
                    for (var name in libs) {
                        if (typeof libs[name] === "string") {
                            rjs.paths[name] = join(prefix, libs[name]);
                        } else {
                            rjs.packages.push(libs[name]);
                        }
                    }
                });
            },

            getRequireJsPaths: function() {
                return rjs.paths;
            },

            getRequireJsPackages: function() {
                return rjs.packages;
            },

            getStaticPrefix: function() {
                return prefix;
            },
            
            getWorkerPrefix: function() {
                return workerPrefix;
            }
        }
    });

    function join(prefix, path) {
        return prefix.replace(/\/*$/, "") + "/" + path.replace(/^\/*/, "");
    }
};
