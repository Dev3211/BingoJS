var client = require('./client'),
    Crypto = require('./Crypto.js'),
    loginkey = Crypto.generateKey(),
    parseXml = require('xml2js').parseString,
    roomManager = require('./roomManager');

var self = {
    xtHandlers: {
        's': {
            'j#js': 'handleJoinServer',
            'u#h': 'handleHeartBeat',
            'i#gi': 'handleGetInventory',
            'm#sm': 'handleSendMessage',
            'j#jr': 'handleJoinRoom',
            'u#sp': 'handleSendPosition',
            'u#sb': 'handleSnowball',
			'u#se': 'handleEmote'
        }
    },
    addClient: function(client) {
        if (client) {
            self.clients.push(client);
        }
    },
    removeClient: function(socket) {
        for (var i in self.clients) {
            var client = self.clients[i];
            if (socket == client.socket) {
                console.log('Removing the client as the client disconnected.');
                self.clients.splice(i, 1);
                var roomManager = self.getRoomManager();
                roomManager.removeUser(client);
                socket.destroy();
            }
        }
    },
    getRoomManager: function() {
        return roomManager;
    },
    handleHeartBeat: function(data, client) {
        client.sendXt('h', -1);
    },
    handleraw: function(data, client) {
        var dataArr = data.split('%');
        dataArr.shift();

        var type = dataArr[1];
        var handler = dataArr[2];


        var method = self.xtHandlers[type][handler];

        if (typeof self[method] == 'function') {
            self[method](dataArr, client);
        } else {
            console.log('Unhandled packet received: ' + handler);
        }
    },

    handleVerChk: function(data, client) {
        client.write('<msg t="sys"><body action="apiOK" r="0"></body></msg>');
    },


    handleRndK: function(data, client) {
        client.set('randomKey', loginkey);
        client.write('<msg t="sys"><body action="rndK" r="-1"><k>' + loginkey + '</k></body></msg>');
    },

    handleJoinServer: function(data, client) {
        var timeStamp = Math.floor(new Date() / 1000);
        client.sendXt('js', -1, 0, 1, client.get('moderator') ? 1 : 0);
        client.sendXt('gps', -1, '');
        client.sendXt('lp', -1, client.buildPlayerString(), client.get('coins'), 0, 1440, timeStamp, timeStamp, 1000, 233, '', 7)
        self.handleJoinRoom({
            4: 100
        }, client);
    },

    handleJoinRoom: function(data, client) {
        var room = data[4];
        var x = data[5] ? data[5] : 0;
        var y = data[6] ? data[6] : 0;
        roomManager.removeUser(client);
        if (roomManager.roomExists(room)) {
            roomManager.addUser(room, client, [x, y]);
        } else {
            roomManager.addUser(100, client, [0, 0]);
        }
    },

    handleGetInventory: function(data, client) {
        client.sendXt('gi', -1, client.getInventory());
    },

    handleSendMessage: function(data, client) {
        var message = data[5];

        roomManager.sendXt(client.get('room'), ['sm', -1, client.get('ID'), message]);
    },

    handleSendPosition: function(data, client) {
        var x = data[4],
            y = data[5];
        client.set('x', x);
        client.set('y', y);
        roomManager.sendXt(client.get('room'), ['sp', -1, client.get('ID'), x, y]);
    },

    handleSnowball: function(data, client) {
        var x = data[4],
            y = data[5];
        roomManager.sendXt(client.get('room'), ['sb', -1, client.get('ID'), x, y]);
    },
	handleEmote: function(data, client) {
	    var emote = data[4];
	    roomManager.sendXt(client.get('room'), ['se', -1, client.get('ID'), x, y]);
    },
    clients: []
}
module.exports = self;