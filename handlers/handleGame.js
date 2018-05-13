var client = require('./client'),
    Crypto = require('./Crypto.js'),
    error = require('./Errors.js'),
    loginkey = Crypto.generateKey(),
    config = require("../config"),
    db = require('mysql2'),
    parseXml = require('xml2js').parseString,
    in_array = require('in_array'),
    itemCrumbs = jf.readFileSync('./handlers/crumbs/items.json'),
	furnitureCrumbs = jf.readFileSync('./handlers/crumbs/furniture.json'),
	iglooFloors = jf.readFileSync('./handlers/crumbs/igloofloor.json'),
	iglooCrumbs = jf.readFileSync('./handlers/crumbs/igloo.json'),
    roomManager = require('./roomManager');


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


var self = {
    openigloos: [],
    xtHandlers: {
        's': {
            'j#js': 'handleJoinServer',
            'u#h': 'handleHeartBeat',
            'i#gi': 'handleGetInventory',
            'u#gp': 'handleGetPlayer',
            'm#sm': 'handleSendMessage',
            'j#jr': 'handleJoinRoom',
            'j#jp': 'handleJoinPlayerRoom',
            'u#sp': 'handleSendPosition',
            'u#sb': 'handleSnowball',
            'u#se': 'handleEmote',
            'u#sf': 'handlesendFrame',
            'u#sa': 'handleAction',
            'u#sg': 'handleTour',
            'u#sj': 'handleJoke',
            'p#pg': 'Test',
            'u#ss': 'handleSafeMessage',
            'g#gm': 'handleGetActiveIgloo',
            'g#gr': 'handleLoadPlayerIglooList',
            'g#go': 'handlegetIgloos',
            'g#af': 'handleIglooFurniture',
            'g#gf': 'handlegetFurniture',
            'g#ur': 'handleSaveFurniture',
            'g#um': 'handleUpdateMusic',
            'g#or': 'handleOpenIgloo',
            'g#cr': 'handleCloseIgloo',
            'g#au': 'handleBuyIgloo',
            'g#ao': 'handleUpdateIgloo',
            'g#ag': 'handleUpdateIglooFloor',
            's#upc': 'handleUpdateClothing',
            's#uph': 'handleUpdateClothing',
            's#upf': 'handleUpdateClothing',
            's#upn': 'handleUpdateClothing',
            's#upb': 'handleUpdateClothing',
            's#upa': 'handleUpdateClothing',
            's#upe': 'handleUpdateClothing',
            's#upl': 'handleUpdateClothing',
            's#upp': 'handleUpdateClothing',
            'i#ai': 'handleAddItem'
        },
        'z': {
            'zo': 'handleGameOver'
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

    handleGetPlayer: function(data, client) {
        var ID = data[4];
        if (client.get('ID') !== ID) {
            return;
        }
        connection.execute("SELECT * FROM `users` WHERE `ID` = ?", [ID], function(error, result, fields) {
            if (result.length != 0) {
                const info = [result[0].ID, result[0].user, 1, result[0].color, result[0].head, result[0].face, result[0].neck, result[0].body, result[0].hand, result[0].feet, result[0].flag, result[0].photo];
                client.sendXt('gp', -1, info.join('|') + '|')
            }
        });
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

    handleJoinServer: function(data, client) {
        var timeStamp = Math.floor(new Date() / 1000);
        client.sendXt('js', -1, 0, 1, client.get('moderator') ? 1 : 0);
        client.sendXt('gps', -1, '');
        client.sendXt('lp', -1, client.buildPlayerString(), client.get('coins'), 0, 1440, Math.floor(new Date() / 1000), client.get('age'), 1000, 187, "", 7)

        self.handleJoinRoom({
            4: 100
        }, client);
    },

    handleJoinRoom: function(data, client) {
        var room = parseInt(data[4]);
        var x = data[5] ? data[5] : 0;
        var y = data[6] ? data[6] : 0;
        if (!x || isNaN(x)) x = 0
        if (!y || isNaN(y)) y = 0
        if (client.room) {
            roomManager.removeUser(client);
        }

        if (room > 900) {
            client.set('gamingroom', room);
            return client.sendXt('jg', -1, room)
        }
        if (roomManager.roomExists(room)) {
            roomManager.addUser(room, client, [x, y]);
        } else {
            roomManager.addUser(100, client, [0, 0]);
        }
    },

    handleJoinPlayerRoom: function(data, client) {
        var room = parseInt(data[4]);
        let x = parseInt(data[5])
        let y = parseInt(data[6])

        if (!x || isNaN(x)) x = 0
        if (!y || isNaN(y)) y = 0

        if (client.room) {
            roomManager.removeUser(client);
        }

        if (room < 1000) room += 1000

        if (!roomManager.getRoom(room)) {
            roomManager.createRoom(room)
        }

        var test = roomManager.getRoom(room)
        if (test) {
            roomManager.addUser(room, client, [x, y]);
        } else {
            console.log('nope');
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
        var x = parseInt(data[4]),
            y = parseInt(data[5]);
        client.set('x', x);
        client.set('y', y);
        roomManager.sendXt(client.get('room'), ['sp', -1, client.get('ID'), x, y]);
    },

    handleSnowball: function(data, client) {
        var x = parseInt(data[4]),
            y = parseInt(data[5]);
        roomManager.sendXt(client.get('room'), ['sb', -1, client.get('ID'), x, y]);
    },

    handleEmote: function(data, client) {
        var emote = data[4];
        roomManager.sendXt(client.get('room'), ['se', -1, client.get('ID'), emote]);
    },

    handlesendFrame: function(data, client) {
        var frame = parseInt(data[4]);
        roomManager.sendXt(client.get('room'), ['sf', -1, client.get('ID'), frame]);
    },

    handleUpdateClothing: function(data, client) {
        var item = parseInt(data[4]),
            type = data[2].substr(2);
        var inventory = client.get('inventory');
        var itemTypes = {
            'upc': 'color',
            'uph': 'head',
            'upf': 'face',
            'upn': 'neck',
            'upb': 'body',
            'upa': 'hand',
            'upe': 'feet',
            'upl': 'flag',
            'upp': 'photo'
        };
        if (itemTypes[type]) {
            roomManager.sendXt(client.get('room'), [type, -1, client.get('ID'), item]);
            client.updateClothing(itemTypes[type], item);
        } else {
            console.log('Item does not exist');
        }
    },

    handleAddItem: function(data, client) {
        var item = parseInt(data[4]);
        if (itemCrumbs[item]) {
            console.log('Adding item: ' + item);
            var cost = itemCrumbs[item].Cost;
            if (client.get('coins') < cost) {
                client.write('%xt%e%-1%' + NOT_ENOUGH_COINS + '%');
                return;
            }
            client.delCoins(cost);
            client.addItem(item);
        } else {
            client.write('%xt%e%-1%' + ITEM_DOES_NOT_EXIST + '%');
        }
    },

    handleIglooFurniture: function(data, client) {
        const furniture = parseInt(data[4])
        if (furnitureCrumbs[furniture]) {
            const itemCost = furnitureCrumbs[furniture].cost
            if (client.get('coins') < itemCost) return client.write('%xt%e%-1%' + NOT_ENOUGH_COINS + '%');
            client.delCoins(itemCost);
            return client.addFurniture(furniture)
        } else {
            client.write('%xt%e%-1%' + ITEM_DOES_NOT_EXIST + '%');
        }
    },

    handlegetFurniture: function(data, client) {
        return client.getFurniture();
    },

    handleAction: function(data, client) {
        var action = data[4];
        roomManager.sendXt(client.get('room'), ['sa', -1, client.get('ID'), action]);
    },

    handleTour: function(data, client) {
        var tour = data[4];
        roomManager.sendXt(client.get('room'), ['sg', -1, client.get('ID'), tour]);
    },

    handleJoke: function(data, client) {
        var joke = data[4];
        roomManager.sendXt(client.get('room'), ['sj', -1, client.get('ID'), joke]);
    },

    handleGetActiveIgloo: function(data, client) {
        var ID = parseInt(data[4]);
        if (client.get('ID') !== ID) {
            return;
        }
        connection.execute("SELECT ID FROM `users` WHERE `ID` = ?", [ID], function(error, result, fields) {
            if (result.length != 0) {
                var ID1 = client.get('ID');
                if (ID == ID1) {
                    connection.execute("SELECT * FROM `igloo` WHERE `OwnerID` = ?", [ID], function(error, result1, fields) {
                        var test = result1[0].Type;
                        var test1 = result1[0].Music;
                        var test2 = result1[0].Floor;
                        var test3 = result1[0].Furniture;
                        var test4 = result1[0].Locked;
                        client.sendXt('gm', -1, client.get('ID'), test, test1, test2, test3, test4);
                    });
                }
            }
        });
    },

    Test: function(data, client) {
        client.sendXt('pg', -1, 750);
    },

    handleGameOver: function(data, client) {
        var score = parseInt(data[4]);
        var nodivide = [916, 906, 905, 904, 912];
        var gameroom = client.get('gamingroom');
        if (gameroom > 1000) {
            return;
        }
        if (in_array(gameroom, nodivide)) {
            client.addCoins(score)
        } else if (score < 99999) {
            client.addCoins(Math.floor(score / 10))
        }
        client.sendXt('zo', -1, client.coins, 0, 0, 0, 0);
    },

    handleLoadPlayerIglooList: function(data, client) {
        if (self.openigloos.length == 0) {
            return client.sendXt('gr', -1);
        }

        if (Object.keys(self.openigloos).length == 0) {
            return client.sendXt('gr', -1);
        }

        var iglooList = [];

        for (var index in Object.keys(self.openigloos)) {
            var playerId = Object.keys(self.openigloos)[index];
            var playerNickname = self.openigloos[playerId];
            var iglooDetails = [playerId, playerNickname].join('|');
            iglooList.push(iglooDetails);
        }
        client.sendXt('gr', -1, iglooList.join('%'));

    },

    handlegetIgloos: function(data, client) {
        client.sendXt('go', -1, client.getIgloos());
    },

    handleSaveFurniture: function(data, client) {
        let furniture = data;

        let test1 = furniture.join(',').substr(13);

        if (furniture.length < 1) {
            var sql = "UPDATE `furnitures` set `FurnitureID` = ? WHERE `PlayerID` = ?";
            var query = connection.execute(sql, ["[]", self.ID], function(error, result) {
                if (error) return console.log(error);
            });
        }

        if (furniture.length > 99) {
            client.write('%xt%e%-1%' + MAX_IGLOO_FURNITURE + '%');
        }

        var sql = "UPDATE `igloo` set `Furniture` = ? WHERE `OwnerID` = ?";
        var query = connection.execute(sql, [test1, client.get('ID')], function(error, result) {
            if (error) return console.log(error);
        });
    },

    handleUpdateMusic: function(data, client) {
        var musicid = data[4];
        if (isNaN(musicid)) {
            return;
        }
        var sql = "UPDATE `igloo` set `Music` = ? WHERE `OwnerID` = ?";
        var query = connection.execute(sql, [musicid, client.get('ID')], function(error, result) {
            if (error) return console.log(error);
        });
    },

    handleOpenIgloo: function(data, client) {
        playerid = data[4];


        if (Number(playerid) !== client.get('ID')) {
            return;
        }

        self.openigloos[client.get('ID')] = client.get('user');
    },

    handleCloseIgloo: function(data, client) {
        playerid = data[4];
        if (Number(playerid) !== client.get('ID')) {
            return;
        }
        delete self.openigloos[client.get('ID')];
    },

    handleBuyIgloo: function(data, client) {
        var type = parseInt(data[4])
        if (iglooCrumbs[type]) {
            var cost = iglooCrumbs[type].cost
            if (client.get('coins') < cost) return client.write('%xt%e%-1%' + NOT_ENOUGH_COINS + '%');
            client.delCoins(cost);
            if (!isNaN(type)) return client.addIgloo(type)
        } else {
            client.write('%xt%e%-1%' + ITEM_DOES_NOT_EXIST + '%');
        }
    },

    handleUpdateIgloo: function(data, client) {
        const igloo = parseInt(data[4])
        if (!isNaN(igloo)) return client.updateIgloo(igloo);
    },

    handleUpdateIglooFloor: function(data, client) {
        const floor = parseInt(data[4])
        if (iglooFloors[floor]) {
            var cost = iglooFloors[floor].cost
            if (client.get('coins') < cost) return client.write('%xt%e%-1%' + NOT_ENOUGH_COINS + '%');
            client.delCoins(cost);
            if (!isNaN(floor)) return client.addFloor(floor)
        } else {
            client.write('%xt%e%-1%' + ITEM_DOES_NOT_EXIST + '%');
        }
    },

    clients: []
}
module.exports = self;
