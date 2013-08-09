"use strict";

var http = require("http");

module.exports = function(options, imports, register) {
    
    http.ServerResponse.prototype.redirect = function(location) {
        this.writeHead(302, {Location: location});
        this.end("");
    };
    http.ServerResponse.prototype.returnTo = function(req, defaultReturn) {
        var url = defaultReturn || "/";        
        if (req.session && req.session.returnTo) {
            url = req.session.returnTo;
            delete req.session.returnTo;
        }
        
        this.redirect(url);
    };
    http.ServerResponse.prototype.moved = function(location) {
        this.writeHead(301, {Location: location});
        this.end("");
    };
    
    register(null, {
        "connect.redirect": {}
    });
};
