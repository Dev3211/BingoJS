var rooms = require("./crumbs/rooms"),
    items = require("./crumbs/items"),
    furniture = require("./crumbs/furniture"),
    igloo = require("./crumbs/igloo"),
    igloofloor = require("./crumbs/igloofloor"),
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
            for (var id1 in items) {
                self.itemData[id1] = items[id1];
            }
            for (var id2 in furniture) {
                self.furnitureData[id2] = furniture[id2];
            }
            for (var id3 in furniture) {
                self.iglooData[id3] = igloo[id3];
            }
            for (var id4 in igloofloor) {
                self.iglooFloor[id4] = igloofloor[id4];
            }
            console.log('Room manager loaded ' + self.roomData.length + ' rooms.');
            console.log('Items loaded: ' + self.itemData.length);
            console.log('Furnitures loaded: ' + self.furnitureData.length);
            console.log('Igloos loaded: ' + self.iglooData.length);
            console.log('Igloos Floors loaded: ' + self.iglooFloor.length);
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
