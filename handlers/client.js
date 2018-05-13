"use strict";
var db = require('mysql2'),
    jf = require('jsonfile'),
    furnitureCrumbs = jf.readFileSync('./handlers/crumbs/furniture.json'),
    itemCrumbs = jf.readFileSync('./handlers/crumbs/items.json'),
    floorCrumbs = jf.readFileSync('./handlers/crumbs/igloofloor.json'),
    config = require("../config");

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
});

var client = function(socket) {
    var self = this;

    this.socket = socket;
    this.data = [];
    this.randomKey = "";
    this.x = 0;
    this.y = 0;
    this.frame = 1;

    client.prototype.get = function(get) {
        return this[get];
    };

    client.prototype.set = function(set, value) {
        return this[set] = value;
    };

    client.prototype.write = function(data) {
        if (this.socket) {
            console.log(`Outgoing data: ${data}`);
            this.socket.write(data + '\0');
        }
        // return this.socket;
    };

    client.prototype.writeError = function(error) {
        this.write('%xt%e%-1%' + error + '%');
    };

    client.prototype.sendXt = function() {
        var args = Array.prototype.join.call(arguments, '%');
        this.write('%xt%' + args + '%');
    };

    client.prototype.getTime = function() {
        return (Math.floor(new Date() / 1000))
    }

    client.prototype.setClient = function(data, data1, data2) {
        const time = (self.getTime() - data.registrationdate);
        if (data1 == undefined) {
            data1 = [];
        } else if (data2 == undefined) {
            data2 = [];
        }
        self.ID = data.ID;
        self.user = data.user;
        self.coins = data.coins;
        self.rank = data.rank;
        self.age = Math.round(time / 86400)
        self.moderator = data.moderator == 1 ? true : false;
        self.inventory = data2.inventory ? JSON.parse(data2.inventory) : {};
        self.igloos = data.igloos ? JSON.parse(JSON.stringify(data.igloos)) : [];
        self.furniture = data1.FurnitureID ? JSON.parse(data1.FurnitureID) : {};
        self.color = data.color;
        self.head = data.head;
        self.face = data.face;
        self.neck = data.neck;
        self.body = data.body;
        self.hand = data.hand;
        self.feet = data.feet;
        self.flag = data.flag;
        self.photo = data.photo;
    }

    client.prototype.buildPlayerString = function() {
        var playerArr = [
            this.ID,
            this.user,
            45,
            this.color,
            this.head,
            this.face,
            this.neck,
            this.body,
            this.hand,
            this.feet,
            this.flag,
            this.photo,
            this.x,
            this.y,
            this.frame,
            1,
            this.rank * 146
        ];
        return playerArr.join('|');
    };

    client.prototype.updateClothing = function(type, item) {
        self.set(type, item)
        var sql = 'UPDATE `users` SET ' + type + ' = ? WHERE `user` = ?';
        var query = connection.execute(sql, [item, self.user], function(err, result) {
            console.log("Updated item");
            if (err) return console.log(err);
        });
    }

    client.prototype.getInventory = function() {
        connection.execute("SELECT itemID FROM `items` WHERE `PlayerID` = ?", [self.ID], function(error, result, fields) {
            var data = [];
            if (result.length != 0) {
                result.forEach(function(row) {
                    const info = [row.itemID];
                    data.push(info);
                });
                self.sendXt('gi', -1, data.join('%'));
            }
        });
    }

    client.prototype.getFurniture = function() {
        connection.execute("SELECT FurnitureID, Quantity FROM `furnitures` WHERE `PlayerID` = ?", [self.ID], function(error, result, fields) {
            if (error) return console.log(error);
            if (result.length != 0) {
                result.forEach(function(row) {
                    const info = [row.FurnitureID, row.Quantity];
                    self.sendXt('gf', -1, info.join('|') + '|')
                });
            } else {
                const info = [];
                self.sendXt('gf', -1, info)
            }
        });
    }


    client.prototype.delCoins = function(coins) {
        var newCoins = (self.get('coins') - coins);
        var sql = 'UPDATE `users` SET coins = ? WHERE `user` = ?';
        var query = connection.execute(sql, [newCoins, self.user], function(err, result) {
            console.log("Subtracted the coins.");
            if (err) return console.log(err);
        });
        self.set('coins', newCoins);
    }

    client.prototype.addCoins = function(coins) {
        var newCoins = (self.get('coins') + coins);
        var sql = 'UPDATE `users` SET coins = ? WHERE `user` = ?';
        var query = connection.execute(sql, [newCoins, self.user], function(err, result) {
            console.log("Added coins.");
            if (err) return console.log(err);
        });
        self.set('coins', newCoins);
    }

    client.prototype.getIgloos = function() {
        if (self.igloos.length > 0) {
            var test = self.igloos.split("|");
            return test.join("|");
        }
    }

    client.prototype.addFurniture = function(furniturez) {
        if (furnitureCrumbs[furniturez]) {
            connection.execute("SELECT FurnitureID FROM `furnitures` WHERE `FurnitureID` = ? AND `PlayerID` = ?", [furniturez, self.ID], function(error, result, fields) {
                if (result.length != 0) {
                    var sql1 = 'UPDATE `furnitures` SET `Quantity` = Quantity + ? WHERE `PlayerID` = ?';
                    var query1 = connection.execute(sql1, [1, self.ID], function(err, result) {
                        if (err) return console.log(err);
                    });
                    self.sendXt('af', -1, furniturez, self.get('coins'));
                } else {
                    var sql = "INSERT INTO furnitures (PlayerID,  FurnitureID, Quantity, username) VALUES (?, ?, ?, ?)";
                    var query = connection.execute(sql, [self.ID, furniturez, 1, self.user], function(err, result) {
                        if (err) return console.log(err);
                    });
                    self.sendXt('af', -1, furniturez, self.get('coins'));
                }
            });
        } else {
            console.log('Item does not exist in the crumbs');
        }
    }

    client.prototype.addIgloo = function(igloo) {
        if (!isNaN(igloo)) {
            if (!self.igloos[igloo]) {
                var sql1 = 'UPDATE `users` SET `igloos` =' + `concat(igloos, "|", ${igloo})` + 'WHERE `ID` = ?';
                var query1 = connection.execute(sql1, [self.ID], function(err, result) {
                    if (err) return console.log(err);
                });
                if (self.get('room') === (self.ID + 1000)) {
                    self.sendXt('au', -1, igloo, self.coins)
                }
            }
        }
    }

    client.prototype.addFloor = function(floor) {
        if (floorCrumbs[floor] && !isNaN(floor)) {
            var sql = 'UPDATE `igloo` SET `Floor` = ? WHERE `OwnerID` = ?';
            var query = connection.execute(sql, [floor, self.ID], function(err, result) {
                if (err) return console.log(err);
            });
            if (query) {
                self.sendXt('ag', -1, floor, self.coins)
            }
        }
    }

    client.prototype.updateIgloo = function(igloo) {
        if (!isNaN(igloo)) {
            var sql = 'UPDATE `igloo` SET `Furniture` = ?, `Floor` = ?, `Type` = ? WHERE `OwnerID` = ?';
            var query = connection.execute(sql, ["[]", 0, igloo, self.ID], function(err, result) {
                if (err) return console.log(err);
            });
        }
    }

    client.prototype.addItem = function(item) {
        if (itemCrumbs[item]) {
            var sql = "INSERT INTO items (username, PlayerID, itemID, used) VALUES (?, ?, ?, ?)";
            var query = connection.execute(sql, [self.user, self.ID, item, 1], function(err, result) {
                if (err) return console.log(err);
            });
            self.sendXt('ai', -1, item, self.get('coins'));
        } else {
            console.log('Item does not exist in the crumbs');
        }
    }

};

module.exports = client;
