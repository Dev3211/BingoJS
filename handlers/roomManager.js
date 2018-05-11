var rooms = require("./crumbs/rooms");
var items = require("./crumbs/items");
var client = require('./client');

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
    if(self.clients.length > 0){
		client.sendXt('jr', -1, room, self.buildRoomString(room));
      } else {
        client.sendXt('jr', -1, room);
      }
  },
  removeUser: function(client){
    const index = self.clients.indexOf(client)
	if (index > -1) {
	 self.clients.splice(index, 1)
     self.sendXt('rp', -1, client.id)
    }
  },
  buildRoomString: function(room){
    let roomStr = ''
    for(const client of self.clients){
      roomStr += '%' + client.buildPlayerString();
    };
    return roomStr.substr(1);
  },
  sendXt: function(){
    const args = Array.prototype.join.call(arguments, '%')

    this.sendData(`%xt%${args}%`)
  },
  sendData: function(room, data){
   for (const client1 of self.clients) {
   client1.write(data)
   }
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
