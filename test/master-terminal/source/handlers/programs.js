var db = require("../database.js");

module.exports = {
    register: function (server) {

        server.head("/programs", function (req, res, next) {
            if (req.headers["accept"] !== "application/lua") {
                console.log("'HEAD /programs' requires 'Accept: application/lua'.");
            }
            res.writeHead(200, {
                "Content-Type": "application/lua",
                "Content-Length": 0,
                "Collection-Items": Object.keys(db.programs).join(","),
            });
            res.end();
        
            next();
        });
        
        server.post("/programs", function (req, res, next) {
            if (req.headers["accept"] !== "text/plain") {
                console.log("'POST /programs' requires 'Accept: text/plain'.");
            }
            if (req.headers["content-type"] !== "application/lua") {
                console.log("'POST /programs' requires 'Content-Type: application/lua'.");
            }
        
            var name = req.headers["collection-item"];
        
            if (!name) {
                res.writeHead(400, {
                    "Content-Type": "text/plain",
                });
                res.write("No program name given in message header.");
                res.end();
        
            } else if (db.programs[name]) {
                res.writeHead(403, {
                    "Content-Type": "text/plain",
                });
                res.write("A program with that name already exists.");
                res.end();
        
            } else {
                req.on("data", function (data) {
                    db.programs[name] = data.toString();
                    res.writeHead(201, {
                        "Content-Type": "text/plain",
                        "Location": "/programs/" + name,
                        "Content-Length": name.length,
                    });
                    res.write(name);
                    res.end();
                });
            }
        });
        
        server.get("/programs/:name", function (req, res, next) {
            var name = req.params.name;
        
            if (req.headers["accept"] !== "application/lua") {
                console.log("'GET /programs/" + name + "' requires 'Content-Type: application/lua'.");
            }
        
            if (db.programs[name]) {
                res.writeHead(200, {
                    "Content-Type": "application/lua",
                    "Content-Length": db.programs[name].length,
                    "Collection-Item": name,
                });
                res.write(db.programs[name]);
                res.end();
        
            } else {
                res.writeHead(404);
                res.end();
            }
        });
        
        server.del("/programs/:name", function (req, res, next) {
            var name = req.params.name;
        
            delete db.programs[name];
            res.writeHead(204, {
                "Collection-Item": name,
            });
            res.end();
           next();
       });

    }
};

