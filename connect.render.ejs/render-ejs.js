"use strict";

var ejs = require("ejs");
var fs = require("fs");

module.exports = function(options, imports, register) {
    
    imports["connect.render"].registerEngine("ejs", createView);
    
    function createView(path, callback) {
        return callback(null, function(res, options, callback) {
            fs.readFile(path, "utf8", function(err, template) {
                if (err) return callback(err);
                console.log(options)
                callback(null, {
                    headers: {"Content-Type": "text/html"},
                    body: ejs.render(template, options)
                });
            }); 
        });
    }
    
    register(null, {
        "connect.render.ejs": {}
    });
};