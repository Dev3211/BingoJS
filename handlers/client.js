"use strict";
var db = require('mysql2'),
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

var client = function (socket) {
	var self = this;
	
	this.socket = socket;
	this.data = [];
	this.randomKey = "";
	this.x = 0;
	this.y = 0;
	this.frame = 1;
	
	client.prototype.get = function (get) { 
        return this[get];
	};
	
	client.prototype.set = function (set, value) { 
    return this[set] = value;
	};

	client.prototype.write = function (data) {
		if (this.socket) {
			this.socket.write(data + '\0');
			console.log('Outgoing data: ' + data);
		}
		// return this.socket;
	};

	client.prototype.writeError = function (error) {
		this.write('%xt%e%-1%' + error + '%');
	};

	client.prototype.sendXt = function () {
		var args = Array.prototype.join.call(arguments, '%');
		this.write('%xt%' + args + '%');
	};

	
    client.prototype.setClient = function(data){
    self.ID = data.ID;
    self.user = data.user;
    self.coins = data.coins;
    self.rank = data.rank;
	self.moderator = data.moderator == 1 ? true : false;
    self.inventory = data.inventory ? JSON.parse(JSON.stringify(data.inventory)) : [];
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
	
	client.prototype.updateClothing = function(type, item){
	self.set(type, item)	
	var sql = 'UPDATE `users` SET ' + type + ' = ? WHERE `user` = ?';
    var query = connection.execute(sql, [item, self.user], function(err, result) {
    console.log("Updated item");
	if(err) return console.log(err);
    });
	}
	
	client.prototype.getInventory = function(){
	var test = self.inventory.split("%");
	return test.join("%");
    }
	
	client.prototype.delCoins = function(coins){
	var newCoins = (self.get('coins') - coins);
	var sql = 'UPDATE `users` SET coins = ? WHERE `user` = ?';
    var query = connection.execute(sql, [newCoins, self.user], function(err, result) {
    console.log("Subtracted the coins.");
	if(err) return console.log(err);
    });
	self.set('coins', newCoins);
	}
	
	client.prototype.addItem = function(item){
	 if(self.inventory.indexOf(item) == -1){
	   var sql = 'UPDATE `users` SET `inventory` = ' + 'concat(inventory, "%",' + item + ')' + 'WHERE `user` = ?';
	   var query = connection.execute(sql, [self.user], function(err, result) {
       console.log("Bought item.");
	   if(err) return console.log(err);
       });
       self.sendXt('ai', -1, item, self.get('coins'));
     }
     }  
	
};

module.exports = client;

