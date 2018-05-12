"use strict";

var crypto = require("crypto");
var md5 = require('md5');

class Crypto {
	
	static generateMD5 (param1) {
		var hash = crypto.createHash('md5').update(param1).digest('hex');
		return hash;
	}
	
    static generateKey (){
    var key = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#';
    for(var i = 0; i < 12; i++){
      var rand = Math.floor(Math.random() * chars.length);
      key += chars.charAt(rand);
    }
    return key;
  }

    static swapHash (hash){
    var swap = hash.substr(16, 16) + hash.substr(0, 16);;
    return swap;
    }
  
  
   static encryptPassword (pass, key){
    var encrypt = Crypto.swapHash(pass) + key;
    encrypt += 'Y(02.>\'H}t":E1';
    encrypt = Crypto.generateMD5(encrypt);
    return Crypto.swapHash(encrypt);
  }
  

}

module.exports = Crypto;
