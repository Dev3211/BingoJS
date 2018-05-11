var game = require('./handlers/handleGame'),
    client = require('./handlers/client'),
    net = require('net'),
    parseXml = require('xml2js').parseString,
    Crypto = require('./handlers/Crypto.js'),
    loginkey = 'singlejs',
    db = require('mysql2'),
    config = require("./config"),
    md5 = require('md5'),
	log = require('js-logs'),
    error = require('./handlers/Errors.js');

var connection = db.createConnection({
    connectionLimit: 5,
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

connection.connect(function(error) {
    if (error) {
        console.error('error connecting :' + error.stack);
        process.exit(1);
    }
    console.log('Successful MySQL connection');
});

Game1 = config.Ports.Game;

var Game = {

    xmlHandlers: {
        'sys': {
            'verChk': 'handleVerChk',
            'rndK': 'handleRndK',
            'login': 'handleLogin'
        }
    },

    handleGame: function() {
        console.log(log.success('The source is starting!'));
        var server = net.createServer(function(socket) {
            console.log('A client has connected' + "\r\n");
            global.clientObj = new client(socket);
            game.addClient(clientObj);
            socket.on('data', function(data) {
                data = data.toString().split('\0')[0];
                console.log('Incoming data: ' + data + "\r\n")
                if (data == "<msg t='sys'><body action='verChk' r='0'><ver v='153' /></body></msg>" | data == "<msg t='sys'><body action='rndK' r='-1'></body></msg>" | data.startsWith("<msg t='sys'><body action='login' r='0'>")) {
                    parseXml(data, function(err, result) {
                        var type = result.msg['$'].t,
                            action = result.msg.body[0]['$'].action;

                        var method = Game.xmlHandlers[type][action];

                        if (typeof Game[method] == 'function') {
                            Game[method](data, client);
                        }
                    });
                }
                var dataType = data.charAt(0);
                if (dataType == '%') {
                    game.handleraw(data, clientObj);
                }
            });
            socket.on('end', function() {
                game.removeClient(socket);
                console.log('A client has disconnected');
            });
            socket.on('error', function(err) {
                if (err.code !== 'ECONNRESET') {
                    console.log(err.toString());
                }
            });
        });

        server.listen(Game1, function() {
            console.log('Server is listening on port 6113');
        });

    },

    handleVerChk: function() {
        clientObj.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
    },


    handleRndK: function() {
        clientObj.set('randomKey', loginkey);
        clientObj.write('<msg t="sys"><body action="rndK" r="-1"><k>' + loginkey + '</k></body></msg>');
    },

    handleLogin: function(data) {
        parseXml(data, function(err, res) {
            var username = res.msg.body[0].login[0].nick[0],
                pass = res.msg.body[0].login[0].pword[0];
            connection.execute("SELECT `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, results, fields) {
                if (results.length === 0) {
                    clientObj.write('%xt%e%-1%' + USERNAME_NOT_FOUND + '%');
                } else {
                    connection.execute("SELECT * FROM `users` WHERE `user` = ?", [username], function(error, result, fields) {
                        if (result.length != 0) {
                            var hash = result[0].password.toUpperCase();
                            var ID = result[0].ID;
                            var key = result[0].loginkey;
                            var hash = pass.substr(32);
                            var key = result[0].loginkey;
                            var userarray = result[0];
							
                            if (hash == key) {
                                var sql = "UPDATE `users` set `loginkey` = ? WHERE `user` = ?";
                                var query = connection.execute(sql, [' ', username], function(err, result) {
                                    console.log("Login key updated!");
                                });
                                clientObj.sendXt('l');
                                clientObj.setClient(userarray);
                            } else {
                                clientObj.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                        }
                    });
                }

            });
        })
    }
}

Game.handleGame();

module.exports = Game;
                    parseXml(data, function(err, result) {
                        var type = result.msg['$'].t,
                            action = result.msg.body[0]['$'].action;

                        var method = Game.xmlHandlers[type][action];

                        if (typeof Game[method] == 'function') {
                            Game[method](data, client);
                        }
                    });
                }
                var dataType = data.charAt(0);
                if (dataType == '%') {
                    game.handleraw(data, clientObj);
                }
            });
            socket.on('end', function() {
                game.removeClient(socket);
                console.log('A client has disconnected');
            });
            socket.on('error', function(err) {
                if (err.code !== 'ECONNRESET') {
                    console.log(err.toString());
                }
            });
        });

        server.listen(Game1, function() {
            console.log('Server is listening on port 6113');
        });

    },

    handleVerChk: function() {
        clientObj.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
    },


    handleRndK: function() {
        clientObj.set('randomKey', loginkey);
        clientObj.write('<msg t="sys"><body action="rndK" r="-1"><k>' + loginkey + '</k></body></msg>');
    },

    handleLogin: function(data) {
        parseXml(data, function(err, res) {
            var username = res.msg.body[0].login[0].nick[0],
                pass = res.msg.body[0].login[0].pword[0];
            connection.execute("SELECT `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, results, fields) {
                if (results.length === 0) {
                    clientObj.write('%xt%e%-1%' + USERNAME_NOT_FOUND + '%');
                } else {
                    connection.execute("SELECT * FROM `users` WHERE `user` = ?", [username], function(error, result, fields) {
                        if (result.length != 0) {
                            var hash = result[0].password.toUpperCase();
                            var ID = result[0].ID;
                            var key = result[0].loginkey;
                            var hash = pass.substr(32);
                            var key = result[0].loginkey;
                            var userarray = result[0];
							
                            if (hash == key) {
                                var sql = "UPDATE `users` set `loginkey` = ? WHERE `user` = ?";
                                var query = connection.execute(sql, [' ', username], function(err, result) {
                                    console.log("Login key updated!");
                                });
                                clientObj.sendXt('l');
                                clientObj.setClient(userarray);
                            } else {
                                clientObj.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                        }
                    });
                }

            });
        })
    }
}

Game.handleGame();

module.exports = Game;
