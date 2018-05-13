var Crypto = require('./Crypto.js'),
    error = require('./Errors.js'),
    parseXml = require('xml2js').parseString,
    db = require('mysql2'),
    config = require("../config"),
    md5 = require('md5'),
    client = require('./client'),
    loginkey = Crypto.generateKey();

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


var self = {
    xmlHandlers: {
        'sys': {
            'verChk': 'handleVerChk',
            'rndK': 'handleRndK',
            'login': 'handleLogin'
        }
    },

    handleXml: function(data, client) {
        if (data == '<policy-file-request/>') {
		    client.write('<cross-domain-policy><allow-access-from domain="localhost" to-ports="*" /></cross-domain-policy>');
        } else {
            parseXml(data, function(err, result) {
                var type = result.msg['$'].t,
                    action = result.msg.body[0]['$'].action;

                var method = self.xmlHandlers[type][action];

                if (typeof self[method] == 'function') {
                    self[method](data, client);
                }
            });
        }
    },

    handleVerChk: function(data, client) {
        client.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
    },


    handleRndK: function(data, client) {
        client.set('randomKey', loginkey);
        client.write('<msg t="sys"><body action="rndK" r="-1"><k>' + loginkey + '</k></body></msg>');
    },

    handleLogin: function(data, client) {
        parseXml(data, function(err, res) {
            var username = res.msg.body[0].login[0].nick[0],
                pass = res.msg.body[0].login[0].pword[0];
            connection.execute("SELECT `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, results, fields) {
                if (results.length === 0) {
                    client.write('%xt%e%-1%' + USERNAME_NOT_FOUND + '%');
                } else {
                    connection.execute("SELECT `password`, `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, result, fields) {
                        if (result.length != 0) {
                            var hash = result[0].password.toUpperCase();
							var user = result[0].user;
                            var ID = result[0].ID;
                            var encrypt = Crypto.encryptPassword(hash, client.get('randomKey'));
			    if(user == null){
			    client.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                            if (encrypt === pass) {
                                var serverList = self.getServerList();
                                client.sendXt('sd', -1, serverList);
                                client.sendXt('l', -1, ID, loginkey, '', '100,5');
                                var sql = "UPDATE `users` set `loginkey` = ? WHERE `user` = ?";
                                var query = connection.execute(sql, [loginkey, username], function(err, result) {
                                console.log("Login key updated!");
                                });
                            } else {
                                client.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                        }
                    });
                }

            });
        })
    },

    getServerList: function() {
        var serverArr = [];
        serverArr.push(config.Servers.ID + '|' + config.Servers.Name + '|' + config.Servers.Host + '|' + config.Servers.Port);
        return serverArr.join('%');
    }

};

module.exports = self;
    },

    handleVerChk: function(data, client) {
        client.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
    },


    handleRndK: function(data, client) {
        client.set('randomKey', loginkey);
        client.write('<msg t="sys"><body action="rndK" r="-1"><k>' + loginkey + '</k></body></msg>');
    },

    handleLogin: function(data, client) {
        parseXml(data, function(err, res) {
            var username = res.msg.body[0].login[0].nick[0],
                pass = res.msg.body[0].login[0].pword[0];
            connection.execute("SELECT `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, results, fields) {
                if (results.length === 0) {
                    client.write('%xt%e%-1%' + USERNAME_NOT_FOUND + '%');
                } else {
                    connection.execute("SELECT `password`, `ID`, `user` FROM `users` WHERE `user` = ?", [username], function(error, result, fields) {
                        if (result.length != 0) {
                            var hash = result[0].password.toUpperCase();
							var user = result[0].user;
                            var ID = result[0].ID;
                            var encrypt = Crypto.encryptPassword(hash, client.get('randomKey'));
							if(user == null){
							client.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                            if (encrypt === pass) {
                                var serverList = self.getServerList();
                                client.sendXt('sd', -1, serverList);
                                client.sendXt('l', -1, ID, loginkey, '', '100,5');
                                var sql = "UPDATE `users` set `loginkey` = ? WHERE `user` = ?";
                                var query = connection.execute(sql, [loginkey, username], function(err, result) {
                                    console.log("Login key updated!");
                                });
                            } else {
                                client.write('%xt%e%-1%' + INCORRECT_PASSWORD + '%');
                            }
                        }
                    });
                }

            });
        })
    },

    getServerList: function() {
        var serverArr = [];
        serverArr.push(config.Servers.ID + '|' + config.Servers.Name + '|' + config.Servers.Host + '|' + config.Servers.Port);
        return serverArr.join('%');
    }

};

module.exports = self;
