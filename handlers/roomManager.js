var rooms = require("./crumbs/rooms"),
    items = require("./crumbs/items"),
    client = require('./client'),
    error = require('./Errors.js');

var self = {
  roomData: [],
  itemData: [],
  clients: [],
  loadCrumbs: function(){
    for(var id in rooms){
      if(id < 900){
        self.roomData[id] = rooms[id];
      }
    }
	for(var id1 in items){
        self.itemData[id1] = items[id1];
      }
    console.log('Room manager loaded ' + self.roomData.length + ' rooms.');
	console.log('Items loaded: ' + self.itemData.length);
  },
  addUser: function(room, client, coords){
    let x = coords[0], y = coords[1], internal = self.getInternal(room);
	if (!x) x = 0
    if (!y) y = 0
	client.set('room', room);
    client.set('x', x);
    client.set('y', y);
	client.set('frame', 1);
	self.clients.push(client);
    self.sendXt(room, ['ap', -1, client.buildPlayerString()]);
	if(self.clients.length > self.roomData[room].MaxUsers){
	 client.write('%xt%e%-1%' + ROOM_FULL + '%');
    }
    if(self.clients.length > 0){
		client.sendXt('jr', -1, room, self.buildRoomString(room));
      } else {
        client.sendXt('jr', -1, room);
      }
  },
  getUsers: function(room){
    var roomData = self.clients;
    if(roomData){
      return roomData;
    } else {
      return [];
    }
  },
  removeUser: function(client){
    const index = self.clients.indexOf(client)
	var room = client.get('room');
	if (index > -1) {
	 var users = self.clients;
	 self.clients.splice(index, 1)
     self.sendXt(room, ['rp', -1, client.get('ID')])
	 self.clients = users;
    }
  },
  buildRoomString: function(room){
   var users = self.getUsers(room), roomStr = '';
    users.forEach(function(user){
      roomStr += '%' + user.buildPlayerString();
    });
   return roomStr.substr(1);
  },
  sendXt: function(room, data){
  self.sendData(room, '%xt%' + data.join('%') + '%');
  },
  sendData: function(room, data){
  var users = self.clients;
  users.forEach(function(user){
  user.write(data);
  });
  },
  getInternal: function(room){
    return self.roomData[room].Internal;
  },
  createRoom: function(id){
  if(!self.roomData[id]){
  return self.roomData[id] = id;
  }
  },
  getRoom: function (id) {
   if (self.roomData[id]) return self.roomData[id];
  },
  roomExists: function(room){
    return self.roomData[room] ? true : false;
	console.log(room)
  }
}

self.loadCrumbs();

module.exports = self;
