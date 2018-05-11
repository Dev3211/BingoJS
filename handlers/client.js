"use strict";


var client = function (socket) {
	var self = this;
	
	this.socket = socket;
	this.data = [];
	this.randomKey = "";
	this.x = 0;
	this.y = 0;
	this.frame = 1;

	client.prototype.writeLogin = function (error) {
		tcp.send.login(error);
	};

	client.prototype.writeGame = function (error) {
		tcp.send.game(error);
	};
	
	client.prototype.get = function (get) { 
        return this[get];
	};
	
	client.prototype.set = function (set, value) { 
    return this[set] = value;
	};

	client.prototype.write = function (data) {
		if (this.socket) {
			this.socket.write(data + '\0');
			console.log('Outgoing data: ' + data.toString());
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


	client.prototype.writeByte = function (byte) {
		return this.data.push(byte);
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
	
	client.prototype.getInventory = function(){
	var args = Array.prototype.slice.call(self.inventory);
    return args.join('%');
    }
};

module.exports = client;
