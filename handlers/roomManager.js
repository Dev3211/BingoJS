var jf = require('jsonfile'),
    rooms = jf.readFileSync("./handlers/crumbs/rooms.json"),
    items = jf.readFileSync("./handlers/crumbs/items.json"),
    furniture = jf.readFileSync("./handlers/crumbs/furniture.json"),
    igloo = jf.readFileSync("./handlers/crumbs/igloo.json"),
    igloofloor = jf.readFileSync("./handlers/crumbs/igloofloor.json"),
    client = require('./client'),
    config = require('../config');
    error = require('./Errors.js');

var self = {
        roomData: [],
        itemData: [],
        furnitureData: [],
        iglooData: [],
        iglooFloor: [],
        clients: [],
        loadCrumbs: function() {
            for (var id in rooms) {
                if (id < 900) {
                    self.roomData[id] = rooms[id];
                }
            }
            
            console.log('Room manager loaded ' + self.roomData.length + ' rooms.');
            console.log('Items loaded: ' + Object.keys(items).length);
	        console.log('Furnitures loaded: ' + Object.keys(furniture).length);
	        console.log('Igloos loaded: ' + Object.keys(igloo).length);
	        console.log('Igloo floors loaded: ' + Object.keys(igloofloor).length);
        },
        addUser: function(room, client, coords) {
            let x = coords[0],
                y = coords[1],
                internal = self.getInternal(room);
            if (!x) x = 0
            if (!y) y = 0
            client.set('room', room);
            client.set('x', x);
            client.set('y', y);
            client.set('frame', 1);
            self.clients.push(client);
            self.sendXt(room, ['ap', -1, client.buildPlayerString()]);
            if (self.clients.length > self.roomData[room].MaxUsers) {
                client.write('%xt%e%-1%' + ROOM_FULL + '%');
            }
            if (self.clients.length > config.Servers.maxUsers) {
                client.write('%xt%e%-1%' + GAME_FULL + '%');
            }
            if (self.clients.length > 0) {
                client.sendXt('jr', -1, room, self.buildRoomString(room));
            } else {
                client.sendXt('jr', -1, room);
            }
        },
        getUsers: function(room) {
            var roomData = self.clients;
            if (roomData) {
                return roomData;
            } else {
                return [];
            }
        },
        removeUser: function(client) {
            const index = self.clients.indexOf(client)
            var room = client.get('room');
            if (index > -1) {
                var users = self.clients;
                self.clients.splice(index, 1)
                self.sendXt(room, ['rp', -1, client.get('ID')])
                self.clients = users;
            }
        },
