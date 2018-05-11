var rooms = require("./crumbs/rooms");
var client = require('./client');

var self = {
  roomData: [],
  loadCrumbs: function(){
    for(var id in rooms){
      if(id < 900){
        self.roomData[id] = rooms[id];
        self.roomData[id]['users'] = [];
      }
    }
    console.log('Room manager loaded ' + self.roomData.length + ' rooms.');
  },
  addUser: function(room, client, coords){
    var x = coords[0], y = coords[1], internal = self.getInternal(room);
    self.roomData[room].users.push(client);
    client.set('room', room);
    client.set('x', x);
    client.set('y', y);
    self.sendXt(room, ['ap', -1, client.buildPlayerString()]);
    if(room > 900){
      // igloo
    } else {
      if(self.getCount(room) < 1){
        client.sendXt('jr', -1, room);
      } else {
        client.sendXt('jr', -1, room, self.buildRoomString(room));
      }
    }
  },
  getCount: function(room){
    var roomData = self.roomData[room].users;
    if(roomData){
      return roomData.length;
    } else {
      return 0;
    }
  },
  getUsers: function(room){
    var roomData = self.roomData[room].users;
    if(roomData){
      return roomData;
    } else {
      return [];
    }
  },
  removeUser: function(client){
    var room = client.get('room');
    if(room){
      var users = self.roomData[room].users;
      if(users.length !== 0){
        var index = users.indexOf(client);
        if(index > -1){
          users.splice(index, 1);
          self.sendXt(room, ['rp', -1, client.get('ID')]);
          self.roomData[room].users = users;
        }
      }
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
    var users = self.getUsers(room);
    users.forEach(function(user){
      user.write(data);
    });
  },
  getInternal: function(room){
    console.log(room);
    return self.roomData[room].Internal;
  },
  roomExists: function(room){
    return self.roomData[room] ? true : false;
  }
}

self.loadCrumbs();

module.exports = self;