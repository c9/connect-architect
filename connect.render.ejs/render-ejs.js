"use strict";

var ejs = require("ejs");

module.exports = function(options, imports, register) {
    
    imports["connect.render"].registerEngine("ejs", createView);
    
    function createView(path, callback) {
        return callback(null, function(res, options, callback) {
            ejs.renderFile(path, options, function(err, template) {
                if (err) return callback(err);
                
                callback(null, {
                    headers: {"Content-Type": "text/html"},
                    body: template
                });
            }); 
        });
    }
    
    register(null, {
        "connect.render.ejs": {}
    });
};